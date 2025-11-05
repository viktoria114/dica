import { Request, Response } from 'express';
import { Stock } from '../models/stock';
import { RegistroStock } from '../models/registroStock';
import { pool } from '../config/db';

export const crearStock = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { nombre, vencimiento, tipo, stock_minimo, medida } = req.body;

    const nuevoStock = new Stock(
      null,
      nombre,
      0,
      vencimiento,
      tipo,
      stock_minimo,
      medida,
    );

    const query = `
            INSERT INTO stock (nombre, stock_actual, vencimiento, tipo, stock_minimo, visibilidad, medida)
            VALUES  ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;

    const values = [
      nuevoStock.nombre,
      nuevoStock.stock_actual,
      nuevoStock.vencimiento,
      nuevoStock.tipo,
      nuevoStock.stock_minimo,
      nuevoStock.visibilidad,
      nuevoStock.medida,
    ];

    const resultado = await pool.query(query, values);
    res.status(201).json({
      mensaje: 'Stock creado exitosamente',
      Producto: resultado.rows[0],
    });
  } catch (error: any) {
    console.error('Error al crear stock:', error.message);
    res.status(400).json({ error: error.message });
  }
};

export const actualizarStock = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, stock_actual, vencimiento, tipo, stock_minimo, medida } =
      req.body;

    const query = `
        UPDATE stock
        SET nombre = $1, stock_actual = $2, vencimiento = $3, tipo = $4, stock_minimo = $5, medida = $6
        WHERE id = $7
        RETURNING *;
        `;

    const nuevo_stock = new Stock(
      null,
      nombre,
      stock_actual,
      vencimiento,
      tipo,
      stock_minimo,
      medida,
    );

    const valores = [
      nuevo_stock.nombre,
      nuevo_stock.stock_actual,
      nuevo_stock.vencimiento,
      nuevo_stock.tipo,
      nuevo_stock.stock_minimo,
      nuevo_stock.medida,
      id,
    ];

    const resultado = await pool.query(query, valores);

    if (resultado.rows.length === 0) {
      res.status(404).json({
        mensaje: `No se encontró ningún stock con el id ${id}`,
      });
      return;
    }

    res.status(200).json({
      mensaje: 'Stock actualizado correctamente',
      stock: resultado.rows[0],
    });
  } catch (error: any) {
    console.error('Error al actualizar stock:', error.message);
    res.status(500).json({ error: error.message }); //REVISAR POR EL FRONTEND
  }
};

export const eliminarstock = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'id requerido' });
      return;
    }

    // Buscar stock actual
    const consulta = await pool.query(`SELECT * FROM stock WHERE id = $1`, [
      id,
    ]);
    const actual = consulta.rows[0];

    if (!actual) {
      res.status(404).json({ error: 'stock no encontrado' });
      return;
    }

    const stock = new Stock(
      actual.id,
      actual.nombre,
      actual.stock_actual,
      actual.vencimiento,
      actual.tipo,
      actual.stock_minimo,
      actual.medida,
      actual.visibilidad,
    );
    stock.desactivar();

    const resultado = await pool.query(
      `UPDATE stock SET visibilidad = false WHERE id = $1 RETURNING *;`,
      [stock.id],
    );

    await pool.query(
      //SoftDelete a todos los registros_stock asociados
      `UPDATE registro_stock SET visibilidad = false WHERE fk_stock = $1;`,
      [stock.id],
    );

    res.status(200).json({
      mensaje: 'Stock eliminado correctamente (soft delete)',
      stock: resultado.rows[0],
    });
  } catch (error: any) {
    console.error('Error al eliminar stock:', error.message);
    res.status(400).json({ error: error.message }); //REVISAR PARA LO DEL FRONTEND
  }
};

export const restaurarStock = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'dni requerido' });
      return;
    }

    // Buscar stock actual
    const consulta = await pool.query(`SELECT * FROM stock WHERE id = $1`, [
      id,
    ]);
    const actual = consulta.rows[0];

    if (!actual) {
      res.status(404).json({ error: 'stock no encontrado' });
      return;
    }

    const stock = new Stock(
      actual.id,
      actual.nombre,
      actual.stock_actual,
      actual.vencimiento,
      actual.tipo,
      actual.stock_minimo,
      actual.medida,
      actual.visibilidad,
    );
    stock.reactivar();

    const resultado = await pool.query(
      `UPDATE stock SET visibilidad = true WHERE id = $1 RETURNING *;`,
      [stock.id],
    );

    await pool.query(
      //Restauramos también todos los registros_stock asociados
      `UPDATE registro_stock SET visibilidad = true WHERE fk_stock = $1;`,
      [stock.id],
    );

    res.status(200).json({
      mensaje: 'stock restaurado correctamente',
      stock: resultado.rows[0],
    });
  } catch (error: any) {
    console.error('Error al restaurar el stock:', error.message);
    res.status(400).json({ error: error.message }); //REVISAR PARA EL FRONTEND
  }
};

export const getStockVisible = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await pool.query<Stock>(
      'SELECT * FROM stock WHERE visibilidad = TRUE',
    );
    const stock = result.rows;

    res.status(200).json(stock);
  } catch (error) {
    console.error('❌ Error al obtener los productos:', error);
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
};

export const getStockNoVisible = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await pool.query<Stock>(
      'SELECT * FROM stock WHERE visibilidad = FALSE',
    );
    const stock = result.rows;

    res.status(200).json(stock);
  } catch (error) {
    console.error('❌ Error al obtener los productos:', error);
    res.status(500).json({ message: 'Error al obtener los productos' });
  }
};

//frontend must send a request after login to check the stock
export const validateLowStock = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const query = 'SELECT * FROM stock WHERE stock_actual < stock_minimo';

    const result = await pool.query(query);

    if (result.rows.length > 0) {
      const rows = result.rows;
      res.status(200).json(rows);
    } else {
      res.status(200).json([]);
    }
  } catch (error: any) {
    console.error('error tratando de validar stock: ', error);
    res.status(500).json({ message: 'Error al validar stock disponible' });
  }
};

// controllers de registroStock

export const GetRegistrosStock = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const stockId = parseInt(req.params.id, 10);

  if (isNaN(stockId)) {
    res.status(400).json({ error: 'ID de stock inválido.' });
    return;
  }

  try {
    const consulta = `
            SELECT *
            FROM registro_stock
            WHERE fk_stock = $1
            ORDER BY fk_fecha DESC
        `;

    const resultado = await pool.query(consulta, [stockId]);

    if (resultado.rowCount === 0) {
      res
        .status(404)
        .json({ mensaje: 'No se encontraron registros para este stock.' });
      return;
    }

    res.status(200).json(resultado.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const crearRegistroStock = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cantidad, fk_stock } = req.body;

    if (cantidad <= 0) {
      res
        .status(400)
        .json({ error: 'La cantidad debe ser un número positivo.' });
      return;
    }

    const nuevoRegistro = new RegistroStock(
      null,
      cantidad,
      cantidad,
      fk_stock,
      'disponible',
    );

    const query = `
      INSERT INTO registro_stock (cantidad_inicial, cantidad_actual, fk_stock, fk_fecha, estado, visibilidad)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      nuevoRegistro.cantidadInicial,
      nuevoRegistro.cantidadActual,
      nuevoRegistro.fk_stock,
      nuevoRegistro.fk_fecha,
      nuevoRegistro.estado,
      nuevoRegistro.visibilidad,
    ];

    const result = await pool.query(query, values);

    //AGREGAR AL STOCK ACTUAL LA CANTIDAD INGRESADA
    const stockQuery = `
      UPDATE stock
      SET stock_actual = stock_actual + $1
      WHERE id = $2
    `;

    await pool.query(stockQuery, [
      nuevoRegistro.cantidadActual,
      nuevoRegistro.fk_stock,
    ]);

    res.status(201).json({
      mensaje: 'Registro de stock creado exitosamente.',
      registro: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error al crear registro de stock:', error.message);
    res.status(400).json({ error: error.message });
  }
};

