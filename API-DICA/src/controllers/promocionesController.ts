import { Request, Response } from 'express';
import { pool } from '../config/db';
import { Promocion } from '../models/promocion';

// ✅ GET promociones visibles con items
// GET promociones visibles con items
export const getListaPromocionesV = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const query = `
      SELECT
        p.id            AS promo_id,
        p.nombre        AS promo_nombre,
        p.tipo          AS promo_tipo,
        p.precio        AS promo_precio,
        p.visibilidad   AS promo_visibilidad,
        pm.id_menu      AS menu_id,
        pm.cantidad     AS menu_cantidad,
        m.nombre        AS menu_nombre,
        m.precio        AS menu_precio
      FROM promociones p
      LEFT JOIN promocion_menu pm ON p.id = pm.id_promocion
      LEFT JOIN menu m ON pm.id_menu = m.id
      WHERE p.visibilidad = TRUE
      ORDER BY p.id;
    `;

    const result = await pool.query(query);

    const promocionesAgrupadas: { [key: number]: any } = {};

    result.rows.forEach((row) => {
      const promoId = row.promo_id as number;

      if (!promocionesAgrupadas[promoId]) {
        promocionesAgrupadas[promoId] = {
          id: promoId,
          nombre: row.promo_nombre,
          tipo: row.promo_tipo,
          precio: row.promo_precio,
          visibilidad: row.promo_visibilidad,
          items: [],
        };
      }

      // si hay item asociado, lo agregamos al array de items de la promo
      if (row.menu_id) {
        promocionesAgrupadas[promoId].items.push({
          id: row.menu_id,
          nombre: row.menu_nombre,
          precio: row.menu_precio,
          cantidad: row.menu_cantidad,
        });
      }
    });

    res.status(200).json(Object.values(promocionesAgrupadas));
  } catch (error) {
    console.error('❌ Error al obtener promociones visibles:', error);
    res.status(500).json({ message: 'Error al obtener promociones visibles' });
  }
};

// GET promociones invisibles con items
export const getListaPromocionesI = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const query = `
      SELECT
        p.id            AS promo_id,
        p.nombre        AS promo_nombre,
        p.tipo          AS promo_tipo,
        p.precio        AS promo_precio,
        p.visibilidad   AS promo_visibilidad,
        pm.id_menu      AS menu_id,
        pm.cantidad     AS menu_cantidad,
        m.nombre        AS menu_nombre,
        m.precio        AS menu_precio
      FROM promociones p
      LEFT JOIN promocion_menu pm ON p.id = pm.id_promocion
      LEFT JOIN menu m ON pm.id_menu = m.id
      WHERE p.visibilidad = FALSE
      ORDER BY p.id;
    `;

    const result = await pool.query(query);

    const promocionesAgrupadas: { [key: number]: any } = {};

    result.rows.forEach((row) => {
      const promoId = row.promo_id as number;

      if (!promocionesAgrupadas[promoId]) {
        promocionesAgrupadas[promoId] = {
          id: promoId,
          nombre: row.promo_nombre,
          tipo: row.promo_tipo,
          precio: row.promo_precio,
          visibilidad: row.promo_visibilidad,
          items: [],
        };
      }

      if (row.menu_id) {
        promocionesAgrupadas[promoId].items.push({
          id: row.menu_id,
          nombre: row.menu_nombre,
          precio: row.menu_precio,
          cantidad: row.menu_cantidad,
        });
      }
    });

    res.status(200).json(Object.values(promocionesAgrupadas));
  } catch (error) {
    console.error('❌ Error al obtener promociones invisibles:', error);
    res
      .status(500)
      .json({ message: 'Error al obtener promociones invisibles' });
  }
};

export const crearPromocion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { nombre, tipo, precio, visibilidad } = req.body;

    // Creamos la instancia con validaciones
    const nuevaPromocion = new Promocion(
      null,
      nombre,
      tipo,
      precio,
      visibilidad,
    );

    // Query para insertar
    const query = `
      INSERT INTO promociones (nombre, tipo, precio, visibilidad)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [
      nuevaPromocion.nombre,
      nuevaPromocion.tipo,
      nuevaPromocion.precio,
      nuevaPromocion.visibilidad,
    ];

    const resultado = await pool.query(query, values);

    res.status(201).json({
      mensaje: 'Promoción creada exitosamente',
      promocion: resultado.rows[0],
    });
  } catch (error: any) {
    console.error('❌ Error al crear promoción:', error.message);
    res.status(400).json({ error: error.message });
  }
};

export const actualizarPromocion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { nombre, tipo, precio, visibilidad } = req.body;

  const nuevaPromocion = new Promocion(null, nombre, tipo, precio, visibilidad);

  try {
    const result = await pool.query(
      `UPDATE promociones 
           SET nombre = $1, tipo = $2, precio = $3, visibilidad = $4
           WHERE id = $5`,
      [
        nuevaPromocion.nombre,
        nuevaPromocion.tipo,
        nuevaPromocion.precio,
        nuevaPromocion.visibilidad,
        id,
      ],
    );

    if (result.rowCount === 1) {
      res.json({ message: 'Registro actualizado' });
    } else {
      res.status(404).json({ message: 'Registro inexistente' });
    }
  } catch (error) {
    console.error('❌ Error al actualizar promoción:', error);
    res.status(500).json({ message: 'Error al actualizar promoción' });
  }
};
export const eliminarPromocion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
            UPDATE promociones
            SET visibilidad = false
            WHERE id = $1
            RETURNING *;
        `;

    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Promoción no encontrada' });
    }

    res.json({ message: 'Promoción ocultada correctamente', menu: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al ocultar la promoción' });
  }
};

