
import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const query = `
      WITH pedidos_hoy AS (
        SELECT id_estado  -- Solo necesitamos el estado para contar
        FROM pedidos
        WHERE fecha = CURRENT_DATE
      )
      SELECT
        -- 1. Pedidos Activos (no completados, cancelados o en construcción)
        -- Asumiendo 5: Entregado/Completado, 8: Cancelado, 9: Fallido/Rechazado, 6: En Construcción (si es estado final)
        (SELECT COUNT(*) FROM pedidos_hoy WHERE id_estado NOT IN (5, 8, 9, 6)) AS pedidos_activos,

        -- 2. Pedidos Completados Hoy
        (SELECT COUNT(*) FROM pedidos_hoy WHERE id_estado = 5) AS pedidos_completados,

        -- 3. Pedidos Cancelados Hoy (REEMPLAZO FINAL)
        -- Incluimos el estado 8 (Cancelado) y 9 (Fallido) como cancelados para el reporte.
        (SELECT COUNT(*) FROM pedidos_hoy WHERE id_estado IN (8, 9)) AS pedidos_cancelados
    
    `;

    const { rows } = await pool.query(query);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los datos del dashboard' });
  }
};
