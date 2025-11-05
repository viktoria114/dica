import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { InfoCard } from "../Components/Inicio/InfoCard";
import { DashboardCard } from "../Components/Inicio/DashboardCard";
import { useAuth } from "../hooks/useAuth";
import { useDashboard } from "../hooks/useDashboard";
import { toggleActivity, getAgentStatus } from "../api/agente";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getStockBajo, getStockVencido } from "../store/slices/stockSlice";

export const Inicio = () => {
  const [fecha, setFecha] = useState(new Date());
  const { usuario } = useAuth();
  const { dashboardData, loading, error } = useDashboard();
  const { showSnackbar } = useSnackbar();
  const [isAgentActive, setIsAgentActive] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const dispatch = useAppDispatch();
  const { stockBajo, stockVencido } = useAppSelector((state) => state.stock);

  // 🔔 Banderas separadas de notificaciones
  const [notificadoBajo, setNotificadoBajo] = useState(false);
  const [notificadoVencido, setNotificadoVencido] = useState(false);

  // ⏰ Actualiza la hora
  useEffect(() => {
    const timer = setInterval(() => setFecha(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔌 Estado del agente
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { isActive } = await getAgentStatus();
        setIsAgentActive(isActive);
      } catch (error) {
        console.error(error);
        showSnackbar("Error al obtener el estado del agente", "error");
      }
    };
    fetchStatus();
  }, [showSnackbar]);

  const hora = fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // ⚙️ Verificar stock bajo al cargar
  useEffect(() => {
    const verificarStockBajo = async () => {
      try {
        await dispatch(getStockBajo()).unwrap();
      } catch (error) {
        console.error("Error al verificar stock bajo:", error);
      }
    };
    verificarStockBajo();
  }, [dispatch]);

  // ⚙️ Verificar stock vencido al cargar
  useEffect(() => {
    const verificarStockVencido = async () => {
      try {
        await dispatch(getStockVencido()).unwrap();
      } catch (error) {
        console.error("Error al verificar stock vencido:", error);
      }
    };
    verificarStockVencido();
  }, [dispatch]);

  //  Mostrar notificación de stock bajo
  useEffect(() => {
    if (stockBajo.length > 0 && !notificadoBajo) {
      stockBajo.forEach((producto: any) => {
        showSnackbar(
          `Stock bajo: ${producto.nombre} - Actual: ${producto.stock_actual} ${producto.medida} | Mínimo: ${producto.stock_minimo} ${producto.medida}`,
          "warning",
          15000
        );
      });
      setNotificadoBajo(true);
    }
  }, [stockBajo, notificadoBajo, showSnackbar]);

  // Mostrar notificación de stock vencido
  useEffect(() => {
    if (stockVencido.length > 0 && !notificadoVencido) {
      stockVencido.forEach((producto: any) => {
        // Si el backend devuelve solo nombres, producto es string
        const nombre =
          typeof producto === "string" ? producto : producto.nombre;
        showSnackbar(`Stock vencido: ${nombre}`, "error", 15000);
      });
      setNotificadoVencido(true);
    }
  }, [stockVencido, notificadoVencido, showSnackbar]);

  const fechaTexto = fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const capitalizar = (texto: string) =>
    texto.charAt(0).toUpperCase() + texto.slice(1);

  const formatTiempoPromedio = (tiempo: string | null) => {
    if (!tiempo) return "N/A";
    const parts = tiempo.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    const totalMinutes = hours * 60 + minutes + seconds / 60;
    return `${totalMinutes.toFixed(0)} min`;
  };

  const dashboard = dashboardData
    ? [
        {
          label: "Pedidos Activos",
          value: dashboardData.pedidos_activos,
          color: "#8B1D1D",
        },
        {
          label: "Pedidos Completados",
          value: dashboardData.pedidos_completados,
          color: "#E5C58B",
        },
        {
          label: "Pedidos Cancelados",
          value: dashboardData.pedidos_cancelados,
          color: "#8B1D1D",
        },
      ]
    : [];

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await toggleActivity();
      setIsAgentActive((prev) => !prev);
      showSnackbar("Estado del agente cambiado con éxito", "success");
    } catch (error) {
      console.error(error);
      showSnackbar("Error al cambiar el estado del agente", "error");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item md={12}>
        <Container>
          <Box display="flex" justifyContent="right" gap={1} mt={2}>
            <Typography variant="h6" fontWeight="bold">
              {hora}
            </Typography>
            <Typography variant="h6">{capitalizar(fechaTexto)}</Typography>
          </Box>

          <Typography
            display="flex"
            justifyContent="center"
            variant="h4"
            fontWeight="600"
            p={4}
          >
            Bienvenido, {usuario?.username} a Sistema Gestión Dica
          </Typography>

          <Box
            maxHeight={432}
            borderRadius={8}
            display="flex"
            justifyContent="center"
            gap={20}
            p={8}
            sx={{
              backgroundImage: "url(/banner-Hamburguesa.jpg)",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          >
            <Box onClick={handleToggle}>
              <InfoCard
                title={isAgentActive ? "Apagar DicaBot" : "Encender DicaBot"}
                items={[
                  "Dica-Bot comenzará a funcionar",
                  "Atenderá mensajes entrantes",
                  "Creará nuevos pedidos",
                ]}
                isActive={isAgentActive}
                isToggling={isToggling}
              />
            </Box>

            <InfoCard
              title="News Sprint 3"
              items={[
                "Fix Bug Login borrado",
                "Dica-Bot ya no venderá jugo de naranja",
                "Traslado de Servidor a la nube",
              ]}
            />
          </Box>

          <Typography
            display="flex"
            justifyContent="center"
            variant="h4"
            fontWeight="600"
            p={4}
          >
            Dashboard de hoy
          </Typography>

          <Box display="flex" justifyContent="center" gap={8}>
            {loading && <CircularProgress />}
            {error && <Typography color="error">{error}</Typography>}
            {dashboard.map((d, i) => (
              <DashboardCard key={i} {...d} />
            ))}
          </Box>
        </Container>
      </Grid>
    </Grid>
  );
};
