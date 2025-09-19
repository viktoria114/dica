// src/hooks/useAuth.ts
import { jwtDecode } from "jwt-decode";
import { useEffect, useMemo } from "react";

interface DecodedToken {
  dni: number;
  rol: string;
  username: string;
  exp: number; // en segundos
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
      localStorage.removeItem("token");
      return null;
    }
  }, [token]);

  // ⏱ Chequeo periódico cada 2s
  useEffect(() => {
    const interval = setInterval(() => {
      const t = localStorage.getItem("token");
      if (!t) {
        clearInterval(interval);
        window.alert("⚠️ Tu sesión ha expirado o fue cerrada");
        window.location.href = "/";
        return;
      }

      try {
        const decoded = jwtDecode<DecodedToken>(t);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          clearInterval(interval);
          window.alert("⚠️ Tu sesión ha expirado");
          window.location.href = "/";
        }
      } catch {
        localStorage.removeItem("token");
        clearInterval(interval);
        window.alert("⚠️ Token inválido");
        window.location.href = "/";
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { usuario, token };
};
