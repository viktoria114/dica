// empleado.controller.ts

import { Request, Response } from 'express';
import { Empleado } from '../models/empleado';
import { pool } from "../config/db";
import { OkPacket } from 'mysql2';

export const crearEmpleado = (req: Request, res: Response): void => {
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

    // Validación básica de campos obligatorios
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

    // Crear nuevo empleado con reglas de negocio en el constructor
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

    // Guardar en la base de datos

    //
    // Respuesta exitosa
    res.status(201).json({
      mensaje: 'Empleado creado exitosamente',
      empleado: {
        DNI: nuevoEmpleado.DNI,
        username: nuevoEmpleado.username,
        nombreCompleto: nuevoEmpleado.nombreCompleto,
        correo: nuevoEmpleado.correo,
        telefono: nuevoEmpleado.telefono,
        rol: nuevoEmpleado.rol,
        visibilidad: nuevoEmpleado.visibilidad,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
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

export const actualizarEmpleado = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { username, nombre_completo, correo, telefono, password, rol, visibilidad } = req.body;

  try {
    const result = await pool.query(
      `UPDATE empleados 
       SET username = $1, nombre_completo = $2, correo = $3, telefono = $4, password = $5, rol = $6, visibilidad = $7
       WHERE dni = $8`,
      [username, nombre_completo, correo, telefono, password, rol, visibilidad, id]
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
