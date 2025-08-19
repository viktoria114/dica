import { Request, Response } from 'express';
import { PoolClient } from 'pg';
import { pool } from '../config/db';
import { Pedido } from '../models/pedido';
import { MessagePort } from 'worker_threads';

export const crearPedido = async (req: Request, res: Response) => {
    const client: PoolClient = await pool.connect();
    try {
        const { fk_empleado, fk_cliente, ubicacion, observacion, items_menu } =
            req.body;

        await client.query('BEGIN');

        const pedido = new Pedido(
            null,
            null,
            null,
            null,
            fk_empleado,
            fk_cliente,
            ubicacion,
            observacion,
            true,
        );

        // Insertar el pedido
        const pedidoQuery = `
            INSERT INTO pedidos (fecha, hora, estado, dni_empleado, id_cliente, ubicacion, observaciones, visibilidad)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id;
        `;
        const { rows: pedidoRows } = await client.query(pedidoQuery, [
            new Date(),
            pedido.hora,
            pedido.estado,
            pedido.fk_empleado,
            pedido.fk_cliente,
            pedido.ubicacion,
            pedido.observacion,
            pedido.visibilidad
        ]);

        const pedidoId = pedidoRows[0].id;

        // Insertar en pedidos_menu
        const pedido_menuQuery = `
            INSERT INTO pedidos_menu (fk_pedido, fk_menu, precio_unitario)
            VALUES ($1, $2, $3);
        `;

        for (const item of items_menu) {
            const result = await client.query(
                'SELECT precio FROM menu WHERE id = $1',
                [item.id_menu],
            );
            const precio = result.rows[0].precio;

            await client.query(pedido_menuQuery, [pedidoId, item.id_menu, precio]);
        }

        await client.query('COMMIT');

        res.status(201).json({ id: pedidoId, message: 'Pedido creado con éxito' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: 'Error al crear el pedido' });
    } finally {
        client.release();
    }
};

export const actualizarPedido = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { fk_empleado, fk_cliente, ubicacion, observacion, estado } = req.body;

        const query = `
            UPDATE pedidos
            SET estado = $1, dni_empleado = $2, id_cliente = $3, ubicacion = $4, observaciones = $5
            WHERE id = $6
            RETURNING *;
        `;

        const pedido = new Pedido(
            null,
            null,
            null,
            estado,
            fk_empleado,
            fk_cliente,
            ubicacion,
            observacion,
        );

        const { rows } = await pool.query(query, [
            pedido.estado,
            pedido.fk_empleado,
            pedido.fk_cliente,
            pedido.ubicacion,
            pedido.observacion,

            id
        ]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar el Pedido" });
    }
};

export const getListaPedidos = async (_req: Request, res: Response) => {
    try {
        const query = `SELECT * FROM pedidos WHERE visibilidad = true ORDER BY id ASC;`;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los Pedidos visible" });
    }
};

export const eliminarPedido = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const query = `
            UPDATE pedidos
            SET visibilidad = false
            WHERE id = $1
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }

        res.json({ message: "Pedido ocultado correctamente", pedido: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al ocultar el Pedido" });
    }
};

export const getListaCompletaPedidos = async (_req: Request, res: Response) => {
    try {
        const query = `SELECT * FROM pedidos ORDER BY id ASC;`;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los pedidos" });
    }
};


export const restaurarPedido = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const query = `
            UPDATE pedidos
            SET visibilidad = true
            WHERE id = $1
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }

        res.json({ message: "Pedido restaurado correctamente", menu: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al restaurar el Pedido" });
    }
};

//Logica de negocio

export const agregarItemPedido = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { items_menu } =
            req.body;

        const pedidoId = id;

        // Insertar en pedidos_menu
        const pedido_menuQuery = `
            INSERT INTO pedidos_menu (fk_pedido, fk_menu, precio_unitario)
            VALUES ($1, $2, $3);
        `;

        for (const item of items_menu) {
            const result = await pool.query(
                'SELECT precio FROM menu WHERE id = $1',
                [item.id_menu],
            );
            const precio = result.rows[0].precio;

            await pool.query(pedido_menuQuery, [pedidoId, item.id_menu, precio]);
        }


        res.status(201).json({ id: pedidoId, message: 'Items agregados con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al agregar Items el pedido' });
    };
}

export const eliminarItemsPedido = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body; // Array con los ids de los items a eliminar

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "Debes enviar un array con los IDs a eliminar" });
        }

        // Generamos placeholders ($1, $2, $3, ...)
        const placeholders = ids.map((_, index) => `$${index + 1}`).join(", ");

        const query = `
            DELETE FROM pedidos_menu
            WHERE id IN (${placeholders})
            RETURNING *;
        `;

        const { rows } = await pool.query(query, ids);

        if (rows.length === 0) {
            return res.status(404).json({ message: "No se encontraron items con esos IDs" });
        }

        res.json({ message: "Items eliminados correctamente", eliminados: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar los items" });
    }
};

export const getItemPedido = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        
        const query = `SELECT * FROM pedidos_menu WHERE fk_pedido= $1 ORDER BY id ASC;`;
        const { rows } = await pool.query(query, [id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los Pedidos visible" });
    }
}


//router.get('/:id', mostrarItemPedido)
//router.delete('/:id', eliminarItemPedido)
