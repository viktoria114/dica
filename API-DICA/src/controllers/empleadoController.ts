// empleado.controller.ts

import { Request, Response } from 'express';
import { Empleado } from '../models/empleado';

export const crearEmpleado = (req: Request, res: Response): void => {
  try {
    const {
      id,
      nombreUsuario,
      nombreCompleto,
      email,
      telefono,
      password,
      rol,
    } = req.body;

    // Validación básica de campos obligatorios
    if (
      id === undefined ||
      !nombreUsuario ||
      !nombreCompleto ||
      !email ||
      !telefono ||
      !password ||
      !rol
    ) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    // Crear nuevo empleado con reglas de negocio en el constructor
    const nuevoEmpleado = new Empleado(
      id,
      nombreUsuario,
      nombreCompleto,
      email,
      telefono,
      password,
      rol
    );

    // Guardar en la base de datos

    //
    // Respuesta exitosa
    res.status(201).json({
      mensaje: 'Empleado creado exitosamente',
      empleado: {
        id: nuevoEmpleado.id,
        nombreUsuario: nuevoEmpleado.nombreUsuario,
        nombreCompleto: nuevoEmpleado.nombreCompleto,
        email: nuevoEmpleado.email,
        telefono: nuevoEmpleado.telefono,
        rol: nuevoEmpleado.rol,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};