import "./App.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";
import Login from "./Pages/Login";
import { Inicio } from "./Pages/Inicio";
import { Empleados } from "./Pages/Empleados";
import { Perfil } from "./Pages/Perfil";
import { ThemeProvider } from "@emotion/react";
import theme from "./services/theme";
import { PrivateRoute } from "./Components/PrivateRoute";
import { AppLayout } from "./Components/AppLayout";
import { Menu } from "./Pages/Menu";
import { Pedidos } from "./Pages/Pedidos";
import { Clientes } from "./Pages/Clientes";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { Promociones } from "./Pages/Promociones";
import { Balance } from "./Pages/Balance";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { StockPage } from "./Pages/Stock";
import { Pagos } from "./Pages/Pagos";
import { Estadisticas } from "./Pages/Estadisticas";

import { DropboxTokenProvider } from "./contexts/DropboxTokenContext";
import { useEffect } from "react";
import { setVencimientoStock } from "./api/stock";



function App() {
  useEffect(() => {
    setVencimientoStock();
  }, []);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Login />} />

        {/* Rutas protegidas */}
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/empleados" element={<Empleados />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/promociones" element={<Promociones />} />
          <Route path="/balance" element={<Balance />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/pagos" element={<Pagos />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </>
    )
  );

  return (
    <ThemeProvider theme={theme}>
      <DropboxTokenProvider>
        <SnackbarProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <RouterProvider router={router} />
          </LocalizationProvider>
        </SnackbarProvider>
      </DropboxTokenProvider>
    </ThemeProvider>
  );
}

export default App;
