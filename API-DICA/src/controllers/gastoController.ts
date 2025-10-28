//gastoController.ts

import { PoolClient } from 'pg';
import { pool } from "../config/db"
import { Request, Response } from 'express'
import { Gasto } from '../models/gasto' 
import { RegistroStock } from '../models/registroStock';

export const crearGasto = async (req: Request, res: Response): Promise<void> => {

  const client: PoolClient = await pool.connect();

  try {
    const { fk_stock, monto, cantidad, categoria, metodo_de_pago, descripcion, fecha } = req.body;

    await client.query('BEGIN');

    //si el gasto esta asociado a un item de stock, entonces se crea un registro de stock
    let registroID: number
    let nuevoGasto: Gasto


    if (fk_stock !== undefined){

      const nuevoRegistroStock = new RegistroStock(
          null,
          cantidad, //cantidad inicial
          cantidad, //cantidad actual
          fk_stock,
          "disponible",
        
      )
      
      const registroQuery = `
        INSERT INTO registro_stock (cantidad_inicial, cantidad_actual, fk_stock, fk_fecha, estado, visibilidad)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, cantidad_inicial;
      `

      const registroValues = [
          nuevoRegistroStock.cantidadInicial, 
          nuevoRegistroStock.cantidadActual,
          nuevoRegistroStock.fk_stock, 
          nuevoRegistroStock.fk_fecha,
          nuevoRegistroStock.estado,
          nuevoRegistroStock.visibilidad
      ];

      const registroResult = await client.query(registroQuery, registroValues);

      registroID = registroResult.rows[0].id

      nuevoGasto = new Gasto(
        null,
        monto,
        categoria,
        metodo_de_pago,
        descripcion,
        registroID,
        fecha ? new Date(fecha) : new Date()
      );

    }else{
      nuevoGasto = new Gasto(
        null,
        monto,
        categoria,
        metodo_de_pago,
        descripcion,
        null,
        fecha ? new Date(fecha) : new Date()
      );
    }

    console.log("nuevo gasto: ",nuevoGasto)

    const gastoQuery = `
      INSERT INTO gastos (monto, categoria, descripcion, fk_fecha, fk_registro_stock, metodo_pago)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const gastoValues = [
      nuevoGasto.monto,
      nuevoGasto.categoria,
      nuevoGasto.descripcion,
      nuevoGasto.fecha,
      nuevoGasto.fk_registro_stock,
      nuevoGasto.metodoDePago,
    ];

    const gastoResult = await client.query(gastoQuery, gastoValues);
    const gastoCreado = gastoResult.rows[0];

    const stockQuery = `
      UPDATE stock
      SET stock_actual = stock_actual + $1
      WHERE id = $2;
    `;

    if (fk_stock !== null){
      await client.query(stockQuery, [cantidad, fk_stock]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Gasto creado y stock actualizado exitosamente.',
      gasto: gastoCreado,
    });

  } catch (error: any) {

    await client.query('ROLLBACK');
    console.error('Error en la transacción de crear gasto:', error.message);

    if (error.message.includes("inválida") || error.message.includes("debe ser")) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error interno del servidor al crear el gasto.' });
    }
  } finally {
    client.release();
  }
};

export const modificarGasto = async (req: Request, res: Response): Promise<void> => {
  const client: PoolClient = await pool.connect();

  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'El ID proporcionado no es un número válido.' });
      return;
    }

    await client.query('BEGIN');

    // Extraer body
    const { fk_stock, monto, cantidad, categoria, descripcion, metodo_de_pago, fecha } = req.body;

    // Buscar gasto existente (incluyendo cantidad para diferencia de stock)
    const gastoAnteriorResult = await client.query(
      `SELECT g.id, g.fk_registro_stock, g.monto, rs.cantidad_inicial, rs.cantidad_actual, rs.fk_stock
       FROM gastos g
       LEFT JOIN registro_stock rs ON g.fk_registro_stock = rs.id
       WHERE g.id = $1`,
      [id]
    );

    if (gastoAnteriorResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Gasto no encontrado.' });
      return;
    }

    const gastoAnterior = gastoAnteriorResult.rows[0];
    let registroStockId = gastoAnterior.fk_registro_stock;

    // Si antes no tenía registro de stock pero ahora si, crear uno nuevo
    if (!registroStockId && fk_stock !== null) {
      const nuevoRegistroStock = new RegistroStock(
        null,
        cantidad,
        cantidad,
        fk_stock,
        "disponible",
        fecha ? new Date(fecha) : new Date(),
        true
      );

      const registroQuery = `
        INSERT INTO registro_stock (cantidad_inicial, cantidad_actual, fk_stock, fk_fecha, estado, visibilidad)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
      `;

      const registroInsert = await client.query(registroQuery, [
        nuevoRegistroStock.cantidadInicial,
        nuevoRegistroStock.cantidadActual,
        nuevoRegistroStock.fk_stock,
        nuevoRegistroStock.fk_fecha,
        nuevoRegistroStock.estado,
        nuevoRegistroStock.visibilidad,
      ]);

      registroStockId = registroInsert.rows[0].id;
    }

    // Si ya existía un registro de stock, actualizarlo
    if (registroStockId && fk_stock !== null) {
      const updateRegistroQuery = `
        UPDATE registro_stock
        SET fk_stock = $1,
            cantidad_inicial = $2,
            cantidad_actual = $2 - (cantidad_inicial - cantidad_actual)
        WHERE id = $3;
      `;
      await client.query(updateRegistroQuery, [fk_stock, cantidad, registroStockId]);
    }

    // Construir objeto gasto actualizado
    const gastoActualizado = new Gasto(
      id,
      monto,
      categoria,
      metodo_de_pago,
      descripcion,
      registroStockId,
      fecha ? new Date(fecha) : new Date()
    );

    // Actualizar gasto
    const updateGastoQuery = `
      UPDATE gastos
      SET monto = $1,
          categoria = $2,
          descripcion = $3,
          fk_fecha = $4,
          fk_registro_stock = $5,
          metodo_pago = $6
      WHERE id = $7
      RETURNING *;
    `;
    const updatedGastoResult = await client.query(updateGastoQuery, [
      gastoActualizado.monto,
      gastoActualizado.categoria,
      gastoActualizado.descripcion,
      gastoActualizado.fecha,
      gastoActualizado.fk_registro_stock,
      gastoActualizado.metodoDePago,
      gastoActualizado.id,
    ]);

    // Ajuste del stock global si aplica
    if (fk_stock !== null) {
      const diferenciaStock = cantidad - (gastoAnterior.cantidad_inicial || 0);
      const updateStockQuery = 'UPDATE stock SET stock_actual = stock_actual + $1 WHERE id = $2;';
      await client.query(updateStockQuery, [diferenciaStock, fk_stock]);
    }

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Gasto modificado y stock ajustado exitosamente.',
      gasto: updatedGastoResult.rows[0],
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error en la transacción de modificar gasto:', error.message);
    if (error.message.includes("inválida") || error.message.includes("debe ser")) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error interno del servidor al modificar el gasto.' });
    }
  } finally {
    client.release();
  }
};

export const eliminarGasto = async (req: Request, res: Response): Promise<void> => {
  const client: PoolClient = await pool.connect();

  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'El ID proporcionado no es un número válido.' });
      return;
    }

    await client.query('BEGIN');
    
    const gastoResult = await client.query('SELECT fk_registro_stock FROM gastos WHERE id = $1', [id]);
    if (gastoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Gasto no encontrado.' });
      return;
    }
    const fk_registro_stock = gastoResult.rows[0].fk_registro_stock;

    const registroAsociado = await client.query(
      'SELECT cantidad_actual, fk_stock FROM registro_stock WHERE id = $1', [fk_registro_stock]
    )

    //si existe un registro, hay stock por eliminar
    if(registroAsociado.rows.length !== 0){

      const {cantidad_actual, fk_stock} = registroAsociado.rows[0]

      //se actualiza el stock disponible

      const updateStockQuery = 
        `UPDATE stock 
        SET stock_actual = GREATEST(stock_actual - $1, 0)
        WHERE id = $2;`
      await client.query(updateStockQuery, [cantidad_actual, fk_stock]);

      //se elimina el gasto
      await client.query('DELETE FROM gastos WHERE id = $1', [id]);

      //se elimina el registro de stock asociado al gasto
      await client.query('DELETE FROM registro_stock WHERE id = $1', [fk_registro_stock])
    }else{
      //solo se elimina el gasto
      await client.query('DELETE FROM gastos WHERE id = $1', [id]);
    }
    
    await client.query('COMMIT');
    res.status(200).json({ message: 'Gasto eliminado y stock revertido exitosamente.' });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error en la transacción de eliminar gasto:', error.message);
    res.status(500).json({ error: 'Error interno del servidor al eliminar el gasto.' });
  } finally {
    client.release();
  }
};