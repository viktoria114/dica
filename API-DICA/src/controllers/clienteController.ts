// controllers/cliente.controller.ts

import { Request, Response } from 'express';
import { Cliente } from '../models/cliente';
import { pool } from '../config/db';

export const crearCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const {nombre, telefono, preferencia } = req.body;

    const nuevoCliente = new Cliente(null, nombre, telefono, preferencia,null);

    const query = `
      INSERT INTO clientes (nombre, telefono, preferencia, ultima_compra, visibilidad, agent_session_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      nuevoCliente.nombre,
      nuevoCliente.telefono,
      nuevoCliente.preferencia,
      nuevoCliente.ultimaCompra,
      nuevoCliente.visibilidad,
      nuevoCliente.agentSessionID
    ];

    const resultado = await pool.query(query, values);

    res.status(201).json({
      mensaje: 'Cliente creado exitosamente',
      cliente: resultado.rows[0],
    });
  } catch (error: any) {
    console.error('Error al crear cliente:', error.message);
    res.status(400).json({ error: error.message });
  }
};

export const actualizarCliente = async (req: Request, res: Response): Promise<void> => {

  try {
    const { id } = req.params;

    const clientID: number = +id
    const { nombre, telefono, preferencia, session, visibilidad } = req.body;

    if (!id) {
      res.status(400).json({ error: 'ID requerido' });
      return;
    }

    const resultadoActual = await pool.query(`SELECT * FROM clientes WHERE id = $1`, [id]);

    if (resultadoActual.rows.length === 0) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    const actual = resultadoActual.rows[0];

    const clienteNuevo = new Cliente(
      clientID,
      nombre,
      telefono,
      preferencia,
      session,
      new Date(actual.ultima_compra), // mantener la fecha original
      visibilidad ?? actual.visibilidad
    );

    const sinCambios =
      actual.nombre === clienteNuevo.nombre &&
      actual.telefono === clienteNuevo.telefono &&
      actual.preferencia === clienteNuevo.preferencia &&
      actual.visibilidad === clienteNuevo.visibilidad;

    if (sinCambios) {
      res.status(200).json({
        mensaje: 'No hubo cambios en los datos del cliente',
        cliente: actual,
      });
      return;
    }

    const query = `
      UPDATE clientes 
      SET nombre = $1, telefono = $2, preferencia = $3, visibilidad = $4
      WHERE id = $5
      RETURNING *;
    `;

    const valores = [
      clienteNuevo.nombre,
      clienteNuevo.telefono,
      clienteNuevo.preferencia,
      clienteNuevo.visibilidad,
      clienteNuevo.id,
    ];

    const resultado = await pool.query(query, valores);

    res.status(200).json({
      mensaje: 'Cliente actualizado correctamente',
      cliente: resultado.rows[0],
    });
  } catch (error: any) {
    console.error('Error al actualizar cliente:', error.message);
    res.status(400).json({ error: error.message });
  }
};

export const eliminarCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'ID requerido' });
      return;
    }

    // Buscar cliente actual
    const consulta = await pool.query(`SELECT * FROM clientes WHERE id = $1`, [id]);
    const actual = consulta.rows[0];

    if (!actual) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    const cliente = new Cliente(
      actual.id,
      actual.nombre,
      actual.telefono,
      actual.preferencia,
      actual.agent_session_id,
      new Date(actual.ultima_compra),
      actual.visibilidad,
    );

    cliente.desactivar();

    const resultado = await pool.query(
      `UPDATE clientes SET visibilidad = false WHERE id = $1 RETURNING *;`,
      [cliente.id]
    );

    res.status(200).json({
      mensaje: 'Cliente eliminado correctamente (soft delete)',
      cliente: resultado.rows[0],
    });
  } catch (error: any) {
    console.error('Error al eliminar cliente:', error.message);
    res.status(400).json({ error: error.message });
  }
};

export const restaurarCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'ID requerido' });
      return;
    }

    // Buscar cliente actual
    const consulta = await pool.query(`SELECT * FROM clientes WHERE id = $1`, [id]);
    const actual = consulta.rows[0];

    if (!actual) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    const cliente = new Cliente(
      actual.id,
      actual.nombre,
      actual.telefono,
      actual.preferencia,
      actual.agent_session_id,
      new Date(actual.ultima_compra),
      actual.visibilidad,
    );

    cliente.reactivar();

    const resultado = await pool.query(
      `UPDATE clientes SET visibilidad = true WHERE id = $1 RETURNING *;`,
      [cliente.id]
    );

    res.status(200).json({
      mensaje: 'Cliente restaurado correctamente',
      cliente: resultado.rows[0],
    });
  } catch (error: any) {
    console.error('Error al restaurar cliente:', error.message);
    res.status(400).json({ error: error.message });
  }
};

export const obtenerClientePorTelefono = async (req: Request, res: Response): Promise<void> => {
  try {
    const { telefono } = req.params;

    if (!telefono || !/^\d{6,15}$/.test(telefono)) {
      res.status(400).json({ error: 'Número de teléfono inválido' });
      return;
    }

    const query = `
      SELECT * FROM clientes 
      WHERE telefono = $1 AND visibilidad = true;
    `;

    const resultado = await pool.query(query, [telefono]);

    if (resultado.rows.length === 0) {
      res.status(404).json({ error: 'Cliente no encontrado con ese número de teléfono' });
      return;
    }

    res.status(200).json({
      mensaje: 'Cliente encontrado',
      cliente: resultado.rows[0],
    });
  } catch (error: any) {
    console.error('Error al buscar cliente por teléfono:', error.message);
    res.status(500).json({ error: 'Error interno al buscar cliente' });
  }
};