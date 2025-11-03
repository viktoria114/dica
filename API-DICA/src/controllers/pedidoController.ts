import { Request, Response } from 'express';
import { PoolClient } from 'pg';
import { pool } from '../config/db';
import { Pedido } from '../models/pedido';
import { descargarImagen, subirADropbox } from '../utils/image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// queryParts.ts
export const PEDIDO_FIELDS = `
  p.id AS pedido_id,
  p.id_cliente,
  p.ubicacion,
  p.observaciones,
  p.id_estado,
  p.fecha,
  p.hora,
  
  -- Detalle de items del menú
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id_menu', m.id,
        'nombre', m.nombre,
        'precio_unitario', m.precio,
        'cantidad', pm.cantidad,
        'subtotal', (m.precio * pm.cantidad)
      )
    ) FILTER (WHERE pm.fk_menu IS NOT NULL),
    '[]'
  ) AS items,

  -- Detalle de promociones
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id_promocion', pr.id,
        'nombre', pr.nombre,
        'precio_unitario', pr.precio,
        'cantidad', pp.cantidad,
        'subtotal', (pr.precio * pp.cantidad)
      )
    ) FILTER (WHERE pp.id_promocion IS NOT NULL),
    '[]'
  ) AS promociones,

  -- Totales
  COALESCE(SUM(m.precio * pm.cantidad), 0) AS precio_por_items,
  COALESCE(SUM(pr.precio * pp.cantidad), 0) AS precio_por_promociones,
  COALESCE(SUM(m.precio * pm.cantidad), 0) + COALESCE(SUM(pr.precio * pp.cantidad), 0) AS precio_total
`;

export const crearPedido = async (req: Request, res: Response) => {
  const client: PoolClient = await pool.connect();
  try {
    const {
      fk_cliente = null,
      ubicacion = null,
      observacion = null,
      items_menu = [],
    } = req.body;
    const rol = (req as any).rol;
    let dni_empleado = (req as any).dni;

    // 🚨 Validación: Si es agente, verificar si ya existe un pedido activo en estado 6 o 7
    if (rol === 'agente' && fk_cliente) {
      const validacionQuery = `
        SELECT id, id_estado
        FROM pedidos 
        WHERE id_cliente = $1 
        AND id_estado IN (6,7)
        AND visibilidad = true
        LIMIT 1;
      `;
      const { rows: pedidosExistentes } = await client.query(validacionQuery, [
        fk_cliente,
      ]);

      if (pedidosExistentes.length > 0) {
        const { id_estado } = pedidosExistentes[0];

        let mensaje;
        if (id_estado === 6) {
          mensaje =
            'El cliente ya cuenta con un carrito activo. Usa la herramienta correspondiente para obtener informacion';
        } else if (id_estado === 7) {
          mensaje =
            'El cliente tiene un pedido pendiente de confirmación. No puedes crear uno nuevo. Hay que esperar que un empleado lo acepte.';
        }

        return res.status(400).json({ message: mensaje });
      }
    }

    // 🔹 Validar items_menu solo si viene con datos
    if (items_menu && items_menu.length > 0) {
      for (const item of items_menu) {
        if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
          return res.status(400).json({
            message: `La cantidad para el ítem con id_menu=${item.id_menu} debe ser mayor a 0`,
          });
        }
      }
    }

    await client.query('BEGIN');

    // 🔹 Validación de stock solo si hay items
    if (items_menu && items_menu.length > 0) {
      for (const item of items_menu) {
        const ingredientesQuery = `
          SELECT ms.fk_stock, ms.cantidad_necesaria
          FROM menu_stock ms
          WHERE ms.fk_menu = $1;
        `;
        const { rows: ingredientes } = await client.query(ingredientesQuery, [
          item.id_menu,
        ]);

        for (const ing of ingredientes) {
          const totalNecesario = ing.cantidad_necesaria * item.cantidad;

          // Stock principal
          const stockQuery = `SELECT stock_actual FROM stock WHERE id = $1`;
          const { rows: stockRows } = await client.query(stockQuery, [
            ing.fk_stock,
          ]);

          if (stockRows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
              message: `No existe el stock con id=${ing.fk_stock} para el menú ${item.id_menu}`,
            });
          }

          if (stockRows[0].stock_actual < totalNecesario) {
            await client.query('ROLLBACK');
            return res.status(400).json({
              message: `Stock insuficiente para el ingrediente ${ing.fk_stock} en el menú ${item.id_menu}`,
            });
          }

          // Registro_stock FIFO
          const registrosQuery = `
            SELECT id, cantidad_actual
            FROM registro_stock
            WHERE fk_stock = $1 AND cantidad_actual > 0
            ORDER BY fk_fecha ASC;
          `;
          const { rows: registros } = await client.query(registrosQuery, [
            ing.fk_stock,
          ]);

          let disponible = registros.reduce(
            (acc, r) => acc + r.cantidad_actual,
            0,
          );
          if (disponible < totalNecesario) {
            await client.query('ROLLBACK');
            return res.status(400).json({
              message: `Stock insuficiente (registro_stock) para el ingrediente ${ing.fk_stock} en el menú ${item.id_menu}`,
            });
          }
        }
      }
    }

    // 🔹 Estado inicial depende del rol
    let estadoInicial = 1; // pendiente
    if (rol === 'agente') {
      estadoInicial = 6; // en construccion
      dni_empleado = null;
    }

    // Crear pedido
    const pedidoQuery = `
      INSERT INTO pedidos (fecha, hora, id_estado, id_cliente, ubicacion, observaciones, visibilidad)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `;
    const { rows: pedidoRows } = await client.query(pedidoQuery, [
      new Date(),
      new Date().toLocaleTimeString(),
      estadoInicial,
      fk_cliente, // Puede ir null
      ubicacion, // Puede ir null
      observacion, // Puede ir null
      true,
    ]);

    const pedidoId = pedidoRows[0].id;

    // Registro de estado
    const registroEstadoQuery = `
      INSERT INTO registro_de_estados (id_pedido, id_estado, id_fecha, hora, dni_empleado)
      VALUES ($1, $2, $3, $4, $5);
    `;
    await client.query(registroEstadoQuery, [
      pedidoId,
      estadoInicial,
      new Date(),
      new Date().toLocaleTimeString(),
      dni_empleado,
    ]);

    // Insertar ítems solo si hay
    if (items_menu && items_menu.length > 0) {
      const pedido_menuQuery = `
        INSERT INTO pedidos_menu (fk_pedido, fk_menu, precio_unitario, cantidad)
        VALUES ($1, $2, $3, $4);
      `;

      for (const item of items_menu) {
        const result = await client.query(
          'SELECT precio FROM menu WHERE id = $1',
          [item.id_menu],
        );
        const precioUnitario = result.rows[0].precio;

        await client.query(pedido_menuQuery, [
          pedidoId,
          item.id_menu,
          precioUnitario,
          item.cantidad,
        ]);
      }
    }

    await client.query('COMMIT');
    if (rol === 'agente') {
      return res.status(200).json({
        id: pedidoId,
        message:
          'Pedido creado con exito. Debes esperar que un empleado lo revise y acepte',
      });
    }
    res.status(201).json({ id: pedidoId, message: 'Pedido creado con éxito' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error al crear el pedido' });
  } finally {
    client.release();
  }
};

