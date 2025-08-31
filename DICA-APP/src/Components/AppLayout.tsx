import { Outlet, useNavigate } from "react-router-dom";
import { NavBar } from "./NavBar";
import { useEffect } from "react";

export const AppLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.confirm("Tu sesión ha expirado"); // mensaje emergente
        navigate("/", { replace: true });
      }
    };

    // Revisar al montar y cada 2 segundos
    checkToken();
    const interval = setInterval(checkToken, 2000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <>
      <NavBar />
      <Outlet /> {/* Aquí se renderizan las páginas hijas */}
    </>
  );
};
