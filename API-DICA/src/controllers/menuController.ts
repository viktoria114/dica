import { Request, Response } from "express";
import { PoolClient } from "pg";
import {pool} from '../config/db';
import { Menu } from "../models/menu";

export const crearMenu = async (req: Request, res: Response) => {
    const client: PoolClient = await pool.connect();
    try {
        const { nombre, precio, descripcion, categoria, stocks } = req.body;
        /**
         * `stocks` debe ser un arreglo con la forma:
         * [
         *   { id_stock: number, cantidad_necesaria: number },
         *   { id_stock: number, cantidad_necesaria: number }
         * ]
         */

        if (!Array.isArray(stocks) || stocks.length === 0) {
            return res.status(400).json({ message: "Se requiere al menos un stock asociado" });
        }

        await client.query("BEGIN");

        const menu = new Menu(null, nombre,precio,descripcion,categoria, true)

        // Insertar en menú
        const menuQuery = `
            INSERT INTO menu (nombre, precio, descripcion, categoria, visibilidad)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `;
        const { rows: menuRows } = await client.query(menuQuery, [
            menu.nombre,
            menu.precio,
            menu.descripcion,
            menu.categoria,
            menu.visibilidad
        ]
        );
        const menuId = menuRows[0].id;

        // Insertar en menu_stock
        const stockQuery = `
            INSERT INTO menu_stock (fk_menu, fk_stock, cantidad_necesaria)
            VALUES ($1, $2, $3);
        `;

        for (const item of stocks) {
            if (!item.id_stock || typeof item.cantidad_necesaria !== "number") {
                throw new Error("Cada stock debe tener 'id_stock' y 'cantidad_necesaria' válidos");
            }
            await client.query(stockQuery, [menuId, item.id_stock, item.cantidad_necesaria]);
        }

        await client.query("COMMIT");

        res.status(201).json({ id: menuId, message: "Menú creado con exito" });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ message: "Error al crear el menú con stocks" });
    } finally {
        client.release();
    }
};

export const actualizarMenu = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, precio, descripcion, categoria} = req.body;

        const query = `
            UPDATE menu
            SET nombre = $1, precio = $2, descripcion = $3, categoria = $4
            WHERE id = $5
            RETURNING *;
        `;

        const menu = new Menu(null, nombre, precio, descripcion, categoria)

        const { rows } = await pool.query(query, [
            menu.nombre,
            menu.precio,
            menu.descripcion,
            menu.categoria,
            id
        ]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Menú no encontrado" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar el menú" });
    }
};

export const getListaMenu = async (_req: Request, res: Response) => {
    try {
        const query = `SELECT * FROM menu WHERE visibilidad = true ORDER BY id ASC;`;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el menú visible" });
    }
};

export const getListaCompletaMenu = async (_req: Request, res: Response) => {
    try {
        const query = `SELECT * FROM menu ORDER BY id ASC;`;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el menú completo" });
    }
};

export const eliminarMenu = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const query = `
            UPDATE menu
            SET visibilidad = false
            WHERE id = $1
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Menú no encontrado" });
        }

        res.json({ message: "Menú ocultado correctamente", menu: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al ocultar el menú" });
    }
};

export const restaurarMenu = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const query = `
            UPDATE menu
            SET visibilidad = true
            WHERE id = $1
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Menú no encontrado" });
        }

        res.json({ message: "Menú restaurado correctamente", menu: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al restaurar el menú" });
    }
};

export const getMenuImage = async (req: Request, res: Response) => {
    try {

        // numero de destino en formato internacional
        const { to } = req.body; 

        const url = `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`

        const payload = {
            messaging_product: 'whatsapp',
            to: to,
            type: 'image',
            image: {
                link: 'https://i.pinimg.com/474x/42/c8/7a/42c87a15800892822015164f65e0ece9.jpg'
            },
        };

        const response = await fetch(url,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(JSON.stringify(data));
        }

        return res.status(200).json("Imagen del menu enviada con exito");
    } catch (err: any) {
        console.error("Error enviando imagen:", err);

        return res.status(500).json(err.message || err);
    }
};