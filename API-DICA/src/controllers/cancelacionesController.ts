import { Request, Response } from 'express';
import { pool } from '../config/db';
import { PEDIDO_FIELDS } from "./pedidoController";


export const cancelarPedido = async (req: Request, res: Response) => {
  const { id } = req.params;
  const rol = (req as any).rol;
  const idEmpleado = (req as any).dni; // solo viene si es empleado
  const { motivo } = req.body;
const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1) Verificar que el pedido exista
    const pedidoQuery = `SELECT id_estado FROM pedidos WHERE id = $1`;
    const pedidoRes = await client.query(pedidoQuery, [id]);
    if (pedidoRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    const estadoActual = pedidoRes.rows[0].id_estado;

    // 2) Determinar nuevo estado según rol
    const nuevoEstado = rol === 'agente' ? 8 : 9;

    if (estadoActual === nuevoEstado) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: `El pedido ya está en el estado ${nuevoEstado}, no se puede volver a cancelar.`,
      });
    }

    // 3) Actualizar el estado del pedido
    const updateQuery = `
      UPDATE pedidos
      SET id_estado = $1
      WHERE id = $2
      RETURNING *;
    `;
    const updatedRes = await client.query(updateQuery, [nuevoEstado, id]);

    // 4) Insertar en registro_de_estados (guardamos dni_empleado aunque sea null)
    const insertRegistroQuery = `
      INSERT INTO registro_de_estados (id_pedido, id_estado, id_fecha, hora, dni_empleado)
      VALUES ($1, $2, CURRENT_DATE, CURRENT_TIME, $3)
    `;
    await client.query(insertRegistroQuery, [id, nuevoEstado, idEmpleado]);

    // 5) Lógica de cancelaciones según el rol y existencia de pendiente
    if (rol === 'agente') {
      // Agente: siempre insertamos una cancelación pendiente (confirmado = false)
      const insertCancelacion = `
        INSERT INTO cancelaciones (motivo, id_pedido, id_empleado, id_fecha, hora, confirmado, anulada)
        VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_TIME, FALSE, FALSE)
      `;
      await client.query(insertCancelacion, [motivo, id, idEmpleado]);
    } else {
      // Empleado: primero requiere que tengamos idEmpleado
      if (!idEmpleado) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Empleado no identificado' });
      }

      // Buscamos si existe una cancelación pendiente (confirmado = false, no anulada)
      const pendingQuery = `
        SELECT id
        FROM cancelaciones
        WHERE id_pedido = $1
          AND confirmado = FALSE
          AND (anulada = FALSE OR anulada IS NULL)
        ORDER BY id_fecha DESC, hora DESC
        LIMIT 1
      `;
      const pendingRes = await client.query(pendingQuery, [id]);

      if (pendingRes.rows.length > 0) {
        // Si existe pendiente -> actualizar esa fila (confirmar)
        const cancelId = pendingRes.rows[0].id;
        const updatePending = `
          UPDATE cancelaciones
          SET confirmado = TRUE,
              id_empleado = $1,
              motivo = COALESCE(NULLIF($2, ''), motivo),
              id_fecha = CURRENT_DATE,
              hora = CURRENT_TIME
          WHERE id = $3
        `;
        await client.query(updatePending, [idEmpleado, motivo, cancelId]);
      } else {
        // Si NO existe pendiente -> insertamos una cancelación ya confirmada
        const insertConfirmada = `
          INSERT INTO cancelaciones (motivo, id_pedido, id_empleado, id_fecha, hora, confirmado, anulada)
          VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_TIME, TRUE, FALSE)
        `;
        await client.query(insertConfirmada, [motivo, id, idEmpleado]);
      }
    }

    await client.query('COMMIT');

    if (rol === 'agente') {
      return res.status(200).json({
        message: `En breve será revisada la cancelación del pedido #${id}.`,
      });
    }

    return res.json({
      message: `Pedido cancelado con éxito`,
      pedido: updatedRes.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    return res.status(500).json({ message: 'Error al cancelar el pedido' });
  } finally {
    client.release();
  }
};

