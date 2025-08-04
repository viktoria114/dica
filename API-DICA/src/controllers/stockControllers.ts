
import { Request, Response } from "express";
import { Stock } from "../models/stock";
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