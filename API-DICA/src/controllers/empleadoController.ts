// empleado.controller.ts

import { Request, Response } from 'express';
import { Empleado } from '../models/empleado';
import { pool } from "../config/db";

export const crearEmpleado = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      DNI,
      username,
      nombreCompleto,
      correo,
      telefono,
      password,
      rol,
      visibilidad,
    } = req.body;

    if (
      DNI === undefined ||
      !username ||
      !nombreCompleto ||
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
      DNI,
      username,
      nombreCompleto,
      correo,
      telefono,
      password,
      rol,
      visibilidad
    );

    const query = `
      INSERT INTO empleados 
        (dni, username, nombre_completo, correo, telefono, password, rol, visibilidad) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      nuevoEmpleado.DNI,
      nuevoEmpleado.username,
      nuevoEmpleado.nombreCompleto,
      nuevoEmpleado.correo,
      nuevoEmpleado.telefono,
      nuevoEmpleado.password,
      nuevoEmpleado.rol,
      nuevoEmpleado.visibilidad,
    ];

    const resultado = await pool.query(query, values);
    const empleadoCreado = resultado.rows[0];

    res.status(201).json({
      mensaje: 'Empleado creado exitosamente',
      empleado: empleadoCreado,
    });
  } catch (error: any) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({ error: 'Error al crear el empleado' });
  }
};

export const getEmpleados = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<Empleado>("SELECT * FROM empleados");
    const empleados = result.rows;

    res.status(200).json(empleados);
  } catch (error) {
    console.error("❌ Error al obtener empleados:", error);
    res.status(500).json({ message: "Error al obtener empleados" });
  }
};