export const actualizarRegistroStock = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { cantidad_inicial, cantidad_actual, fk_stock, estado } = req.body;

    //OBTENER LA CANTIDAD ACTUAL DEL REGISTRO PARA SABER LA DIFERENCIA Y ACTUALIZAR EL STOCK
    const consulta = await pool.query(
      `SELECT * FROM registro_stock WHERE id = $1`,
      [id],
    );
    const actual = consulta.rows[0];

    if (!actual) {
      res.status(404).json({ error: 'Registro de stock no encontrado.' });
      return;
    }

    const query = `
      UPDATE registro_stock
      SET cantidad_inicial = $1, cantidad_actual = $2, fk_stock = $3, estado = $4
      WHERE id = $5
      RETURNING *;
    `;

    const nuevoRegistro = new RegistroStock(
      null,
      cantidad_inicial,
      cantidad_actual,
      fk_stock,
      estado,
    );

    //Ajuste automático de cantidad_actual si cambió la cantidad_inicial
    let nuevaCantidadActual = nuevoRegistro.cantidadActual;

    if (cantidad_inicial !== actual.cantidad_inicial) {
      const diferenciainicial =
        nuevoRegistro.cantidadInicial - actual.cantidad_inicial;
      nuevaCantidadActual = actual.cantidad_actual + diferenciainicial;

      if (nuevaCantidadActual < 0) {
        nuevaCantidadActual = 0; // Evitar que sea negativa REVISAR
      }
    }

    if (nuevaCantidadActual === 0) {
      nuevoRegistro.estado = 'agotado';
    }

    if (nuevoRegistro.estado === 'agotado') {
      nuevaCantidadActual = 0; // Asegurarse de que cantidad_actual sea 0 si está agotado
    }

    if (nuevoRegistro.estado === 'vencido') {
      nuevaCantidadActual = 0; // Asegurarse de que cantidad_actual sea 0 si está vencido
    }

    const values = [
      nuevoRegistro.cantidadInicial,
      nuevaCantidadActual,
      nuevoRegistro.fk_stock,
      nuevoRegistro.estado,
      id,
    ];

    const result = await pool.query(query, values);

    //ACTUALIZAR STOCK ACTUAL EN LA TABLA STOCK
    const diferencia = nuevaCantidadActual - actual.cantidad_actual;

    await pool.query(
      `
      UPDATE stock
      SET stock_actual = stock_actual + $1
      WHERE id = $2
    `,
      [diferencia, nuevoRegistro.fk_stock],
    );

    res.status(200).json({
      mensaje: 'Registro de stock actualizado exitosamente.',
      registro: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error al actualizar registro de stock:', error.message);
    res.status(400).json({ error: error.message });
  }
};

