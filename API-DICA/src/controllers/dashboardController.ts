
import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const query = `
      WITH pedidos_hoy AS (
        SELECT *
        FROM pedidos
        WHERE fecha = CURRENT_DATE
      ),
      estados_hoy AS (
        SELECT
          id_pedido,
          id_estado,
          hora
        FROM registro_de_estados
        WHERE id_fecha = CURRENT_DATE
      )
      SELECT
        -- 1. Pedidos Activos (no completados, cancelados o en construcción)
        (SELECT COUNT(*) FROM pedidos_hoy WHERE id_estado NOT IN (5, 8, 9, 6)) AS pedidos_activos,

        -- 2. Pedidos Completados Hoy
        (SELECT COUNT(*) FROM pedidos_hoy WHERE id_estado = 5) AS pedidos_completados,

        -- 3. Tiempo Promedio de Entrega
        (
          SELECT AVG(tiempo_entrega)
          FROM (
            SELECT
              r2.id_pedido,
              (r2.hora - r1.hora) AS tiempo_entrega
            FROM estados_hoy r1
            JOIN estados_hoy r2 ON r1.id_pedido = r2.id_pedido
            WHERE r1.id_estado = 7 -- a confirmar
              AND r2.id_estado = 5 -- entregado
          ) AS tiempos
        ) AS tiempo_promedio
    `;

    const { rows } = await pool.query(query);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los datos del dashboard' });
  }
};