export const actualizarPedido = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      fk_empleado,
      fk_cliente,
      fk_estado,
      fecha,
      hora,
      ubicacion,
      observacion,
      items = [],
      promociones = [],
    } = req.body;

    await client.query('BEGIN');

    // 1️⃣ Actualizar los datos generales del pedido
    const updateQuery = `
      UPDATE pedidos
      SET id_estado = $1,
          id_cliente = $2,
          ubicacion = $3,
          observaciones = $4,
          fecha = $5,
          hora = $6
      WHERE id = $7
      RETURNING *;
    `;
    const { rows } = await client.query(updateQuery, [
      fk_estado,
      fk_cliente,
      ubicacion,
      observacion,
      fecha,
      hora,
      id,
    ]);

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // 2️⃣ Borrar ítems y promociones actuales
    await client.query(`DELETE FROM pedidos_menu WHERE fk_pedido = $1`, [id]);
    await client.query(`DELETE FROM pedidos_promociones WHERE id_pedido = $1`, [id]);

    // 3️⃣ Insertar nuevos ítems del menú
    const insertMenuQuery = `
      INSERT INTO pedidos_menu (fk_pedido, fk_menu, precio_unitario, cantidad)
      VALUES ($1, $2, $3, $4);
    `;
    const itemsAgregados: any[] = [];

    for (const item of items) {
      if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          message: `Cantidad inválida para id_menu=${item.id_menu}`,
        });
      }

      const precioRes = await client.query('SELECT id, nombre, precio FROM menu WHERE id = $1', [item.id_menu]);
      if (precioRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `El menú con id=${item.id_menu} no existe` });
      }

      const { id: id_menu, nombre, precio } = precioRes.rows[0];
      await client.query(insertMenuQuery, [id, id_menu, precio, item.cantidad]);

      itemsAgregados.push({ id_menu, nombre, cantidad: item.cantidad });
    }

    // 4️⃣ Insertar nuevas promociones
    const insertPromoQuery = `
      INSERT INTO pedidos_promociones (id_pedido, id_promocion, cantidad)
      VALUES ($1, $2, $3);
    `;
    const promocionesAgregadas: any[] = [];

    for (const promo of promociones) {
      if (!Number.isInteger(promo.cantidad) || promo.cantidad <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          message: `Cantidad inválida para id_promocion=${promo.id_menu}`,
        });
      }

      const precioRes = await client.query('SELECT id, nombre, precio FROM promociones WHERE id = $1', [promo.id_menu]);
      if (precioRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `La promoción con id=${promo.id_menu} no existe` });
      }

      const { id: id_promocion, nombre} = precioRes.rows[0];
      await client.query(insertPromoQuery, [id, id_promocion, promo.cantidad]);

      promocionesAgregadas.push({ id_promocion, nombre, cantidad: promo.cantidad });
    }

    await client.query('COMMIT');

    res.json({
      message: 'Pedido actualizado con éxito',
      pedido: rows[0],
      items: itemsAgregados,
      promociones: promocionesAgregadas,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el Pedido' });
  } finally {
    client.release();
  }
};


export const getListaPedidos = async (_req: Request, res: Response) => {
  try {
    const query = `
  SELECT
    ${PEDIDO_FIELDS}
  FROM pedidos p
  LEFT JOIN pedidos_menu pm ON p.id = pm.fk_pedido
  LEFT JOIN menu m ON m.id = pm.fk_menu
  LEFT JOIN pedidos_promociones pp ON p.id = pp.id_pedido
  LEFT JOIN promociones pr ON pr.id = pp.id_promocion
  WHERE p.visibilidad = true
  GROUP BY p.id
  ORDER BY p.id ASC;
`;

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los Pedidos visible' });
  }
};

