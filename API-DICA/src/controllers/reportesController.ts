import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getVentasDiarias = async (req: Request, res: Response) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    let query = `
      SELECT
        df.fecha,
        df.nombre_dia,
        df.nombre_mes,
        SUM(p.monto) AS total_ventas
      FROM pagos p
      JOIN dim_fecha df ON p.fk_fecha::DATE = df.fecha
      WHERE p.validado = true
    `;

    const values = [];
    let paramIndex = 1;

    if (fecha_inicio) {
      query += ` AND df.fecha >= $${paramIndex++}`;
      values.push(fecha_inicio);
    }
    if (fecha_fin) {
      query += ` AND df.fecha <= $${paramIndex++}`;
      values.push(fecha_fin);
    }

    query += `
      GROUP BY df.fecha, df.nombre_dia, df.nombre_mes
      ORDER BY df.fecha ASC;
    `;

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las ventas diarias' });
  }
};

export const getProductosMasVendidos = async (req: Request, res: Response) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    let query = `
      SELECT 
        m.nombre,
        SUM(pm.cantidad) AS total_vendido
      FROM pedidos_menu pm
      JOIN menu m ON pm.fk_menu = m.id
      JOIN pedidos p ON pm.fk_pedido = p.id
      JOIN dim_fecha df ON p.fecha::DATE = df.fecha
    `;

    const values = [];
    let paramIndex = 1;
    let whereClauses = [];

    if (fecha_inicio) {
      whereClauses.push(`df.fecha >= $${paramIndex++}`);
      values.push(fecha_inicio);
    }
    if (fecha_fin) {
      whereClauses.push(`df.fecha <= $${paramIndex++}`);
      values.push(fecha_fin);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    query += `
      GROUP BY m.nombre
      ORDER BY total_vendido DESC
      LIMIT 10;
    `;

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los productos más vendidos' });
  }
};

export const getRendimientoEmpleados = async (req: Request, res: Response) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    let query = `
      SELECT
        e.nombre_completo,
        COUNT(re.id_pedido) AS total_pedidos_gestionados
      FROM registro_de_estados re
      JOIN empleados e ON re.dni_empleado = e.dni
      JOIN dim_fecha df ON re.id_fecha::DATE = df.fecha
      WHERE re.dni_empleado IS NOT NULL
    `;

    const values = [];
    let paramIndex = 1;

    if (fecha_inicio) {
      query += ` AND df.fecha >= $${paramIndex++}`;
      values.push(fecha_inicio);
    }
    if (fecha_fin) {
      query += ` AND df.fecha <= $${paramIndex++}`;
      values.push(fecha_fin);
    }

    query += `
      GROUP BY e.nombre_completo
      ORDER BY total_pedidos_gestionados DESC;
    `;

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el rendimiento de los empleados' });
  }
};

export const getReporteGastos = async (req: Request, res: Response) => {
  try {
    const { fecha_inicio, fecha_fin, categoria } = req.query;

    let query = `
      SELECT
        g.categoria,
        df.fecha,
        df.nombre_dia,
        df.nombre_mes,
        SUM(g.monto) AS total_gastos
      FROM gastos g
      JOIN dim_fecha df ON g.fk_fecha::DATE = df.fecha
    `;

    const values = [];
    let paramIndex = 1;
    let whereClauses = [];

    if (fecha_inicio) {
      whereClauses.push(`df.fecha >= $${paramIndex++}`);
      values.push(fecha_inicio);
    }
    if (fecha_fin) {
      whereClauses.push(`df.fecha <= $${paramIndex++}`);
      values.push(fecha_fin);
    }
    if (categoria) {
      whereClauses.push(`g.categoria = $${paramIndex++}`);
      values.push(categoria);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    query += `
      GROUP BY g.categoria, df.fecha, df.nombre_dia, df.nombre_mes
      ORDER BY df.fecha ASC;
    `;

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el reporte de gastos' });
  }
};
