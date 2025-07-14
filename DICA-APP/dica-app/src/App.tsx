import { Button, TextField, ThemeProvider, Typography } from "@mui/material";
import "./App.css";
import Box from "@mui/material/Box";
import theme from "./services/theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box
        component="form"
        bgcolor="primary.main"
        p={5}
        boxShadow={2}
        borderRadius={3}
      >
        <Typography fontWeight={550} color="text.secondary">
          Inicio de sesión: Dica
        </Typography>
        <Box m={2} display="flex" flexDirection="column" gap={2} width={350}>
          <TextField
            id="username"
            label="Usuario o correo electrónico"
            fullWidth
           sx={{
              backgroundColor: "background.default",
              borderRadius: 2,
            }}
            InputLabelProps={{
              sx: {
                color: "primary.main",
              },
            }}
            inputProps={{
              style: {
                color: theme.palette.primary.main,
              },
            }}
          
          />
          <TextField
            id="password"
            label="Contraseña"
            type="password"
            fullWidth
            sx={{
              backgroundColor: "background.default",
              borderRadius: 2,
            }}
            InputLabelProps={{
              sx: {
                color: "primary.main",
              },
            }}
            inputProps={{
              style: {
                color: theme.palette.primary.main,
              },
            }}
          />
          <Button
            fullWidth
            sx={{
              backgroundColor: "background.default",
              color: "primary.main",

              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
            }}
          >
            Ingresar
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