export const getListaPedidosPorTelefono = async (
  req: Request,
  res: Response,
) => {
  const { telefono } = req.params;

  try {
    // Buscar pedidos del cliente con nombre del estado
    const pedidosQuery = `
      SELECT ${PEDIDO_FIELDS}, e.nombre AS estado_nombre
      FROM pedidos p
      LEFT JOIN pedidos_menu pm ON p.id = pm.fk_pedido
      LEFT JOIN menu m ON m.id = pm.fk_menu
      LEFT JOIN pedidos_promociones pp ON p.id = pp.id_pedido
      LEFT JOIN promociones pr ON pr.id = pp.id_promocion
      JOIN estados e ON e.id = p.id_estado
      WHERE p.id_cliente = $1
        AND p.id_estado NOT IN (6,8,9)
        GROUP BY p.id, e.nombre
  ORDER BY p.id ASC;
    `;
    const pedidosResult = await pool.query(pedidosQuery, [telefono]);

    if (pedidosResult.rows.length === 0) {
      return res
        .status(200)
        .json({ message: 'El cliente no tiene pedidos asignados' });
    }

    const menuQuery = `
      SELECT m.nombre, pm.cantidad, pm.precio_unitario AS precio_item
      FROM pedidos_menu pm
      INNER JOIN menu m ON m.id = pm.fk_menu
      WHERE pm.fk_pedido = $1; 
    `;

    const menuResult = await pool.query(menuQuery, [pedidosResult.rows[0].id]);

    // Devolver pedidos con estado_nombre ya incorporado
    res.json({ order: pedidosResult.rows, items: menuResult.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los pedidos' });
  }
};

export const getPedidosEnConstruccion = async (req: Request, res: Response) => {
  try {
    const { tel } = req.params;

    const query = `
      SELECT p.id AS cart_id, m.nombre, pm.precio_unitario as precio_item, pm.cantidad
      FROM pedidos p
      LEFT JOIN pedidos_menu pm ON p.id = pm.fk_pedido 
      LEFT JOIN menu m ON pm.fk_menu = m.id
      WHERE p.id_estado = 6 AND p.id_cliente = $1;
    `;

    const result = await pool.query(query, [tel]);

    if (result.rows.length === 0) {
      return res.status(200).json({
        message: 'Actualmente el cliente no cuenta con un carrito activo',
      });
    }

    const { cart_id } = result.rows[0];
    const items = result.rows
      .filter((row) => row.menuid !== null)
      .map(({ nombre, precio_item, cantidad }) => ({
        nombre,
        precio_item,
        cantidad,
      }));

    let total = 0;
    for (const item of items) {
      total += item.precio_item;
    }

    res.status(200).json({ cartID: cart_id, items, PrecioTotal: total });
  } catch (err: any) {
    console.error(err);
    res.status(500).json('Error al obtener el carrito activo del cliente');
  }
};

export const getPedidosPorConfirmar = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
    SELECT 
    p.id AS pedido_id,
    p.id_cliente,
    p.ubicacion,
    p.observaciones,
    p.id_estado,
    -- Items asociados
    COALESCE(
      json_agg(
        DISTINCT jsonb_build_object(
          'fk_menu', pm.fk_menu,
          'cantidad', pm.cantidad
        )
      ) FILTER (WHERE pm.fk_menu IS NOT NULL),
      '[]'
    ) AS items,
    -- Promociones asociadas
    COALESCE(
      json_agg(
        DISTINCT jsonb_build_object(
          'fk_promocion', pp.id_promocion,
          'cantidad', pp.cantidad
        )
      ) FILTER (WHERE pp.id_promocion IS NOT NULL),
      '[]'
    ) AS promociones
    FROM pedidos p
    LEFT JOIN pedidos_menu pm ON p.id = pm.fk_pedido
    LEFT JOIN pedidos_promociones pp ON p.id = pp.id_pedido 
    WHERE id_estado = 7`);
    res.status(200).json(rows);
  } catch (err: any) {
    console.log(err);
    res.status(500).json('error al obtener los pedidos por confirmar');
  }
};

export const eliminarPedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
            UPDATE pedidos
            SET visibilidad = false
            WHERE id = $1
            RETURNING *;
        `;

    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.json({ message: 'Pedido ocultado correctamente', pedido: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al ocultar el Pedido' });
  }
};

export const getListaCompletaPedidos = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT ${PEDIDO_FIELDS} FROM pedidos P
      LEFT JOIN pedidos_menu pm ON p.id = pm.fk_pedido
      LEFT JOIN menu m ON m.id = pm.fk_menu
      LEFT JOIN pedidos_promociones pp ON p.id = pp.id_pedido
      LEFT JOIN promociones pr ON pr.id = pp.id_promocion
      WHERE p.visibilidad = false
      GROUP BY p.id
      ORDER BY p.id ASC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los pedidos' });
  }
};

