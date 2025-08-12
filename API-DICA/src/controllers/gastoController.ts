//gastoController.ts

import { PoolClient } from 'pg';
import { pool } from "../config/db"
import { Request, Response } from 'express'
import { Gasto } from '../models/gasto' 
import { RegistroStock } from '../models/registroStock';

export const crearGasto = async (req: Request, res: Response): Promise<void> => {

  const client: PoolClient = await pool.connect();

  try {
    const { fk_stock, monto, cantidad, categoria, descripcion, fecha } = req.body;

    const nuevoGasto = new Gasto(
      null,
      fk_stock,
      monto,
      cantidad,
      categoria,
      descripcion,
      fecha ? new Date(fecha) : new Date()
    );

    await client.query('BEGIN');

    const gastoQuery = `
      INSERT INTO gastos (fk_stock, monto, cantidad, categoria, descripcion, fk_fecha)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const gastoValues = [
      nuevoGasto.fk_stock,
      nuevoGasto.monto,
      nuevoGasto.cantidad,
      nuevoGasto.categoria,
      nuevoGasto.descripcion,
      nuevoGasto.fecha,
    ];
    const gastoResult = await client.query(gastoQuery, gastoValues);
    const gastoCreado = gastoResult.rows[0];

    const registroQuery = `
      INSERT INTO registro_stock (cantidad, fk_id_stock, fk_fecha, estado, modificado)
      VALUES ($1, $2, $3, $4);
    `;

    const nuevoRegistroStock = new RegistroStock(
        null,
        nuevoGasto.cantidad,
        nuevoGasto.fk_stock,
        "disponible",
        false,
        nuevoGasto.fecha
    )
    

    const registroValues = [
        nuevoRegistroStock.cantidad, 
        nuevoRegistroStock.fk_stock, 
        nuevoRegistroStock.fk_fecha,
        nuevoRegistroStock.estado,
        nuevoRegistroStock.modificado
    ];

    await client.query(registroQuery, registroValues);

    const stockQuery = `
      UPDATE stock
      SET stock_actual = stock_actual + $1
      WHERE id = $2;
    `;
    await client.query(stockQuery, [nuevoGasto.cantidad, nuevoGasto.fk_stock]);

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

    const gastoAnteriorResult = await client.query('SELECT * FROM gastos WHERE id = $1', [id]);
    if (gastoAnteriorResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Gasto no encontrado.' });
      client.release(); 
      return;
    }

    const gastoAnterior = gastoAnteriorResult.rows[0];
    const cantidadAnterior = gastoAnterior.cantidad;

    //solucion berreta, se asume que solo hay un registro que cumple las condiciones
    const registroAnterior = await client.query(
        'SELECT * FROM registro_stock WHERE fk_id_stock = $1 AND fk_fecha = $2 LIMIT 1',
        [gastoAnterior.fk_stock, gastoAnterior.fk_fecha]
    )

    if(registroAnterior.rows[0].modificado || registroAnterior.rows.length === 0){
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'El registro stock ya esta en uso. No se pudo actualizar el gasto.'});
      client.release(); 
      return;
    }


    //TODO: si fk_stock cambia, hay que restarles el stock actual a stock y elminiar el registro_stock asociado
 
    //extraer body de la peticion
    const { fk_stock, monto, cantidad, categoria, descripcion, fecha } = req.body;

    //verificar reglas de negocio
    const gastoActualizado = new Gasto(
      id, fk_stock, monto, cantidad, categoria, descripcion, fecha ? new Date(fecha) : new Date()
    );

    const updateGastoQuery = `
      UPDATE gastos
      SET fk_stock = $1, monto = $2, cantidad = $3, categoria = $4, descripcion = $5, fk_fecha = $6
      WHERE id = $7
      RETURNING *;
    `;
    const updatedGastoResult = await client.query(updateGastoQuery, [
      gastoActualizado.fk_stock, gastoActualizado.monto, gastoActualizado.cantidad,
      gastoActualizado.categoria, gastoActualizado.descripcion, gastoActualizado.fecha, id
    ]);
    
    const diferenciaStock = gastoActualizado.cantidad - cantidadAnterior;
    const updateStockQuery = 'UPDATE stock SET stock_actual = stock_actual + $1 WHERE id = $2;';
    await client.query(updateStockQuery, [diferenciaStock, gastoActualizado.fk_stock]);

    const updateRegisterStockQuery = 'UPDATE registro_stock SET cantidad = $1'
    await client.query(updateRegisterStockQuery, [gastoActualizado.cantidad])

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
    
    const gastoResult = await client.query('SELECT cantidad, fk_stock, fk_fecha, modificado FROM gastos WHERE id = $1', [id]);
    if (gastoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Gasto no encontrado.' });
      client.release();
      return;
    }
    const { cantidad, fk_stock, fk_fecha, modificado } = gastoResult.rows[0];

    //solucion berreta, se asume que siempre habra un solo registro que cumple las condiciones
    const registroAsociado = await client.query(
            'SELECT * FROM registro_stock WHERE fk_id_stock = $1 AND fk_fecha = $2 LIMIT 1',
            [fk_stock, fk_fecha]
        )

    if(modificado || registroAsociado.rows.length === 0){
        await client.query('ROLLBACK');
        res.status(404).json({ error: 'El registro stock ya esta en uso. No se pudo eliminar el gasto.'});
        client.release(); 
        return;
    }
    
    //se actualiza el stock disponible
    const updateStockQuery = 'UPDATE stock SET stock_actual = stock_actual - $1 WHERE id = $2;';
    await client.query(updateStockQuery, [cantidad, fk_stock]);

    //se elimina el registro de stock asociado al gasto
    await client.query('DELETE FROM registro_stock WHERE id = $1', [registroAsociado.rows[0].id])

    //se elimina el gasto en si
    await client.query('DELETE FROM gastos WHERE id = $1', [id]);
    
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