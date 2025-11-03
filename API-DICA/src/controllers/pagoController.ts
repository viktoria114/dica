import { Request, Response } from "express";   
import { pool } from "../config/db";
import { Pago } from "../models/pago";
import { error } from "console";

//Crear pago
export  const crearPago = async (req: Request, res: Response): Promise<void> => {
    try{
        const { monto, metodoDePago, comprobantePago, validado, fk_pedido, fk_fecha, hora } = req.body;

        const nuevoPago = new Pago(null, monto, metodoDePago, comprobantePago, validado, fk_pedido, fk_fecha, hora)

        const query = `
            INSERT INTO pagos (monto, metodo_pago, comprobante_pago, validado, fk_pedido, fk_fecha, hora)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;

        const values = [
            nuevoPago.monto,
            nuevoPago.metodoDePago,
            nuevoPago.comprobantePago,
            nuevoPago.validado,
            nuevoPago.fk_pedido,
            nuevoPago.fk_fecha,
            nuevoPago.hora
        ];

        const resultado = await pool.query(query, values)
        res.status(201).json({
            mensaje: 'Pago creado exitosamente',
            Pago: resultado.rows[0]
        });
    } catch (error: any) {
        console.error("Error al crear el pago:", error.message);
        res.status(400).json({ error: error.message})
    }

};

//Modificar pago
export  const actualizarPago = async (req: Request, res: Response): Promise<void> => {
    try{
        const { id } = req.params;
        const { monto, metodo_pago, comprobante_pago, validado, fk_pedido, fk_fecha, hora } = req.body;

        const fecha = new Date(fk_fecha.replace(/\//g, '-'));

        console.log(req.body)
        const query = `
        UPDATE pagos
        SET monto = $1, metodo_pago = $2, comprobante_pago = $3, validado = $4, fk_pedido = $5, fk_fecha = $6, hora = $7
        WHERE id = $8
        RETURNING *;
        `;
        const nuevo_pago = new Pago(null, monto, metodo_pago, comprobante_pago, validado, fk_pedido, fecha, hora)


        const valores = [
            nuevo_pago.monto,
            nuevo_pago.metodoDePago,
            nuevo_pago.comprobantePago,
            nuevo_pago.validado,
            nuevo_pago.fk_pedido,
            nuevo_pago.fk_fecha,
            nuevo_pago.hora,
            id
        ];

        const resultado = await pool.query(query,valores);

        if (resultado.rows.length === 0) {
            res.status(404).json({
                mensaje: `No se encontró ningún pago con el id ${id}`,
            });
            return;
        }        

        res.status(200).json({
            mensaje: 'Pago actualizado correctamente',
            pago: resultado.rows[0],
        });
    } catch (error: any) {
        console.error('Error al actualizar pago:', error.message);
        res.status(500).json({ error: error.message}) //Revisar por el frontend
        
    }

};

//Obtener pago por ID
export  const getPagoPorId = async (req: Request, res: Response): Promise<void> => {
    try{
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ error: 'id requerido'});
            return;
        }

        //Buscar pago
        const consulta = await pool.query('SELECT * FROM pagos WHERE id = $1', [id]);
        const pago = consulta.rows[0];

        if (!pago){
            res.status(404).json({ error: 'Pago no encontrado'});
            return;
        }

        res.status(200).json({
            mensaje: "Pago obtenido correctamente",
            Pago:pago
        })
    } catch (error: any) {
        console.error('Error al obtener el pago', error)
    res.status(400).json({error: error.message});
    }
};

//Obtener pagos
export  const getPagos = async (req: Request, res: Response): Promise<void> => {
    const { year, month } = req.query;
    try{
        let query = "SELECT * FROM pagos";
        const params: (string | number)[] = [];
        let whereClause = '';

        if (year) {
          whereClause += `EXTRACT(YEAR FROM fk_fecha) = $${params.length + 1}`;
          params.push(year as string);
        }

        if (month) {
          if (whereClause) whereClause += ' AND ';
          whereClause += `EXTRACT(MONTH FROM fk_fecha) = $${params.length + 1}`;
          params.push(month as string);
        }

        if (whereClause) {
          query += ` WHERE ${whereClause}`;
        }

        const result = await pool.query<Pago>(query, params);
        const pagos = result.rows;

        res.status(200).json(pagos);
    } catch (error: any) {
        console.error("❌ Error al obtener los pagos:", error);
        res.status(500).json({message: "Error al obtener los pagos"});
        
    }
};



//Obtener pagos
export  const eliminarPagos= async (req: Request, res: Response): Promise<void> => {
    const {id} = req.params;
    try{
        await pool.query("DELETE FROM pagos WHERE id = $1", [id]);

        res.status(200).json({message:`Pago con id: ${id}, eliminado correctamente`});
    } catch (error: any) {
        console.error("Error al eliminar el pago:", error);
        res.status(500).json({message: "Error al eliminar el pago"});
        
    }
};