export const restaurarPedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
            UPDATE pedidos
            SET visibilidad = true
            WHERE id = $1
            RETURNING *;
        `;

    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.json({ message: 'Pedido restaurado correctamente', menu: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al restaurar el Pedido' });
  }
};

//Logica de negocio

export const agregarItemPedido = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { items_menu } = req.body;
    const pedidoId = id;

    // Validar que las cantidades sean correctas
    for (const item of items_menu) {
      if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
        return res.status(400).json({
          message: `La cantidad para el ítem con id_menu=${item.id_menu} debe ser mayor a 0`,
        });
      }
    }

    await client.query('BEGIN'); // Iniciamos transacción

    // 1. Borrar todos los items actuales del pedido
    await client.query(`DELETE FROM pedidos_menu WHERE fk_pedido = $1`, [
      pedidoId,
    ]);

    // 2. Insertar los nuevos items
    const pedido_menuQuery = `
      INSERT INTO pedidos_menu (fk_pedido, fk_menu, precio_unitario, cantidad)
      VALUES ($1, $2, $3, $4);
    `;

    for (const item of items_menu) {
      const result = await client.query(
        'SELECT precio FROM menu WHERE id = $1',
        [item.id_menu],
      );
      const precioUnitario = result.rows[0].precio;
      const precioTotal = precioUnitario * item.cantidad;

      await client.query(pedido_menuQuery, [
        pedidoId,
        item.id_menu,
        precioTotal,
        item.cantidad,
      ]);
    }

    await client.query('COMMIT'); // Confirmamos todo

    res.status(201).json({
      id: pedidoId,
      message: 'Items reemplazados con éxito',
    });
  } catch (error) {
    await client.query('ROLLBACK'); // Si hay error, revertimos todo
    console.error(error);
    res.status(500).json({ message: 'Error al reemplazar items del pedido' });
  } finally {
    client.release();
  }
};

export const agregarUnItemPedido = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // id del pedido
    const { tel, id_menu, cantidad } = req.body; // un solo ítem
    const pedidoId = id;

    await client.query('BEGIN'); // Iniciamos transacción

    //verificar si existe un pedido "en construccion" para el cliente
    const exists = await client.query(
      'SELECT * FROM pedidos WHERE id = $1 AND id_cliente = $2 AND id_estado = 6',
      [pedidoId, tel],
    );
    if (exists.rows.length === 0) {
      return res
        .status(404)
        .json(
          `No existe un carrito con id: ${pedidoId} para el cliente: ${tel}. Considera crear uno nuevo`,
        );
    }

    // Validar que la cantidad sea correcta
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return res.status(400).json({
        message: `La cantidad para el ítem con id_menu=${id_menu} debe ser mayor a 0`,
      });
    }

    // Buscar precio del menú
    const result = await client.query('SELECT precio FROM menu WHERE id = $1', [
      id_menu,
    ]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: `El menú con id=${id_menu} no existe`,
      });
    }

    //calcular precio unitario
    const precio = result.rows[0].precio;
    const precioUnitario = precio * cantidad;

    //verificar si ya existe un item de pedidos_menu para ese pedido
    const entry_pedidos_menu = await client.query(
      'SELECT id FROM pedidos_menu WHERE fk_menu = $1 AND fk_pedido = $2',
      [id_menu, pedidoId],
    );

    let itemAgregado;

    //si no existe
    if (entry_pedidos_menu.rows.length === 0) {
      //Insertar el nuevo ítem al pedido
      const pedido_menuQuery = `
        INSERT INTO pedidos_menu (fk_pedido, fk_menu, precio_unitario, cantidad)
        VALUES ($1, $2, $3, $4)
        RETURNING fk_pedido AS cartID, fk_menu AS menuID, cantidad, precio_unitario AS precio_item;
      `;

      itemAgregado = await client.query(pedido_menuQuery, [
        pedidoId,
        id_menu,
        precioUnitario,
        cantidad,
      ]);
    } else {
      const pedido_menuID = entry_pedidos_menu.rows[0].id;

      //si existe, se actualizan las cantidades anteriores
      itemAgregado = await client.query(
        `
        UPDATE pedidos_menu
        SET precio_unitario = precio_unitario + $1, cantidad = cantidad + $2
        WHERE id = $3
        RETURNING fk_pedido AS cartID, fk_menu AS menuID, cantidad, precio_unitario AS precio_item;
        `,
        [precioUnitario, cantidad, pedido_menuID],
      );
    }

    await client.query('COMMIT'); // Confirmamos todo

    res.status(200).json({
      message: 'Ítem agregado con éxito',
      carrito: itemAgregado.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK'); // Si hay error, revertimos todo
    console.error(error);
    res.status(500).json({ message: 'Error al agregar ítem al pedido' });
  } finally {
    client.release();
  }
};

export const eliminarUnItemPedido = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // id del pedido
    const { tel, id_menu, cantidad } = req.body; // ítem a quitar
    const pedidoId = id;

    //respuesta del estado del pedido
    let itemActualizado;

    // Verificar que exista un pedido en construcción para el cliente
    const exists = await client.query(
      'SELECT * FROM pedidos WHERE id = $1 AND id_cliente = $2 AND id_estado = 6',
      [pedidoId, tel],
    );
    if (exists.rows.length === 0) {
      return res.status(200).json({
        message: `No existe un carrito con id: ${pedidoId} para el cliente: ${tel}. Considera crear uno nuevo`,
      });
    }

    // Validar que la cantidad sea correcta
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return res.status(200).json({
        message: `La cantidad a quitar para el ítem con id_menu=${id_menu} debe ser mayor a 0`,
      });
    }

    await client.query('BEGIN');

    // Verificar si el ítem existe en el pedido
    const entry = await client.query(
      'SELECT id, cantidad, precio_unitario FROM pedidos_menu WHERE fk_pedido = $1 AND fk_menu = $2',
      [pedidoId, id_menu],
    );

    if (entry.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        message: `El ítem con id_menu=${id_menu} no existe en el pedido ${pedidoId}`,
      });
    }

    const item = entry.rows[0];

    if (item.cantidad <= cantidad) {
      // Si la cantidad a quitar es igual o mayor, borramos el ítem
      await client.query('DELETE FROM pedidos_menu WHERE id = $1', [item.id]);
    } else {
      // Si la cantidad es menor, actualizamos restando
      itemActualizado = await client.query(
        `UPDATE pedidos_menu
         SET cantidad = cantidad - $1,
             precio_unitario = precio_unitario - $2
         WHERE id = $3
         RETURNING fk_pedido AS cartID, fk_menu as menuID, cantidad, precio_unitario AS precio_item;`,
        [cantidad, (item.precio_unitario / item.cantidad) * cantidad, item.id],
      );
    }

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Ítem quitado con éxito',
      carrito: itemActualizado?.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error al quitar ítem del pedido' });
  } finally {
    client.release();
  }
};

export const eliminarItemsPedido = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body; // Array con los ids de los items a eliminar

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: 'Debes enviar un array con los IDs a eliminar' });
    }

    // Generamos placeholders ($1, $2, $3, ...)
    const placeholders = ids.map((_, index) => `$${index + 1}`).join(', ');

    const query = `
            DELETE FROM pedidos_menu
            WHERE id IN (${placeholders})
            RETURNING *;
        `;

    const { rows } = await pool.query(query, ids);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'No se encontraron items con esos IDs' });
    }

    res.json({ message: 'Items eliminados correctamente', eliminados: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar los items' });
  }
};

//vacia todos los items del pedido "en construccion" del cliente
export const vaciarItemsPedido = async (req: Request, res: Response) => {
  try {
    const { tel } = req.params;

    let query = `
            SELECT id FROM pedidos
            WHERE id_cliente = $1 AND id_estado = 6
        `;

    const result = await pool.query(query, [tel]);

    if (result.rows.length === 0) {
      return res.json('No hay un carrito asociado, considera crear uno nuevo');
    }

    const id_pedido = result.rows[0].id;

    query = `
            DELETE FROM pedidos_menu
            WHERE fk_pedido = $1
            RETURNING *;
        `;
    const { rows } = await pool.query(query, [id_pedido]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'No se encontraron items de este carrito' });
    }

    res.json({ message: 'Carrito vaciado correctamente', eliminados: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar los items' });
  }
};

export const getItemPedido = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const query = `SELECT * FROM pedidos_menu WHERE fk_pedido= $1 ORDER BY id ASC;`;
    const { rows } = await pool.query(query, [id]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los Pedidos visible' });
  }
};

export const actualizarEstadoPedido = async (req: Request, res: Response) => {
  const { id } = req.params;
  const rol = (req as any).rol;
  const dni_empleado = (req as any).dni;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const pedidoQuery = `
      SELECT id_estado 
      FROM pedidos
      WHERE id = $1;
    `;
    const { rows } = await client.query(pedidoQuery, [id]);

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const estadoActual = rows[0].id_estado;

    if (estadoActual === 5) {
      await client.query('ROLLBACK');
      return res
        .status(400)
        .json({ message: 'El pedido ya está en el último estado' });
    }

    // Definir transiciones válidas por rol
    const transiciones: Record<string, Record<number, number>> = {
      cajero: { 7: 1, 3: 5 },
      cocinero: { 1: 2, 2: 3 },
      repartidor: { 3: 4, 4: 5 },
      admin: { 6: 7, 7: 1, 1: 2, 2: 3, 3: 4, 4: 5 },
    };

    const nuevaTransicion = transiciones[rol]?.[estadoActual];

    if (!nuevaTransicion) {
      await client.query('ROLLBACK');
      return res
        .status(403)
        .json({ message: 'No tienes permisos para cambiar este estado' });
    }

    // 👉 Si el cambio es de 2 -> 3, descontamos stock
    if (estadoActual === 2 && nuevaTransicion === 3) {
      const ingredientesQuery = `
        SELECT ms.fk_stock, ms.cantidad_necesaria, pm.cantidad AS cantidad_pedida
        FROM pedidos_menu pm
        JOIN menu_stock ms ON pm.fk_menu = ms.fk_menu
        WHERE pm.fk_pedido = $1;
      `;
      const { rows: ingredientes } = await client.query(ingredientesQuery, [
        id,
      ]);

      for (const ing of ingredientes) {
        let descuento = ing.cantidad_necesaria * ing.cantidad_pedida;

        // 🔹 Descontar del stock principal
        const updateStockQuery = `
          UPDATE stock
          SET stock_actual = stock_actual - $1
          WHERE id = $2;
        `;
        await client.query(updateStockQuery, [descuento, ing.fk_stock]);

        // 🔹 Descontar del registro_stock (FIFO)
        while (descuento > 0) {
          const registroQuery = `
            SELECT id, cantidad_actual
            FROM registro_stock
            WHERE fk_stock = $1 AND cantidad_actual > 0
            ORDER BY fk_fecha ASC
            LIMIT 1;
          `;
          const { rows: registros } = await client.query(registroQuery, [
            ing.fk_stock,
          ]);

          if (registros.length === 0) {
            throw new Error(
              `No hay suficiente stock en registro_stock para el ingrediente ${ing.fk_stock}`,
            );
          }

          const registro = registros[0];
          const cantidadDisponible = registro.cantidad_actual;

          if (cantidadDisponible >= descuento) {
            // Se descuenta todo del mismo registro
            const updateRegistro = `
              UPDATE registro_stock
              SET cantidad_actual = cantidad_actual - $1
              WHERE id = $2;
            `;
            await client.query(updateRegistro, [descuento, registro.id]);
            descuento = 0;
          } else {
            // Se descuenta lo que queda y seguimos con el siguiente registro
            const updateRegistro = `
              UPDATE registro_stock
              SET cantidad_actual = 0
              WHERE id = $1;
            `;
            await client.query(updateRegistro, [registro.id]);
            descuento -= cantidadDisponible;
          }
        }
      }
    }

    // Actualizamos el pedido al nuevo estado
    const updateQuery = `
      UPDATE pedidos
      SET id_estado = $1
      WHERE id = $2
      RETURNING *;
    `;
    const { rows: updatedRows } = await client.query(updateQuery, [
      nuevaTransicion,
      id,
    ]);

    // Insertamos el registro en "registro_de_estados"
    const insertRegistroQuery = `
      INSERT INTO registro_de_estados (id_pedido, id_estado, id_fecha, hora, dni_empleado)
      VALUES ($1, $2, CURRENT_DATE, CURRENT_TIME, $3)
    `;
    await client.query(insertRegistroQuery, [
      id,
      nuevaTransicion,
      dni_empleado,
    ]);

    await client.query('COMMIT');

    res.json({
      message: 'Estado actualizado correctamente',
      pedido: updatedRows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar Estado' });
  } finally {
    client.release();
  }
};

export const retrocederEstadoPedido = async (req: Request, res: Response) => {
  const { id } = req.params;
  const rol = (req as any).rol;
  const client = await pool.connect();
  const dni_empleado = (req as any).dni;

  try {
    await client.query('BEGIN');

    const pedidoQuery = `
      SELECT id_estado 
      FROM pedidos
      WHERE id = $1;
    `;
    const { rows } = await client.query(pedidoQuery, [id]);

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const estadoActual = rows[0].id_estado;

    if (estadoActual === 6) {
      await client.query('ROLLBACK');
      return res
        .status(400)
        .json({ message: 'El pedido ya está en el primer estado' });
    }

    const retrocesos: Record<string, Record<number, number>> = {
      admin: { 5: 4, 4: 3, 3: 2, 2: 1, 1: 7, 7: 6 },
      repartidor: { 5: 4, 4: 3 },
      cocinero: { 3: 2, 2: 1 },
      cajero: { 5: 3, 1: 7 },
      agente: { 7: 6 },
    };

    const nuevaTransicion = retrocesos[rol]?.[estadoActual];

    if (!nuevaTransicion) {
      await client.query('ROLLBACK');
      return res
        .status(403)
        .json({ message: 'No tienes permisos para retroceder este estado' });
    }

    // 👇 Revertir stock si pasamos de 3 → 2
    if (estadoActual === 3 && nuevaTransicion === 2) {
      const ingredientesQuery = `
        SELECT ms.fk_stock, ms.cantidad_necesaria, pm.cantidad AS cantidad_pedida
        FROM pedidos_menu pm
        JOIN menu_stock ms ON pm.fk_menu = ms.fk_menu
        WHERE pm.fk_pedido = $1;
      `;
      const { rows: ingredientes } = await client.query(ingredientesQuery, [
        id,
      ]);

      for (const ing of ingredientes) {
        const devolucion = ing.cantidad_necesaria * ing.cantidad_pedida;

        // 1️⃣ Devolver al stock principal
        const updateStockQuery = `
          UPDATE stock
          SET stock_actual = stock_actual + $1
          WHERE id = $2;
        `;
        await client.query(updateStockQuery, [devolucion, ing.fk_stock]);

        // 2️⃣ Devolver al registro_stock (reponer en FIFO inverso)
        let restante = devolucion;

        const registrosQuery = `
          SELECT id, cantidad_actual
          FROM registro_stock
          WHERE fk_stock = $1
          ORDER BY fk_fecha DESC; -- reposición en orden inverso
        `;
        const { rows: registros } = await client.query(registrosQuery, [
          ing.fk_stock,
        ]);

        for (const reg of registros) {
          if (restante <= 0) break;

          // devolvemos en este registro
          const updateRegistroQuery = `
            UPDATE registro_stock
            SET cantidad_actual = cantidad_actual + $1
            WHERE id = $2;
          `;
          // devolvemos todo de una vez (no hay límite superior porque es reponer)
          await client.query(updateRegistroQuery, [restante, reg.id]);
          restante = 0;
        }
      }
    }

    // Actualizamos el pedido al nuevo estado
    const updateQuery = `
      UPDATE pedidos
      SET id_estado = $1
      WHERE id = $2
      RETURNING *;
    `;
    const { rows: updatedRows } = await client.query(updateQuery, [
      nuevaTransicion,
      id,
    ]);

    // Registro del nuevo estado
    const insertRegistroQuery = `
      INSERT INTO registro_de_estados (id_pedido, id_estado, id_fecha, hora, dni_empleado)
      VALUES ($1, $2, CURRENT_DATE, CURRENT_TIME, $3)
    `;
    await client.query(insertRegistroQuery, [
      id,
      nuevaTransicion,
      dni_empleado,
    ]);

    await client.query('COMMIT');

    res.json({
      message: 'Estado retrocedido correctamente',
      pedido: updatedRows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error al retroceder Estado' });
  } finally {
    client.release();
  }
};

export const agenteEstadoPedido = async (req: Request, res: Response) => {
  const { tel } = req.params;
  const {
    ubicacion,
    observacion,
    metodo_pago,
    efectivo_entregado,
    comprobante_pago,
  } = req.body;
  const client = await pool.connect();

  //mensaje del payload como respuesta
  let message;

  try {
    await client.query('BEGIN');

    const pedidoQuery = `
      SELECT id 
      FROM pedidos
      WHERE id_cliente = $1 AND id_estado = 6
      LIMIT 1;
    `;
    const { rows } = await client.query(pedidoQuery, [tel]);

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const pedido_id = rows[0].id;

    const updateQuery = `
      UPDATE pedidos
      SET id_estado = 7, ubicacion = $1, observaciones = $2, fecha= CURRENT_DATE, hora = CURRENT_TIME
      WHERE id = $3
      RETURNING *;
    `;

    const observaciones =
      metodo_pago == 'efectivo'
        ? observacion + ' .Efectivo entregado: ' + efectivo_entregado
        : observacion;

    const { rows: updatedRows } = await client.query(updateQuery, [
      ubicacion,
      observaciones,
      pedido_id,
    ]);
    // Insertamos el registro en "registro_de_estados"
    const insertRegistroQuery = `
      INSERT INTO registro_de_estados (id_pedido, id_estado, id_fecha, hora)
      VALUES ($1, $2, CURRENT_DATE, CURRENT_TIME(0))
    `;
    await client.query(insertRegistroQuery, [pedido_id, 7]);

    //obtener el monto total del pedido
    const { rows: menuPedidoRows } = await client.query(
      'SELECT precio_unitario FROM pedidos_menu WHERE fk_pedido = $1',
      [pedido_id],
    );
    let total: number = 0;

    for (let row of menuPedidoRows) {
      total += parseInt(row.precio_unitario);
    }

    const dropboxToken = process.env.DROPBOX_TOKEN as string;
    const accessToken = process.env.ACCESS_TOKEN as string;
    const dropboxRefreshToken = process.env.DROPBOX_REFRESH_TOKEN as string;
    const dropboxClientID = process.env.DROPBOX_CLIENTID as string;
    const dropboxClientSecret = process.env.DROPBOX_CLIENTSECRET as string;
    let rutaDropbox;

    if (metodo_pago == 'transferencia') {
      const imagenBuffer = await descargarImagen(comprobante_pago, accessToken);
      if (!imagenBuffer) return;

      const nombreArchivo = `comprobante_${Date.now()}.jpg`;
      rutaDropbox = await subirADropbox(
        nombreArchivo,
        imagenBuffer,
        dropboxToken,
        dropboxRefreshToken,
        dropboxClientID,
        dropboxClientSecret,
      );

      if (!rutaDropbox) return;
    }

    //reglas de negocio crear objeto "pagos"
    //...
    //si es transferencia se registra el pago asociado el cual debe ser verificado
    const pagoQuery = `
    INSERT INTO pagos (monto, metodo_pago, comprobante_pago, validado, fk_pedido, fk_fecha, hora)
    VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_TIME(0))
    `;
    await client.query(pagoQuery, [
      total,
      metodo_pago,
      rutaDropbox,
      false,
      pedido_id,
    ]);
    message =
      'Pedido creado correctamente. Por favor, espera mientras validamos tu solicitud. Seras notificado en breve';

    await client.query('COMMIT');
    const payload = {
      message: message,
      orderID: updatedRows[0].id,
      location: ubicacion,
      paymentMethod: metodo_pago,
      orderState: 'proceso de validacion',
      totalPrice: total,
    };

    res.status(200).json({ payload });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error en rollback:', rollbackError);
    }
    console.error('Error en crear el pedido:', error);
    res.status(500).json({ message: 'Error al crear el pedido' });
  } finally {
    client.release();
  }
};

export const getPedidosAsignadosEmpleado = async (
  req: Request,
  res: Response,
) => {
  const idEmpleado = (req as any).dni;
  try {
    const query = `
  SELECT 
        ${PEDIDO_FIELDS},
        re.dni_empleado
      FROM pedidos p
      INNER JOIN registro_de_estados re 
        ON re.id_pedido = p.id
      LEFT JOIN pedidos_menu pm 
        ON p.id = pm.fk_pedido
      LEFT JOIN menu m 
        ON m.id = pm.fk_menu
      LEFT JOIN pedidos_promociones pp 
        ON p.id = pp.id_pedido
      LEFT JOIN promociones pr 
        ON pr.id = pp.id_promocion
      WHERE re.dni_empleado = $1
        AND DATE(re.id_fecha) = CURRENT_DATE
        AND re.id = (
          SELECT MAX(r2.id)
          FROM registro_de_estados r2
          WHERE r2.id_pedido = p.id
        )
        AND p.visibilidad = TRUE
      GROUP BY 
        p.id, p.id_cliente, p.ubicacion, p.observaciones, 
        p.id_estado, re.dni_empleado, re.id_fecha, re.id_estado
      ORDER BY p.id;
