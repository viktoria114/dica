
import { Request, Response } from "express";
import { Stock } from "../models/stock";
import { RegistroStock } from "../models/registroStock";
import {pool} from '../config/db';

export const crearStock = async (req: Request, res: Response): Promise<void> => {
    try{
        const {nombre, stock_actual,vencimiento, tipo, stock_minimo} = req.body;

        const nuevoStock = new Stock(null, nombre, stock_actual, vencimiento, tipo, stock_minimo)

        const query = `
            INSERT INTO stock (nombre, stock_actual, vencimiento, tipo, stock_minimo, visibilidad)
            VALUES  ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const values = [
            nuevoStock.nombre,
            nuevoStock.stock_actual,
            nuevoStock.vencimiento,
            nuevoStock.tipo,
            nuevoStock.stock_minimo,
            nuevoStock.visibilidad
        ];

        const resultado = await pool.query(query, values)
        res.status(201).json({
            mensaje: 'Stock creado exitosamente',
            Producto: resultado.rows[0],
        });
    } catch (error: any) {
        console.error('Error al crear stock:', error.message);
        res.status(400).json({ error: error.message});
    }
};

export const getStockVisible = async (req: Request, res: Response): Promise<void> =>{
    try{
        const result = await pool.query<Stock>("SELECT * FROM stock WHERE visibilidad = TRUE");
        const stock = result.rows;

        res.status(200).json(stock);
    } catch (error){
        console.error("❌ Error al obtener los productos:", error);
        res.status(500).json({message: "Error al obtener los productos"});
    }
};

export const getStockNoVisible = async (req: Request, res: Response): Promise<void> =>{
    try{
        const result = await pool.query<Stock>("SELECT * FROM stock WHERE visibilidad = FALSE");
        const stock = result.rows;

        res.status(200).json(stock);
    } catch (error){
        console.error("❌ Error al obtener los productos:", error);
        res.status(500).json({message: "Error al obtener los productos"});
    }
};

//frontend must send a request after login to check the stock
export const validateLowStock = async (req: Request, res: Response) : Promise <void>=>{
    try{
        const query = 'SELECT * FROM stock WHERE stock_actual < stock_minimo'

        const result = await pool.query(query)

        if (result.rows.length > 0){
            const rows = result.rows
            res.status(200).json(rows)
        }else{
            res.status(200).json([])
        }
    
    } catch(error: any){
        console.error("error tratando de validar stock: ", error);
        res.status(500).json({message:"Error al validar stock disponible"})
    }
}

export const CrearRegistroStock = async (req: Request, res: Response): Promise<void> => {
    const stockId = parseInt(req.params.id, 10);
    const { cantidad } = req.body;

    try {
        const nuevoRegistro = new RegistroStock(null, cantidad, stockId);

        var query = `
            INSERT INTO registro_stock (cantidad, fk_id_stock, fk_fecha)
            VALUES ($1, $2, $3)
            RETURNING id
        `;

        const valores = [nuevoRegistro.cantidad, nuevoRegistro.fk_stock, nuevoRegistro.fk_fecha];

        const resultadoRegistro = await pool.query(query, valores);

        query = `
            UPDATE stock
            SET stock_actual = stock_actual + $1
            WHERE id = $2
            RETURNING id;          
        `;

        const resultadoStock = await pool.query(query, [
            nuevoRegistro.cantidad,
            nuevoRegistro.fk_stock
        ])

        res.status(201).json({
            mensaje: 'Registro de stock creado exitosamente.',
            idRegistro: resultadoRegistro.rows[0].id
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const GetRegistrosStock = async (req: Request, res: Response): Promise<void> => {
    const stockId = parseInt(req.params.id, 10);

    if (isNaN(stockId)) {
        res.status(400).json({ error: 'ID de stock inválido.' });
        return;
    }

    try {
        const consulta = `
            SELECT id, cantidad, fk_id_stock, fk_fecha
            FROM registro_stock
            WHERE fk_id_stock = $1
            ORDER BY fk_fecha DESC
        `;

        const resultado = await pool.query(consulta, [stockId]);

        if (resultado.rowCount === 0) {
            res.status(404).json({ mensaje: 'No se encontraron registros para este stock.' });
            return;
        }

        res.status(200).json(resultado.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarRegistroStock = async (req: Request, res: Response): Promise<void> => {
    const registroId = parseInt(req.params.id, 10);

    if (isNaN(registroId)) {
        res.status(400).json({ error: 'ID de registro inválido.' });
        return;
    }

    try {
        const consultaExistencia = await pool.query(
            'SELECT cantidad, fk_id_stock FROM registro_stock WHERE id = $1',
            [registroId]
        );

        if (consultaExistencia.rowCount === 0) {
            res.status(404).json({ error: 'Registro no encontrado.' });
            return;
        }

        const { cantidad, fk_id_stock } = consultaExistencia.rows[0];

        // Eliminar el registro
        await pool.query(
            'DELETE FROM registro_stock WHERE id = $1',
            [registroId]
        );

        const query = `
            UPDATE stock
            SET stock_actual = stock_actual - $1
            WHERE id = $2
            RETURNING id;          
        `;

        await pool.query(query, [cantidad, fk_id_stock]);

        res.status(200).json({ mensaje: 'Registro eliminado exitosamente.' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};