import { Request, Response } from 'express';
import { PoolClient } from 'pg';
import { pool } from '../config/db';
import { Pedido } from '../models/pedido';
import { MessagePort } from 'worker_threads';

export const crearPedido = async (req: Request, res: Response) => {
  const client: PoolClient = await pool.connect();
  try {
    const { fk_empleado, fk_cliente, ubicacion, observacion, items_menu } =
      req.body;
    const rol = (req as any).rol; // <- aquí tenés el rol desde el token (ya lo usaste en otros endpoints)

    // Validar que las cantidades sean correctas
    for (const item of items_menu) {
      if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
        return res.status(400).json({
          message: `La cantidad para el ítem con id_menu=${item.id_menu} debe ser mayor a 0`,
        });
      }
    }

    await client.query('BEGIN');

    // Estado inicial depende del rol
    let estadoInicial = 1; // default pendiente
    if (rol === 'agente') {
      estadoInicial = 6; // a confirmar
    }

    const pedido = new Pedido(
      null,
      null,
      null,
      estadoInicial,
      fk_empleado,
      fk_cliente,
      ubicacion,
      observacion,
      true,
    );

    // Insertar el pedido
    const pedidoQuery = `
            INSERT INTO pedidos (fecha, hora, id_estado, dni_empleado, id_cliente, ubicacion, observaciones, visibilidad)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id;
        `;
    const { rows: pedidoRows } = await client.query(pedidoQuery, [
      new Date(),
      pedido.hora,
      pedido.fk_estado,
      pedido.fk_empleado,
      pedido.fk_cliente,
      pedido.ubicacion,
      pedido.observacion,
      pedido.visibilidad,
    ]);

    const pedidoId = pedidoRows[0].id;

    // 👇 Insertar el registro inicial del estado
    const registroEstadoQuery = `
            INSERT INTO registro_de_estados (id_pedido, id_estado, id_fecha, hora)
            VALUES ($1, $2, $3, $4);
        `;
    await client.query(registroEstadoQuery, [
      pedidoId,
      pedido.fk_estado, // por defecto = 1 (pendiente)
      new Date(), // fecha actual
      pedido.hora, // hora actual
    ]);

    // Insertar en pedidos_menu
    const pedido_menuQuery = `
            INSERT INTO pedidos_menu (fk_pedido, fk_menu, precio_unitario, cantidad)
            VALUES ($1, $2, $3, $4);
        `;

    for (const item of items_menu) {
      const result = await client.query(
        'SELECT precio FROM menu WHERE id = $1',
        [item.id_menu],
      );
      const precio = result.rows[0].precio * item.cantidad;

      await client.query(pedido_menuQuery, [
        pedidoId,
        item.id_menu,
        precio,
        item.cantidad,
      ]);
    }

    await client.query('COMMIT');

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
  try {
    const { id } = req.params;
    const { fk_empleado, fk_cliente, ubicacion, observacion, fk_estado } =
      req.body;

    const query = `
            UPDATE pedidos
            SET id_estado = $1, dni_empleado = $2, id_cliente = $3, ubicacion = $4, observaciones = $5
            WHERE id = $6
            RETURNING *;
        `;

    const pedido = new Pedido(
      null,
      null,
      null,
      fk_estado,
      fk_empleado,
      fk_cliente,
      ubicacion,
      observacion,
    );

    const { rows } = await pool.query(query, [
      pedido.fk_estado,
      pedido.fk_empleado,
      pedido.fk_cliente,
      pedido.ubicacion,
      pedido.observacion,

      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el Pedido' });
  }
};

export const getListaPedidos = async (_req: Request, res: Response) => {
  try {
    const query = `SELECT * FROM pedidos WHERE visibilidad = true ORDER BY id ASC;`;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los Pedidos visible' });
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
    const query = `SELECT * FROM pedidos ORDER BY id ASC;`;
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

    // Insertar en pedidos_menu
    const pedido_menuQuery = `
            INSERT INTO pedidos_menu (fk_pedido, fk_menu, precio_unitario)
            VALUES ($1, $2, $3, $4);
        `;

    for (const item of items_menu) {
      const result = await pool.query('SELECT precio FROM menu WHERE id = $1', [
        item.id_menu,
      ]);
      const precio = result.rows[0].precio * item.cantidad;

      await pool.query(pedido_menuQuery, [
        pedidoId,
        item.id_menu,
        precio,
        item.cantidad,
      ]);
    }

    res
      .status(201)
      .json({ id: pedidoId, message: 'Items agregados con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agregar Items el pedido' });
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

  try {
    const pedidoQuery = `
      SELECT id_estado 
      FROM pedidos
      WHERE id = $1;
    `;
    const { rows } = await pool.query(pedidoQuery, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const estadoActual = rows[0].id_estado;

    // Si ya está en el último estado, no permitimos avanzar más
    if (estadoActual === 5) {
      return res
        .status(400)
        .json({ message: 'El pedido ya está en el último estado' });
    }

    // Definir transiciones válidas por rol
    const transiciones: Record<string, Record<number, number>> = {
      cajero: { 6: 1, 3: 5 },
      cocinero: { 1: 2, 2: 3 }, // pendiente -> en preparación
      repartidor: { 3: 4, 4: 5 }, // por entregar -> entregado
      admin: { 6: 1, 1: 2, 2: 3, 3: 4, 4: 5 }, // ejemplo: el sistema o admin avanza estos estados
    };

    // Verificar si el rol puede hacer la transición desde el estado actual
    const nuevaTransicion = transiciones[rol]?.[estadoActual];

    if (!nuevaTransicion) {
      return res
        .status(403)
        .json({ message: 'No tienes permisos para cambiar este estado' });
    }

    // Actualizamos el pedido al nuevo estado
    const updateQuery = `
      UPDATE pedidos
      SET id_estado = $1
      WHERE id = $2
      RETURNING *;
    `;
    const { rows: updatedRows } = await pool.query(updateQuery, [
      nuevaTransicion,
      id,
    ]);

    res.json({
      message: 'Estado actualizado correctamente',
      pedido: updatedRows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar Estado' });
  }
};

export const cancelarPedido = async (req: Request, res: Response) => {
  const { id } = req.params;
  const rol = (req as any).rol;

  try {
    // Verificar que el pedido exista
    const pedidoQuery = `
      SELECT id_estado 
      FROM pedidos
      WHERE id = $1;
    `;
    const { rows } = await pool.query(pedidoQuery, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Determinar el nuevo estado según el rol
    let nuevoEstado: number;

    if (rol === 'agente') {
      nuevoEstado = 7; // Por Cancelar
    } else {
      nuevoEstado = 8; // Cancelado
    }

    // Actualizamos el estado
    const updateQuery = `
      UPDATE pedidos
      SET id_estado = $1
      WHERE id = $2
      RETURNING *;
    `;
    const { rows: updatedRows } = await pool.query(updateQuery, [
      nuevoEstado,
      id,
    ]);

    res.json({
      message: `Pedido actualizado al estado ${nuevoEstado}`,
      pedido: updatedRows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al cancelar el pedido' });
  }
};
