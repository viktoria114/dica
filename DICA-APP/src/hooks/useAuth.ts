// src/hooks/useAuth.ts
import { jwtDecode } from "jwt-decode";
import { useMemo } from "react";

interface DecodedToken {
  dni: number;
  rol: string;
  username: string;
  exp: number; // tiempo de expiración en segundos
}

export const useAuth = () => {
  const token = localStorage.getItem("token");

  const usuario = useMemo(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode<DecodedToken>(token);

      // Chequear si está vencido
      const isExpired = decoded.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem("token");
        return null;
      }

      return decoded;
    } catch (error) {
      console.error("Error decodificando token:", error);
      return null;
    }
  }, [token]);

  return { usuario };
};


