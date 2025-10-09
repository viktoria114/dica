// controllers/cliente.controller.ts

import { Request, Response } from 'express';
import { Cliente } from '../models/cliente';
import { pool } from '../config/db';
import { Client } from 'pg';

// Obtener todos los clientes visibles
export const obtenerClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT telefono, nombre, dieta, preferencias, ultima_compra, agent_session_id
      FROM clientes
      WHERE visibilidad = true
      ORDER BY nombre ASC;
    `;

    const resultado = await pool.query(query);

    res.status(200).json(resultado.rows);
  } catch (error: any) {
    console.error("Error al obtener clientes:", error.message);
    res.status(500).json({ error: "Error interno al obtener clientes" });
  }
};

// Obtener todos los clientes invisibles (soft deleted)
export const obtenerClientesInvisibles = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT telefono, nombre, dieta, preferencias, ultima_compra, agent_session_id
      FROM clientes
      WHERE visibilidad = false
      ORDER BY nombre ASC;
    `;

    const resultado = await pool.query(query);

    res.status(200).json(resultado.rows);
  } catch (error: any) {
    console.error("Error al obtener clientes invisibles:", error.message);
    res.status(500).json({ error: "Error interno al obtener clientes invisibles" });
  }
};


export const crearCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const {telefono, nombre, dieta, preferencias } = req.body;

    const nuevoCliente = new Cliente(telefono, nombre, dieta, preferencias, null);

    const query = `
      INSERT INTO clientes (telefono, nombre, dieta, ultima_compra, visibilidad, agent_session_id, preferencias)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [
      nuevoCliente.telefono,
      nuevoCliente.nombre,
      nuevoCliente.dieta,
      nuevoCliente.ultimaCompra,
      nuevoCliente.visibilidad,
      nuevoCliente.agentSessionID,
      nuevoCliente.preferencias
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
    const { tel } = req.params;

    const { nombre, dieta} = req.body;

    if (!tel) {
      res.status(400).json({ error: 'Telefono requerido' });
      return;
    }

    const resultadoActual = await pool.query(`SELECT * FROM clientes WHERE telefono = $1`, [tel]);

    if (resultadoActual.rows.length === 0) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    const actual = resultadoActual.rows[0]

    const clienteNuevo = new Cliente(
      actual.telefono,
      nombre,
      dieta,
      actual.preferencias,
      actual.agent_session_id,
      new Date(actual.ultima_compra), // mantener la fecha original
      actual.visibilidad
    );

    const query = `
      UPDATE clientes 
      SET nombre = $1, dieta = $2
      WHERE telefono = $3
      RETURNING *;
    `;

    const valores = [
      clienteNuevo.nombre,
      clienteNuevo.dieta,
      clienteNuevo.telefono,
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
    const { tel } = req.params;

    if (!tel) {
      res.status(400).json({ error: 'Telefono requerido' });
      return;
    }

    const telefono = parseInt(tel, 10)

    await pool.query(
      `UPDATE clientes SET visibilidad = false WHERE telefono = $1;`,
      [telefono]
    );

    res.status(200).json('Cliente eliminado correctamente (soft delete)');
  } catch (error: any) {
    console.error('Error al eliminar cliente:', error.message);
    res.status(400).json({ error: error.message });
  }
};

export const restaurarCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tel } = req.params;

    if (!tel) {
      res.status(400).json({ error: 'Telefono requerido' });
      return;
    }

    const telefono = parseInt(tel, 10)

    await pool.query(
      `UPDATE clientes SET visibilidad = true WHERE telefono = $1 RETURNING *;`,
      [telefono]
    );

    res.status(200).json('Cliente restaurado correctamente');
  } catch (error: any) {
    console.error('Error al restaurar cliente:', error.message);
    res.status(400).json({ error: error.message });
  }
};

export const obtenerClientePorTelefono = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tel } = req.params;


    if (!tel || !/^\d{10,15}$/.test(tel)) {
      res.status(400).json({ error: 'Número de teléfono inválido' });
      return;
    }

    const telefono = parseInt(tel, 10)

    const query = `
      SELECT telefono, nombre, dieta, preferencias
      FROM clientes 
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


export const agregarPreferencia = async (req: Request, res: Response) =>{
  try{

    const { tel } = req.params
    const { preferencia } = req.body

    const query = 'SELECT * FROM clientes WHERE telefono = $1'
    const result = await pool.query(query, [tel])

    if (result.rows.length === 0){
      throw new Error("Cliente no encontrado")
    }

    const clienteActual = result.rows[0]

    const cliente = new Cliente(
      clienteActual.telefono,
      clienteActual.nombre,
      clienteActual.dieta,
      clienteActual.preferencias,
      clienteActual.agent_session_id,
      new Date(clienteActual.ultima_compra),
      true
    )

    cliente.agregarPreferencia(preferencia)

    await pool.query('UPDATE clientes SET preferencias = $1 WHERE telefono = $2', [cliente.preferencias, cliente.telefono])

    res.status(200).json("Preferencia agregada exitosamente")

  }catch(err: any){
    console.error('Error al agregar una nueva preferencia al cliente:', err.message);

  if (err instanceof Error && 
    err.message.includes("Cliente no encontrado") || 
    err.message.includes("No se pueden agregar más de")
  ) {
    return res.status(404).json({ error: err.message });
  }

      res.status(500).json({ error: 'Error interno al agregar una preferencia'});
  }
}

export const modificarPreferencia = async (req: Request, res: Response) =>{
  try{

    const { tel } = req.params
    const { preferenciaAntigua, nuevaPreferencia} = req.body

    const result = await pool.query('SELECT * FROM clientes WHERE telefono = $1', [tel])

    if (result.rows.length === 0){
      throw new Error("No es posible modificar la preferencia, cliente no encontrado")
    }

    const row = result.rows[0]

    const nuevoCliente = new Cliente(
      row.telefono,
      row.nombre,
      row.dieta,
      row.preferencias,
      row.agent_session_id,
      new Date(row.ultima_compra),
      row.visibilidad
    )

    nuevoCliente.modificarPreferencia(preferenciaAntigua, nuevaPreferencia)

    await pool.query("UPDATE clientes SET preferencias = $1 WHERE telefono = $2", [nuevoCliente.preferencias, nuevoCliente.telefono])

    res.status(200).json("Preferencia modificada exitosamente")
  }catch(err: any){
    if (err.message.includes("no existe") || err.message.includes("no encontrado")){
      return res.status(404).json({error: err.message})
    }
    console.error('Error al modificar la preferencia del cliente: ', err.message)
    res.status(500).json({error: "Error interno al modificar una preferencia"})
  }
}