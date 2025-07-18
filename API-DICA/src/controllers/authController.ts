import { Request, Response } from 'express';
import { pool } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { tokenBlacklist } from '../utils/blacklist';

interface Usuario {
  dni: string;
  username: string;
  password: string;
  rol: string; // ✅ Asegurate de que este campo exista en tu tabla empleados
}

// Función para buscar usuario por username
const findByUsername = async (username: string): Promise<Usuario | null> => {
  const result = await pool.query<Usuario>(
    "SELECT dni, username, password, rol FROM empleados WHERE username = $1",
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

    // ✅ Generamos el token incluyendo dni, username y rol
    const token = jwt.sign(
      {
        dni: usuario.dni,
        rol: usuario.rol,
        username: usuario.username,
      },
      process.env.JWT_SECRET || "secreto", // Usá variable de entorno si está definida
      { expiresIn: "6h" }
    );

    res.json({ token });
  } catch (error: any) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];
  tokenBlacklist.add(token);

  res.json({ message: "Sesión cerrada correctamente" });
};
