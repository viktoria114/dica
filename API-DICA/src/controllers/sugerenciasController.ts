

import { Request, Response } from "express";
import { Sugerencia } from "../models/sugerencia";
import { pool } from "../config/db";
import { error } from "console";

export const crearSugerencia = async (req: Request, res: Response): Promise<void> => {
    //Completar  1) Recibir la url con el teléfono en la ruta y asignarlo a una variable
    //           2) Petición a la BD para obtener el ID con el teléfono.
    //           3) Crear el objeto sugerencia y asignarle los valores.
    //           4) Insertar en la BD con la nueva sugerencia (objeto)
    try{
        const {descripcion} = req.body;
        const {telefono} = req.params

        const query = `
        SELECT * FROM clientes
         WHERE telefono = $1;  
         `;         //AND visibilidad true?

         const resultado = await pool.query(query, [telefono]);

         if(resultado.rows.length === 0){
            res.status(404).json({ error: 'Cliente no encontrado con ese número de teléfono'})
            return;
         }
         const idCliente = resultado.rows[0].telefono;

         const nuevaSugerencia = new Sugerencia(null, descripcion, new Date(), idCliente);

         const query1 = `
         INSERT INTO sugerencias (descripción, fecha, fk_cliente )
         VALUES ($1, $2, $3)
         RETURNING *;
         `;

         const values = [
            nuevaSugerencia.descripcion,
            nuevaSugerencia.fecha,
            nuevaSugerencia.fk_cliente
         ];

         const result = await pool.query(query1,values);

         res.status(201).json({
            mensaje: 'Sugerencia creada exitosamente',
            Sugerencia: result.rows[0],
         });

    } catch (error: any){
        console.error('Error al crear sugerencia:', error.message);
        res.status(400).json({error: error.message})
    }
};

export const modificarSugerencia = async (req: Request, res: Response): Promise<void> => {
    //completar
};

export const obtenerSugerencias = async (req: Request, res: Response): Promise<void> => {
    try{
        const result = await pool.query<Sugerencia>("SELECT * FROM sugerencias");
        const sugerencias = result.rows;


        res.status(200).json(sugerencias);
    }catch(error){
        console.error("❌ Error al obtener sugerencias:", error);
        res.status(500).json({message: "Error al obtener sugerencias"});
    }
};




