// empleado.controller.ts

import { Request, Response } from 'express';
import { Empleado } from '../models/empleado';
import { pool } from "../config/db";
import bcrypt from 'bcryptjs';

export const crearEmpleado = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      dni,
      username,
      nombre_completo,
      correo,
      telefono,
      password,
      rol,
      visibilidad,
    } = req.body;

    if (
      dni === undefined ||
      !username ||
      !nombre_completo ||
      !correo ||
      !telefono ||
      !password ||
      !rol ||
      !visibilidad
    ) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    const nuevoEmpleado = new Empleado(
      dni,
      username,
      nombre_completo,
      correo,
      telefono,
      password,
      rol,
      null,
      visibilidad
    );

     const contraseñaHasheada = await bcrypt.hash(nuevoEmpleado.password, 10);

    const query = `
      INSERT INTO empleados 
        (dni, username, nombre_completo, correo, telefono, password, rol, visibilidad, agent_session_id) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const values = [
      nuevoEmpleado.dni,
      nuevoEmpleado.username,
      nuevoEmpleado.nombre_completo,
      nuevoEmpleado.correo,
      nuevoEmpleado.telefono,
      contraseñaHasheada,
      nuevoEmpleado.rol,
      nuevoEmpleado.visibilidad,
      nuevoEmpleado.agentSessionID,
    ];

    const resultado = await pool.query(query, values);
    const empleadoCreado = resultado.rows[0];

    res.status(201).json({
      mensaje: 'Empleado creado exitosamente',
      empleado: empleadoCreado,
    });
  } catch (error: any) {
    if (error.code === "23505") {
     res.status(409).json({ message: 'Error: DNI ya registrado' });
    }
    console.error('Error al crear empleado:', error);
    res.status(500).json({ message: 'Error al crear el empleado' });
  }
};

export const getEmpleadosVisibles = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<Empleado>("SELECT * FROM empleados WHERE visibilidad = TRUE AND rol != 'agente'");
    const empleados = result.rows;

    res.status(200).json(empleados);
  } catch (error) {
    console.error("❌ Error al obtener empleados:", error);
    res.status(500).json({ message: "Error al obtener empleados" });
  }
};

export const getEmpleadosInvisibles = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<Empleado>("SELECT * FROM empleados WHERE visibilidad = FALSE");
    const empleados = result.rows;

    res.status(200).json(empleados);
  } catch (error) {
    console.error("❌ Error al obtener empleados:", error);
    res.status(500).json({ message: "Error al obtener empleados" });
  }
};

export const actualizarEmpleado = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { username, nombre_completo, correo, telefono, password, rol, session, visibilidad } = req.body;

  const dni :number = +id
  
  const nuevoEmpleado = new Empleado(
        dni,
        username,
        nombre_completo,
        correo,
        telefono,
        password,
        rol,
        session,
        visibilidad
      );
      const contraseñaHasheada = await bcrypt.hash(nuevoEmpleado.password, 10);
    try {
      const result = await pool.query(
      `UPDATE empleados 
       SET username = $1, nombre_completo = $2, correo = $3, telefono = $4, password = $5, rol = $6, visibilidad = $7
       WHERE dni = $8`,
      [nuevoEmpleado.username, nuevoEmpleado.nombre_completo, nuevoEmpleado.correo, 
        nuevoEmpleado.telefono, contraseñaHasheada, nuevoEmpleado.rol, nuevoEmpleado.visibilidad, nuevoEmpleado.dni]
    );

    if (result.rowCount === 1) {
      res.json({ message: "Registro actualizado" });
    } else {
      res.status(404).json({ message: "Registro inexistente" });
    }
  } catch (error) {
    console.error("❌ Error al actualizar empleado:", error);
    res.status(500).json({ message: "Error al actualizar empleado" });
  }
};

export const eliminarEmpleado = async (req: Request, res: Response): Promise<void> => {
  try {
      const { id } = req.params;
  
      if (!id) {
        res.status(400).json({ error: 'dni requerido' });
        return;
      }
  
      // Buscar empleado actual
      const consulta = await pool.query(`SELECT * FROM empleados WHERE dni = $1`, [id]);
      const actual = consulta.rows[0];
  
      if (!actual) {
        res.status(404).json({ error: 'Empleado no encontrado' });
        return;
      }
  
      const empleado = new Empleado(
        actual.dni,
        actual.username,
        actual.nombre_completo,
        actual.correo,
        actual.telefono,
        actual.password,
        actual.rol,
        actual.agent_session_id,
        actual.visibilidad
      );
      empleado.desactivar();
  
      const resultado = await pool.query(
        `UPDATE empleados SET visibilidad = false WHERE dni = $1 RETURNING *;`,
        [empleado.dni]
      );
  
      res.status(200).json({
        mensaje: 'Empleado eliminado correctamente (soft delete)',
        empleado: resultado.rows[0],
      });
    } catch (error: any) {
      console.error('Error al eliminar empleado:', error.message);
      res.status(400).json({ error: error.message });
    }
}

export const restaurarEmpleado = async (req:Request, res:Response): Promise<void> =>{
try {
      const { id } = req.params;
  
      if (!id) {
        res.status(400).json({ error: 'dni requerido' });
        return;
      }
  
      // Buscar empleado actual
      const consulta = await pool.query(`SELECT * FROM empleados WHERE dni = $1`, [id]);
      const actual = consulta.rows[0];
  
      if (!actual) {
        res.status(404).json({ error: 'Empleado no encontrado' });
        return;
      }
  
      const empleado = new Empleado(
        actual.dni,
        actual.username,
        actual.nombre_completo,
        actual.correo,
        actual.telefono,
        actual.password,
        actual.rol,
        actual.agent_session_id,
        actual.visibilidad
      );
      empleado.reactivar();
  
      const resultado = await pool.query(
        `UPDATE empleados SET visibilidad = true WHERE dni = $1 RETURNING *;`,
        [empleado.dni]
      );
  
      res.status(200).json({
        mensaje: 'Empleado restaurado correctamente',
        empleado: resultado.rows[0],
      });
    } catch (error: any) {
      console.error('Error al restaurar el empleado:', error.message);
      res.status(400).json({ error: error.message });
    }
}


export const getEmpleadoPorTelefono = async (req:Request, res: Response): Promise<void>=> {
  try{
    const { tel } = req.params;

    if (!tel) {
      res.status(400).json({ error: 'TEL requerido' });
      return;
    }

    // Buscar empleado actual
    const consulta = await pool.query(`SELECT * FROM empleados WHERE telefono = $1 AND visibilidad = TRUE`, [tel]);
    const actual = consulta.rows[0];

    if (!actual) {
      res.status(404).json({ error: 'Empleado no encontrado' });
      return;
    }

    res.status(200).json({mensaje:"Empleado obtenido correctamente", empleado:actual})
  }catch(error: any){
    console.error('Error al obtener el empleado por telefono', error)
    res.status(400).json({error: error.message});
  }
}

export const getEmpleadoPordni = async (req:Request, res: Response): Promise<void>=> {
  try{
    const {id} = req.params;

    if (!id) {
      res.status(400).json({ error: 'dni requerido' });
      return;
    }

    // Buscar empleado actual
    const consulta = await pool.query(`SELECT * FROM empleados WHERE dni = $1`, [id]);
    const actual = consulta.rows[0];

    if (!actual) {
      res.status(404).json({ error: 'Empleado no encontrado' });
      return;
    }

    res.status(200).json({mensaje:"Empleado obtenido correctamente", empleado:actual})
  }catch(error: any){
    console.error('Error al obtener el empleado por dni', error)
    res.status(400).json({error: error.message});
  }
}