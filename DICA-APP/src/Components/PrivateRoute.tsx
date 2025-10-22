import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { JSX } from "react";

interface PrivateRouteProps {
  children: JSX.Element;
  roles?: string[]; // opcional para controlar accesos
}

export const PrivateRoute = ({ children, roles }: PrivateRouteProps) => {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  // Chequeo de rol si se pasa como prop
  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/inicio" replace />;
  }

  return children;
};
