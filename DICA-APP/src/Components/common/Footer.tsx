// src/components/Footer.tsx
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import {Button} from "@mui/material";
import { useNavigate } from "react-router-dom";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const Footer = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const pages = [
    { text: "Inicio", path: "/inicio" },
    { text: "Menú", path: "/menu" },
    { text: "Pedidos", path: "/pedidos" },
    { text: "Stock", path: "/stock" },
    { text: "Estadísticas", path: "/estadisticas" },
    { text: "Empleados", path: "/empleados" },
    { text: "Clientes", path: "/clientes" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.secondary.main,
        color: "#fff",
        py: 6,
        px: 4,
        mt: 8,
      }}
    >
      <Grid
        container
        spacing={{ xs: 3, md: 25 }} // 🔹 Menor espacio en móviles, mayor en escritorio
        justifyContent="center"
        alignItems="stretch"
        textAlign={{ xs: "center", md: "left" }} // 🔹 Centra el texto solo en pantallas pequeñas
      >
        {/* Columna 1 */}
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            minHeight: "200px",
          }}
        >
          <Typography
            variant="h3"
            sx={{ color: "white", fontWeight: 800, mb: 1 }}
          >
            DICA
          </Typography>
          <Typography>© 2025 DICA</Typography>
          <Typography>Sistema de Gestión para Lomiterías</Typography>
          <Typography>Versión 0.5 | Sprint “News Sprint 5”</Typography>
          <Typography>Desarrollado por Equipo Cinerbyte</Typography>
        </Grid>

        {/* Columna 2 */}
        <Grid item xs={12} md={4}>
          <Typography fontWeight="bold" sx={{ mb: 1, fontSize: "1.25rem" }}>
            Secciones
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems={{ xs: "center", md: "flex-start" }} // 🔹 Centra los botones en móvil
            gap={0.5}
          >
            {pages.map(({ text, path }) => (
              <Button
                key={text}
                sx={{
                  color: "white",
                  textTransform: "none",
                  justifyContent: "flex-start",
                  fontSize: "1rem",
                  padding: 0,
                }}
                onClick={() => navigate(path)}
              >
                {text}
              </Button>
            ))}
          </Box>
        </Grid>

        {/* Columna 3 */}
        <Grid item xs={12} md={4}>
          <Typography fontWeight="bold" sx={{ mb: 1, fontSize: "1.25rem" }}>
            Estado del sistema
          </Typography>
          <Typography sx={{ fontSize: "1.20rem" }}>
            🟢 Dica-Bot operativo
          </Typography>
          <Typography sx={{ fontSize: "1.20rem" }}>
            💾 Servidor en línea
          </Typography>
          <Typography sx={{ fontSize: "1.20rem" }}>
            ⏱️ Último respaldo: hace 3h
          </Typography>
          {/* 🔹 Redes sociales */}
          <Box mt={3}>
            <Typography fontWeight="bold" sx={{ mb: 1, fontSize: "1.25rem" }}>
              Redes sociales
            </Typography>

            <Box
              display="flex"
              flexDirection="column"
              alignItems={{ xs: "center", md: "flex-start" }}
              gap={1.5}
            >
              {/* Instagram */}
              <Box
                component="a"
                href="https://www.instagram.com/dicalomosypizzas.lr"
                target="_blank"
                rel="noopener noreferrer"
                display="flex"
                alignItems="center"
                gap={1}
                sx={{
                  color: "#fff",
                  textDecoration: "none",
                  "&:hover": { color: "#E1306C" },
                }}
              >
                <InstagramIcon fontSize="small" />
                <Typography sx={{ fontSize: "1rem" }}>Instagram</Typography>
              </Box>

              {/* WhatsApp */}
              <Box
                component="a"
                href="https://l.instagram.com/?u=https%3A%2F%2Fwa.link%2Fc53d4i%3Ffbclid%3DPAZXh0bgNhZW0CMTEAAafDnNRx5OUx-iOhjRYCTVAcbFca0dgHOJ0aZJ4QWx2mJyqpOyTSul1HXELNig_aem_sZ44dHXK-LMIwLkSZOSUSg&e=AT1gMFZQjWf6PKWPyXxZNcqgkn9T-bdlyNUp_cgQ3sdVu7Z8ZFVem-NtofB_gh4J5JJAoJfKfmY9XmLhKN8e5IWuDDwnJlC4H-L-7qCwnw"
                target="_blank"
                rel="noopener noreferrer"
                display="flex"
                alignItems="center"
                gap={1}
                sx={{
                  color: "#fff",
                  textDecoration: "none",
                  "&:hover": { color: "#25D366" },
                }}
              >
                <WhatsAppIcon fontSize="small" />
                <Typography sx={{ fontSize: "1rem" }}>WhatsApp</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Footer;
