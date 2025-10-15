// src/components/Footer.tsx
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.grey[900],
        color: "#fff",
        py: 3,
        px: 4,
        mt: "auto",
      }}
    >
      <Grid container spacing={3} justifyContent="space-between">
        {/* Izquierda: Información institucional */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" fontWeight="bold">
            © 2025 DICA
          </Typography>
          <Typography variant="body2">
            Sistema de Gestión para Lomiterías
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Versión 3.1 | Sprint “News Sprint 3”
          </Typography>
          <Typography variant="body2">Desarrollado por Equipo DICA</Typography>
        </Grid>

        {/* Centro: Enlaces rápidos */}
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            alignItems: { xs: "flex-start", md: "center" },
          }}
        >
          {["Inicio", "Menú", "Pedidos", "Estadísticas", "Empleados"].map(
            (text) => (
              <Link
                key={text}
                href="#"
                underline="hover"
                color="inherit"
                sx={{ fontSize: "0.9rem" }}
              >
                {text}
              </Link>
            )
          )}
        </Grid>

        {/* Derecha: Estado del sistema */}
        <Grid
          item
          xs={12}
          md={3}
          sx={{
            textAlign: { xs: "left", md: "right" },
          }}
        >
          <Typography variant="body2">🟢 Dica-Bot operativo</Typography>
          <Typography variant="body2">💾 Servidor en línea</Typography>
          <Typography variant="body2">⏱️ Último respaldo: hace 3h</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Footer;
