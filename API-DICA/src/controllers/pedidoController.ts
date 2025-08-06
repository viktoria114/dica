import { Request, Response } from 'express';
import { PoolClient } from 'pg';
import { pool } from '../config/db';
import { Pedido } from '../models/pedido';

export const crearPedido = async (req: Request, res: Response) => {
  const client: PoolClient = await pool.connect();
  try {
    const { fk_empleado, fk_cliente, ubicacion, observacion, items_menu } =
      req.body;

    await client.query('BEGIN');

    const pedido = new Pedido(
      null,
      null,
      null,
      null,
      fk_empleado,
      fk_cliente,
      ubicacion,
      observacion,
    );

    // Insertar el pedido
    const pedidoQuery = `
            INSERT INTO pedidos (fecha, hora, estado, dni_empleado, id_cliente, ubicacion, observaciones)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id;
        `;
    const { rows: pedidoRows } = await client.query(pedidoQuery, [
      new Date(),
      pedido.hora,
      pedido.estado,
      pedido.fk_empleado,
      pedido.fk_cliente,
      pedido.ubicacion,
      pedido.observacion,
    ]);

    const pedidoId = pedidoRows[0].id;

    // Insertar en pedidos_menu
    const pedido_menuQuery = `
            INSERT INTO pedidos_menu (fk_pedido, fk_menu, precio_unitario)
            VALUES ($1, $2, $3);
        `;

    for (const item of items_menu) {
      const result = await client.query(
        'SELECT precio FROM menu WHERE id = $1',
        [item.id_menu],
      );
      const precio = result.rows[0].precio;

      await client.query(pedido_menuQuery, [pedidoId, item.id_menu, precio]);
    }

    await client.query('COMMIT');

    res.status(201).json({ id: pedidoId, message: 'Pedido creado con éxito' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error al crear el pedido' });
  } finally {
    client.release();
  }
};