export const deshacerCancelarPedido = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // 1. Verificar estado actual
    const estadoActualQuery = `
      SELECT id_estado
      FROM pedidos
      WHERE id = $1
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
      WHERE id_pedido = $1 AND id_estado NOT IN (8, 9)
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

    // 5. Marcar cancelaciones como anuladas
    const updateCancelacionQuery = `
      UPDATE cancelaciones
  SET anulada = TRUE
  WHERE id = (
    SELECT id
    FROM cancelaciones
    WHERE id_pedido = $1
    ORDER BY id_fecha DESC, hora DESC
    LIMIT 1);`;
    await pool.query(updateCancelacionQuery, [id]);

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

export const getPedidosCanceladosEmpleadoHoy = async (req: Request, res: Response) => {
  const idEmpleado = (req as any).dni;
  try {
    const query = `
      SELECT 
      ${PEDIDO_FIELDS},
      c.motivo,
      c.id_empleado
      FROM pedidos p
      INNER JOIN cancelaciones c 
        ON p.id = c.id_pedido
      LEFT JOIN pedidos_menu pm 
        ON p.id = pm.fk_pedido
      LEFT JOIN pedidos_promociones pp ON p.id = pp.id_pedido
      WHERE c.id_empleado = $1
        AND p.visibilidad = TRUE
        AND c.id_fecha = CURRENT_DATE
        AND c.confirmado = TRUE
      GROUP BY p.id, p.id_cliente, p.ubicacion, p.observaciones, p.id_estado, c.motivo, c.id_empleado
      ORDER BY p.id;
    `;
    const { rows } = await pool.query(query, [idEmpleado]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los Pedidos visible' });
  }
};

export const getPedidosCanceladosEmpleado = async (req: Request, res: Response) => {
  const idEmpleado = (req as any).dni;
  try {
    const query = `
      SELECT 
        ${PEDIDO_FIELDS},
        c.motivo,
        c.id_empleado
      FROM pedidos p
      INNER JOIN cancelaciones c 
        ON p.id = c.id_pedido
      LEFT JOIN pedidos_menu pm 
        ON p.id = pm.fk_pedido
      LEFT JOIN pedidos_promociones pp ON p.id = pp.id_pedido
      WHERE c.id_empleado = $1
        AND p.visibilidad = TRUE
        AND c.confirmado = TRUE
      GROUP BY p.id, p.id_cliente, p.ubicacion, p.observaciones, p.id_estado, c.motivo, c.id_empleado
      ORDER BY p.id;
    `;
    const { rows } = await pool.query(query, [idEmpleado]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los Pedidos visible' });
  }
};

export const getPedidosCancelados = async (req: Request, res: Response) => {
  try {
    const query = `
    SELECT 
      ${PEDIDO_FIELDS},
      c.motivo,
      c.id_empleado
      FROM pedidos p
      LEFT JOIN pedidos_menu pm ON p.id = pm.fk_pedido
      LEFT JOIN pedidos_promociones pp ON p.id = pp.id_pedido
      LEFT JOIN cancelaciones c ON p.id = c.id_pedido
      WHERE (p.id_estado = 8 OR p.id_estado = 9)
      GROUP BY p.id, p.id_cliente, p.ubicacion, p.observaciones, p.id_estado, p.fecha, c.motivo, c.id_empleado
      ORDER BY p.id;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los Pedidos visible' });
  }
};


export const getPedidosCanceladosHoy = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
      ${PEDIDO_FIELDS},
      c.motivo,
      c.id_empleado
      FROM pedidos p
      LEFT JOIN pedidos_menu pm ON p.id = pm.fk_pedido
      LEFT JOIN pedidos_promociones pp ON p.id = pp.id_pedido
      LEFT JOIN cancelaciones c ON p.id = c.id_pedido
      WHERE (p.id_estado = 8 OR p.id_estado = 9)
        AND p.fecha = CURRENT_DATE
      GROUP BY p.id, p.id_cliente, p.ubicacion, p.observaciones, p.id_estado, p.fecha, c.motivo, c.id_empleado
      ORDER BY p.id;
    `;

    const { rows } = await pool.query(query);

    if (rows.length === 0) {
      return res
        .status(200)
        .json({ message: 'No hay pedidos cancelados hoy' });
    }

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los pedidos cancelados' });
  }
};
