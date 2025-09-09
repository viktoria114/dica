import { Request, Response } from 'express';
import { pool } from '../config/db';

export const cancelarPedido = async (req: Request, res: Response) => {
  const { id } = req.params;
  const rol = (req as any).rol;

  try {
    // Verificar que el pedido exista y obtener su estado actual
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

    // Determinar el nuevo estado según el rol
    let nuevoEstado: number;
    if (rol === 'agente') {
      nuevoEstado = 8; // Por Cancelar
    } else {
      nuevoEstado = 9; // Cancelado
    }

    // Si ya está en ese estado, no hacemos nada
    if (estadoActual === nuevoEstado) {
      return res.status(400).json({
        message: `El pedido ya está en el estado ${nuevoEstado}, no se puede volver a cancelar.`,
      });
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

    // Insertamos el registro en "registro_de_estados"
    const insertRegistroQuery = `
      INSERT INTO registro_de_estados (id_pedido, id_estado, id_fecha, hora)
      VALUES ($1, $2, CURRENT_DATE, CURRENT_TIME)
    `;
    await pool.query(insertRegistroQuery, [id, nuevoEstado]);

    if(rol === 'agente'){
      return res.status(200).json({
        message: `En breve sera notificado sobre la cancelacion del pedido #${id} `,
      });
    }
    res.json({
      message: `Pedido actualizado al estado ${nuevoEstado}`,
      pedido: updatedRows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al cancelar el pedido' });
  }
};

export const deshacerCancelarPedido = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // 1. Verificar estado actual
    const estadoActualQuery = `
      SELECT id_estado
      FROM registro_de_estados
      WHERE id_pedido = $1
      ORDER BY id_fecha DESC, hora DESC
      LIMIT 1;
    `;
    const { rows: estadoActualRows } = await pool.query(estadoActualQuery, [
      id,
    ]);

    if (estadoActualRows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const estadoActual = estadoActualRows[0].id_estado;

    // 🚨 Validar que el estado actual sea 8 o 9
    if (![8, 9].includes(estadoActual)) {
      return res.status(400).json({
        message:
          'El pedido no está en estado de cancelación, no se puede deshacer',
      });
    }

    // 2. Buscar el último estado ANTES de entrar en 8 o 9
    const estadoAnteriorQuery = `
      SELECT id_estado
      FROM registro_de_estados
      WHERE id_pedido = $1
      AND id_estado NOT IN (8, 9)
      ORDER BY id_fecha DESC, hora DESC
      LIMIT 1;
    `;
    const { rows: estadoAnteriorRows } = await pool.query(estadoAnteriorQuery, [
      id,
    ]);

    if (estadoAnteriorRows.length === 0) {
      return res.status(400).json({
        message: 'No existe un estado válido anterior para restaurar',
      });
    }

    const estadoAnterior = estadoAnteriorRows[0].id_estado;

    // 3. Actualizar el pedido
    const updateQuery = `
      UPDATE pedidos
      SET id_estado = $1
      WHERE id = $2
      RETURNING *;
    `;
    const { rows: updatedRows } = await pool.query(updateQuery, [
      estadoAnterior,
      id,
    ]);

    // 4. Insertar registro en historial
    const insertRegistroQuery = `
      INSERT INTO registro_de_estados (id_pedido, id_estado, id_fecha, hora)
      VALUES ($1, $2, CURRENT_DATE, CURRENT_TIME);
    `;
    await pool.query(insertRegistroQuery, [id, estadoAnterior]);

    res.json({
      message: `Pedido restaurado al estado ${estadoAnterior}`,
      pedido: updatedRows[0],
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Error al deshacer la cancelación del pedido' });
  }
};