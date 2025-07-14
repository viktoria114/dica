import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// extendemos Request para incluir los datos del usuario
interface AuthenticatedRequest extends Request {
  dni?: number;
  rol?: string;
  username?: string;
}

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token no proporcionado o inválido" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
    dni: number;
    rol: string;
    username: string;
  };

  console.log("✅ TOKEN DECODIFICADO:", decoded);

    req.dni = decoded.dni;
    req.rol = decoded.rol;
    req.username = decoded.username;

    console.log("🔍 VALORES EN req:", {
  dni: req.dni,
  rol: req.rol,
  username: req.username
});

    next();
  } catch (error) {
    res.status(401).json({ message: "Token no válido o expirado" });
  }
};

export const checkRole = (rolesPermitidos: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.rol || !rolesPermitidos.includes(req.rol)) {
      console.log("ROL DEL USUARIO:", req.rol);
      res.status(403).json({ message: "Acceso denegado. No tienes permisos suficientes." });
      return;
    }
    next();
  };
};