export const eliminarRegistroStock = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'id requerido' });
      return;
    }

    // Buscar registro stock actual
    const consulta = await pool.query(
      `SELECT * FROM registro_stock WHERE id = $1`,
      [id],
    );
    const actual = consulta.rows[0];

    if (!actual) {
      res.status(404).json({ error: 'registro de stock no encontrado' });
      return;
    }

    const query = `
      DELETE FROM registro_stock
      WHERE id = $1
      RETURNING *;
    `;

    const result = await pool.query(query, [id]);

    //USAR "actual" PARA RESTARLE EL STOCK ACTUAL AL TOTAL DEL STOCK CORRESPONDIENTE
    const stockQuery = `
      UPDATE stock
      SET stock_actual = stock_actual - $1
      WHERE id = $2
    `;
    await pool.query(stockQuery, [actual.cantidad_actual, actual.fk_stock]);

    //ELIMINAR GASTO ASOCIADO SI ES QUE EXISTE
    const gastoQuery = `
      DELETE FROM gastos
      WHERE fk_registro_stock = $1
      RETURNING *;
    `;
    await pool.query(gastoQuery, [id]);

    res.status(200).json({
      mensaje: 'Registro de stock eliminado exitosamente.',
      registro: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error al eliminar registro de stock:', error.message);
    res.status(400).json({ error: error.message });
  }
};

export const setVencimientoStock = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const today = new Date();

    await client.query('BEGIN');

    // 1. Obtener todos los productos perecederos
    const { rows: stockRows } = await client.query(`
      SELECT id, stock_actual, vencimiento
      FROM stock
      WHERE tipo = 'PERECEDERO' AND visibilidad = true
    `);

    for (const stock of stockRows) {
      // 2. Obtener registros de stock no vencidos
      const { rows: registros } = await client.query(
        `
        SELECT id, cantidad_inicial, fk_fecha, estado
        FROM registro_stock
        WHERE fk_stock = $1 AND estado = 'disponible'
      `,
        [stock.id],
      );

      for (const reg of registros) {
        const fechaCompra = new Date(reg.fk_fecha);
        const diffDays = Math.floor(
          (today.getTime() - fechaCompra.getTime()) / (1000 * 60 * 60 * 24),
        );

        // 3. Si está vencido
        if (diffDays > stock.vencimiento) {
          // Marcar como vencido
          await client.query(
            `
            UPDATE registro_stock
            SET estado = 'vencido'
            WHERE id = $1
          `,
            [reg.id],
          );

          // Descontar del stock_actual
          await client.query(
            `
            UPDATE stock
            SET stock_actual = stock_actual::numeric - $1
            WHERE id = $2
          `,
            [reg.cantidad_actual, stock.id],
          );
        }
      }
    }

    await client.query('COMMIT');
    res
      .status(200)
      .json({ message: 'Stock vencido actualizado correctamente.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar stock vencido' });
  } finally {
    client.release();
  }
};
