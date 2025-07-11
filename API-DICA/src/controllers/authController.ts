import { Request, Response } from 'express';
import { pool } from '../config/db'; // asegúrate que exportás correctamente el pool desde PostgreSQL
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface Usuario {
  uid: string;
  username: string;
  password: string;
  // Agregá más campos si hay otros en tu tabla
}

// Función para buscar usuario por username
const findByUsername = async (username: string): Promise<Usuario | null> => {
  const result = await pool.query<Usuario>(
    "SELECT * FROM usuario WHERE username = $1",
    [username]
  );

  if (result.rows.length === 0) return null;

  return result.rows[0];
};

// Endpoint de login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    const usuario = await findByUsername(username);

    if (!usuario) {
      res.status(401).json({ message: "Usuario y/o password son incorrectos" });
      return;
    }

    const isValid = await bcrypt.compare(password, usuario.password);

    if (!isValid) {
      res.status(401).json({ message: "Usuario y/o password son incorrectos" });
      return;
    }

    const token = jwt.sign(
      { uid: usuario.uid, username: usuario.username },
      process.env.JWT_SECRET || "secreto", // por si no está seteada
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error: any) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};
