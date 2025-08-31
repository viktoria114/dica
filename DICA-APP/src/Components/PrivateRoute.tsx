import type { JSX } from "@emotion/react/jsx-runtime";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: JSX.Element;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = localStorage.getItem("token"); // revisa si hay token

  if (!token) {
    // si no hay token, redirige al login
    return <Navigate to="/" replace />;
  }

  // si hay token, deja pasar
  return children;
};
