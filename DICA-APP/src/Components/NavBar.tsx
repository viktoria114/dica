import React from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import theme from "../services/theme";

const pages = [{text: "Inicio", path: "/inicio"}, {text:"Menú", path: "menu"},{text: "Pedidos", path: "/pedidos"},{ text: "Stock", path: "/stock"}, {text: "Estadísticas", path: "estadisticas"}, {text:"Empleados", path: "/empleados"}];
const settings = [{text:"Perfil", path: "/perfil"},{text: "Cerrar Sesión",path: "/"}];

export const NavBar = () => {
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <>
      <ThemeProvider theme={theme}>
        {/* Encabezado fijo */}
        <Box sx={{ backgroundColor: '#465b56', textAlign: 'center', py: 4 }}>
          <Typography variant="h2" sx={{ color: 'white', fontWeight: '800' }}>
            DICA
          </Typography>
        </Box>

        {/* Barra de navegación */}
        <AppBar
          position="sticky"
          sx={{
            backgroundColor: '#465b56',
            borderTop: '4px solid #f0f8ff',
          }}
        >
          <Toolbar sx={{ justifyContent: 'center' }}>
            {/* Botones centrados con separadores */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {pages.map(({ text, path, }, index) => (
                <React.Fragment key={text}>
                  <Button sx={{ color: 'white', px: 1 }} onClick={() => navigate(path)}>{text}</Button>
                  {index < pages.length - 1 && (
                    <Typography sx={{ color: 'white' }}>|</Typography>
                  )}
                </React.Fragment>
              ))}
            </Box>

            {/* Menú de usuario a la derecha */}
            <Box sx={{ position: 'absolute', right: 16 }}>
              <Tooltip title="Abrir configuración">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="Usuario" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map(({text, path}) => (
                  <MenuItem key={text} onClick={() => navigate(path)}>
                    <Typography textAlign="center">{text}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
      </ThemeProvider>
      <Outlet />
    </>
  );
};