`;


    const { rows } = await pool.query(query, [idEmpleado]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: 'Error al obtener los pedidos cambiados por el empleado',
      });
  }
};

export const getTicketPedido = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const query = `
  WITH 
  items_data AS (
    SELECT 
      pm.fk_menu,
      m.nombre AS nombre_menu,
      m.precio AS precio_unitario,
      pm.cantidad,
      (m.precio * pm.cantidad) AS subtotal
    FROM pedidos_menu pm
    INNER JOIN menu m ON m.id = pm.fk_menu
    WHERE pm.fk_pedido = $1
  ),
  promos_data AS (
    SELECT 
      pp.id_promocion,
      pr.nombre AS nombre_promocion,
      pr.precio AS precio_unitario,
      pp.cantidad,
      (pr.precio * pp.cantidad) AS subtotal
    FROM pedidos_promociones pp
    INNER JOIN promociones pr ON pr.id = pp.id_promocion
    WHERE pp.id_pedido = $1
  ),
  total_data AS (
    SELECT COALESCE(SUM(subtotal), 0) AS total_items FROM items_data
  ),
  total_promos AS (
    SELECT COALESCE(SUM(subtotal), 0) AS total_promos FROM promos_data
  )
  SELECT 
    p.id AS pedido_id,
    p.id_cliente,
    p.ubicacion,
    p.observaciones,
    p.fecha,
    p.hora,
    -- Detalle de items
    COALESCE(
      (SELECT json_agg(
          jsonb_build_object(
            'nombre', nombre_menu,
            'precio_unitario', precio_unitario,
            'cantidad', cantidad,
            'subtotal', subtotal
          )
        ) FROM items_data),
      '[]'
    ) AS items,
    -- Detalle de promociones
    COALESCE(
      (SELECT json_agg(
          jsonb_build_object(
            'nombre', nombre_promocion,
            'precio_unitario', precio_unitario,
            'cantidad', cantidad,
            'subtotal', subtotal
          )
        ) FROM promos_data),
      '[]'
    ) AS promociones,
    -- Totales
    (SELECT total_items FROM total_data) AS precio_por_items,
    (SELECT total_promos FROM total_promos) AS precio_por_promociones,
    (SELECT total_items + total_promos FROM total_data, total_promos) AS precio_total
  FROM pedidos p
  WHERE p.id = $1
  GROUP BY p.id, p.id_cliente, p.ubicacion, p.observaciones;