export const restaurarPromocion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
            UPDATE promociones
            SET visibilidad = true
            WHERE id = $1
            RETURNING *;
        `;

    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Promoción no encontrada' });
    }

    res.json({ message: 'Promoción restaurada correctamente', menu: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al restaurar la promoción' });
  }
};

export const agregarItemPromocion = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // id de la promoción
    const { id_menu, cantidad } = req.body;

    // Validar cantidad
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return res.status(400).json({
        message: `La cantidad para el ítem con id_menu=${id_menu} debe ser mayor a 0`,
      });
    }

    await client.query('BEGIN');

    // Verificar que exista la promoción
    const promoExists = await client.query(
      'SELECT id FROM promociones WHERE id = $1',
      [id],
    );
    if (promoExists.rows.length === 0) {
      await client.query('ROLLBACK');
      return res
        .status(404)
        .json({ message: `No existe la promoción con id=${id}` });
    }

    // Verificar que exista el menú
    const menuExists = await client.query('SELECT id FROM menu WHERE id = $1', [
      id_menu,
    ]);
    if (menuExists.rows.length === 0) {
      await client.query('ROLLBACK');
      return res
        .status(404)
        .json({ message: `No existe el menú con id=${id_menu}` });
    }

    // Verificar si ya existe el ítem en la promoción
    const entry = await client.query(
      'SELECT id, cantidad FROM promocion_menu WHERE id_promocion = $1 AND id_menu = $2',
      [id, id_menu],
    );

    let itemAgregado;

    if (entry.rows.length === 0) {
      // Si no existe, lo insertamos
      itemAgregado = await client.query(
        `INSERT INTO promocion_menu (id_promocion, id_menu, cantidad)
         VALUES ($1, $2, $3)
         RETURNING id_promocion, id_menu, cantidad;`,
        [id, id_menu, cantidad],
      );
    } else {
      // Si existe, actualizamos sumando
      itemAgregado = await client.query(
        `UPDATE promocion_menu
         SET cantidad = cantidad + $1
         WHERE id_promocion = $2 AND id_menu = $3
         RETURNING id_promocion, id_menu, cantidad;`,
        [cantidad, id, id_menu],
      );
    }

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Ítem agregado a la promoción con éxito',
      promocion: itemAgregado.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error al agregar ítem a la promoción' });
  } finally {
    client.release();
  }
};

export const eliminarItemPromocion = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // id de la promoción
    const { id_menu, cantidad } = req.body;

    // Validar cantidad
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return res.status(400).json({
        message: `La cantidad a quitar para el ítem con id_menu=${id_menu} debe ser mayor a 0`,
      });
    }

    await client.query('BEGIN');

    // Verificar que exista la promoción
    const promoExists = await client.query(
      'SELECT id FROM promociones WHERE id = $1',
      [id],
    );
    if (promoExists.rows.length === 0) {
      await client.query('ROLLBACK');
      return res
        .status(404)
        .json({ message: `No existe la promoción con id=${id}` });
    }

    // Verificar si el ítem existe en la promoción
    const entry = await client.query(
      'SELECT id, cantidad FROM promocion_menu WHERE id_promocion = $1 AND id_menu = $2',
      [id, id_menu],
    );

    if (entry.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        message: `El ítem con id_menu=${id_menu} no existe en la promoción ${id}`,
      });
    }

    const item = entry.rows[0];
    let itemActualizado;

    if (item.cantidad <= cantidad) {
      // Si la cantidad a quitar es igual o mayor, borramos el ítem
      const deleted = await client.query(
        'DELETE FROM promocion_menu WHERE id_promocion = $1 AND id_menu = $2 RETURNING id_promocion, id_menu, cantidad',
        [id, id_menu],
      );
      itemActualizado = deleted;
    } else {
      // Si la cantidad es menor, actualizamos restando
      itemActualizado = await client.query(
        `UPDATE promocion_menu
     SET cantidad = cantidad - $1
     WHERE id_promocion = $2 AND id_menu = $3
     RETURNING id_promocion, id_menu, cantidad;`,
        [cantidad, id, id_menu],
      );
    }

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Ítem quitado de la promoción con éxito',
      promocion: itemActualizado?.rows[0] || null,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error al quitar ítem de la promoción' });
  } finally {
    client.release();
  }
};

export const agregarPromocionPedido = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // id del pedido
    const { tel, id_promocion, cantidad } = req.body; // cantidad opcional
    const pedidoId = id;

    await client.query('BEGIN'); // Iniciamos transacción

    // 1. Verificar si existe un pedido "en construcción" para el cliente
    const exists = await client.query(
      'SELECT * FROM pedidos WHERE id = $1 AND id_cliente = $2 AND id_estado = 6',
      [pedidoId, tel],
    );
    if (exists.rows.length === 0) {
      return res.status(404).json(
        `No existe un carrito con id: ${pedidoId} para el cliente: ${tel}. Considera crear uno nuevo`,
      );
    }

    // 2. Validar cantidad
    const cantidadFinal = Number.isInteger(cantidad) && cantidad > 0 ? cantidad : 1;

    // 3. Verificar que la promoción exista
    const promo = await client.query(
      'SELECT * FROM promociones WHERE id = $1',
      [id_promocion],
    );
    if (promo.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: `La promoción con id=${id_promocion} no existe`,
      });
    }

    // 4. Verificar si ya existe esa promo en el pedido
    const entry = await client.query(
      'SELECT id, cantidad FROM pedido_promocion WHERE id_pedido = $1 AND id_promocion = $2',
      [pedidoId, id_promocion],
    );

    let promoAgregada;

    if (entry.rows.length === 0) {
      // Insertar nueva promo
      const insertQuery = `
        INSERT INTO pedido_promocion (id_pedido, id_promocion, cantidad)
        VALUES ($1, $2, $3)
        RETURNING id, id_pedido AS cartID, id_promocion AS promoID, cantidad;
      `;
      promoAgregada = await client.query(insertQuery, [pedidoId, id_promocion, cantidadFinal]);
    } else {
      // Si ya existe, sumamos a la cantidad
      const idPedidoPromo = entry.rows[0].id;
      promoAgregada = await client.query(
        `
        UPDATE pedido_promocion
        SET cantidad = cantidad + $1
        WHERE id = $2
        RETURNING id, id_pedido AS cartID, id_promocion AS promoID, cantidad;
        `,
        [cantidadFinal, idPedidoPromo],
      );
    }

    await client.query('COMMIT'); // Confirmamos todo

    res.status(200).json({
      message: 'Promoción agregada con éxito',
      carrito: promoAgregada.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error al agregar promoción al pedido' });
  } finally {
    client.release();
  }
};

export const eliminarPromocionPedido = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // id del pedido
    const { tel, id_promocion, cantidad } = req.body; // cantidad opcional
    const pedidoId = id;

    await client.query('BEGIN'); // Iniciamos transacción

    // 1. Verificar que el pedido exista y esté en construcción
    const exists = await client.query(
      'SELECT * FROM pedidos WHERE id = $1 AND id_cliente = $2 AND id_estado = 6',
      [pedidoId, tel],
    );
    if (exists.rows.length === 0) {
      return res.status(404).json(
        `No existe un carrito con id: ${pedidoId} para el cliente: ${tel}. Considera crear uno nuevo`,
      );
    }

    // 2. Determinar cantidad a restar (mínimo 1)
    const cantidadRestar = Number.isInteger(cantidad) && cantidad > 0 ? cantidad : 1;

    // 3. Verificar si existe esa promo en el pedido
    const entry = await client.query(
      'SELECT id, cantidad FROM pedido_promocion WHERE id_pedido = $1 AND id_promocion = $2',
      [pedidoId, id_promocion],
    );

    if (entry.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        message: `La promoción con id=${id_promocion} no está en el pedido ${pedidoId}`,
      });
    }

    const { id: idPedidoPromo, cantidad: cantidadActual } = entry.rows[0];

    let promoActualizada;

    if (cantidadActual > cantidadRestar) {
      // 4. Restamos cantidad
      promoActualizada = await client.query(
        `
        UPDATE pedido_promocion
        SET cantidad = cantidad - $1
        WHERE id = $2
        RETURNING id, id_pedido AS cartID, id_promocion AS promoID, cantidad;
        `,
        [cantidadRestar, idPedidoPromo],
      );
    } else {
      // 5. Si llega a 0 o menos, eliminamos la fila
      await client.query('DELETE FROM pedido_promocion WHERE id = $1', [idPedidoPromo]);
      promoActualizada = { rows: [] };
    }

    await client.query('COMMIT'); // Confirmamos todo

    res.status(200).json({
      message:
        promoActualizada.rows.length > 0
          ? 'Cantidad de la promoción actualizada'
          : 'Promoción eliminada del pedido',
      carrito: promoActualizada.rows[0] || null,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar promoción del pedido' });
  } finally {
    client.release();
  }
};

export const getPromocionesDePedido = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // id del pedido

    const query = `
      SELECT 
        p.id AS pedido_id,
        p.id_cliente,
        p.observaciones,
        pr.id AS promo_id,
        pr.nombre AS promo_nombre,
        pp.cantidad
      FROM pedidos p
      INNER JOIN pedidos_promociones pp ON p.id = pp.id_pedido
      INNER JOIN promociones pr ON pr.id = pp.id_promocion
      WHERE p.id = $1;
    `;

    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: `El pedido con id=${id} no tiene promociones asociadas o no existe`,
      });
    }

    res.status(200).json({
      message: 'Promociones encontradas con éxito',
      promociones: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener promociones del pedido' });
  } finally {
    client.release();
  }
};
