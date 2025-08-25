import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { PedidoItem } from "../Components/Inicio/PedidoItem";
import { InfoCard } from "../Components/Inicio/InfoCard";
import { DashboardCard } from "../Components/Inicio/DashboardCard";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChatItem = ({ texto }: any) => (
  <>
    <Typography mt={2}>{texto}</Typography>
    <Divider sx={{ p: 0.5, borderColor: "primary.main", borderBottomWidth: 1 }} />
  </>
);

export const Inicio = () => {
  const [fecha, setFecha] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setFecha(new Date());
    }, 1000);

    return () => clearInterval(timer); // cleanup al desmontar
  }, []);

  const hora = fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const fechaTexto = fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const capitalizar = (texto: string) =>
    texto.charAt(0).toUpperCase() + texto.slice(1);

  const usuario = "Matias Moreno"; //despues se cambiaaa

  const pedidos = [
    {
      id: 9012,
      nombre: "Viktoria A.",
      lugar: "Av Ramírez de Velazco 3",
      precio: 13500,
    },
    { id: 3490, nombre: "Fede Salomón", lugar: "Catamarca 483", precio: 21000 },
    { id: 1042, nombre: "Valentino", lugar: "Local", precio: 5000 },
  ];

  const chats = [
    "3804832010: Hola me da 3 de choclo?",
    "3804834036: quería pedir dos lomitos completos (uno sin lechuga)",
    "3804954726: También agregale extra queso.",
    "38047823904: cancelame el pedido",
    "380498343: ¿Me podrías dar 7 ... ",
    "3804911045: Hola, ¿me podés mandar 3 lomitos completos?",
  ];

  const dashboard = [
    { label: "Pedidos Activos", value: 37, color: "#8B1D1D" },
    { label: "Pedidos Completados", value: 10, color: "#E5C58B" },
    { label: "Tiempo Promedio", value: 27, color: "#8B1D1D" },
  ];

  return (
    <Grid container spacing={2}>
      {/* Lateral izquierdo */}
      <Grid size={2}>
        <Paper sx={{ m: 4, p: 4, borderRadius: 8 }}>
          <Typography variant="h5">Pedidos 24</Typography>
          <Divider
            sx={{ p: 0.5, borderColor: "primary.main", borderBottomWidth: 1 }}
          />
          {pedidos.map((p) => (
            <PedidoItem key={p.id} {...p} />
          ))}
        </Paper>
      </Grid>

      {/* Contenido central */}
      <Grid size={8}>
        <Container>
          <Box display="flex" justifyContent="right" gap={1} mt={2}>
            <Typography
              variant="h6"
              fontWeight="bold" /* sx={{ textDecoration: 'underline' }}*/
            >
              {hora}
            </Typography>
            <Typography variant="h6" /* sx={{ textDecoration: 'underline' }} */>
              {capitalizar(fechaTexto)}
            </Typography>
          </Box>
          <Typography
            display="flex"
            justifyContent="center"
            variant="h4"
            fontWeight="600"
            p={4}
          >
            Bienvenido, {usuario} a Sistema Gestión Dica
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
            <InfoCard
              title="Abrir Negocio"
              items={[
                "Dica-Bot comenzará a funcionar",
                "Se registrarán los cambios",
                "Se calculan las estadísticas",
                "Los pedidos fluyen",
              ]}
            />
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
            {dashboard.map((d, i) => (
              <DashboardCard key={i} {...d} />
            ))}
          </Box>
        </Container>
      </Grid>

      {/* Lateral derecho */}
      <Grid size={2}>
        <Paper sx={{ m: 4, p: 4, borderRadius: 8 }}>
          <Typography variant="h5" align="center">
            Dica-Bot 🟢
          </Typography>
          <Divider
            sx={{ p: 0.5, borderColor: "primary.main", borderBottomWidth: 1 }}
          />
          <Typography variant="h6" mt={2}>
            Chats actuales 12
          </Typography>
          <Divider
            sx={{ p: 0.5, borderColor: "primary.main", borderBottomWidth: 1 }}
          />
          {chats.map((c, i) => (
            <ChatItem key={i} texto={c} />
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
};