`;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const pedido = rows[0];

    const doc = new jsPDF();
    let y = 15;

    // Título
    doc.setFontSize(18);
    doc.text(`Ticket Pedido #${pedido.pedido_id}`, 105, y, { align: 'center' });
    y += 10;

    // Información del pedido
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date(pedido.fecha).toLocaleDateString()}`, 14, y);
    doc.text(`Hora: ${pedido.hora}`, 150, y);
    y += 7;
    doc.text(`Cliente: ${pedido.id_cliente || 'Consumidor Final'}`, 14, y);
    y += 7;
    if (pedido.ubicacion) {
      doc.text(`Ubicación: ${pedido.ubicacion}`, 14, y);
      y += 7;
    }
    if (pedido.observaciones) {
      doc.text(`Observaciones: ${pedido.observaciones}`, 14, y);
      y += 7;
    }
    y += 10;

    // Items
    autoTable(doc, {
      startY: y,
      head: [['Cantidad', 'Producto', 'Precio Unit.', 'Subtotal']],
      body: pedido.items.map((item: any) => [
        item.cantidad,
        item.nombre,
        `$${item.precio_unitario.toFixed(2)}`,
        `$${item.subtotal.toFixed(2)}`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // Promociones
    if (pedido.promociones.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Cantidad', 'Promoción', 'Precio Unit.', 'Subtotal']],
        body: pedido.promociones.map((promo: any) => [
          promo.cantidad,
          promo.nombre,
          `$${promo.precio_unitario.toFixed(2)}`,
          `$${promo.subtotal.toFixed(2)}`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [22, 160, 133] },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Totales
    doc.setFontSize(14);
    doc.text(`Total: $${parseFloat(pedido.precio_total).toFixed(2)}`, 14, y);

    // Enviar el PDF
    const pdfBuffer = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket_${pedido.pedido_id}.pdf`);
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al calcular el ticket del pedido' });
  }
};

/*export const PEDIDO_FIELDS = `
    p.id AS pedido_id,
    p.id_cliente,
    p.ubicacion,
    p.observaciones,
    p.id_estado,
    -- Items asociados
    COALESCE(
      json_agg(
        DISTINCT jsonb_build_object(
          'fk_menu', pm.fk_menu,
          'cantidad', pm.cantidad
        )
      ) FILTER (WHERE pm.fk_menu IS NOT NULL),
      '[]'
    ) AS items,
    -- Promociones asociadas
    COALESCE(
      json_agg(
        DISTINCT jsonb_build_object(
          'fk_promocion', pp.id_promocion,
          'cantidad', pp.cantidad
        )
      ) FILTER (WHERE pp.id_promocion IS NOT NULL),
      '[]'
    ) AS promociones
`; */