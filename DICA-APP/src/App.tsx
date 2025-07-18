import { useState } from "react";
import { Button, TextField, ThemeProvider, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import theme from "./services/theme";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error en el inicio de sesión");
      }

      const data = await response.json();
      setSuccess("Inicio de sesión exitoso!");
      console.log("Token o datos:", data);

      // Aquí podrías guardar el token en localStorage, redirigir, etc.
      // localStorage.setItem("token", data.token);

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        component="form"
        bgcolor="primary.main"
        p={5}
        boxShadow={2}
        borderRadius={3}
        onSubmit={handleSubmit}
      >
        <Typography fontWeight={550} color="text.secondary">
          Inicio de sesión: Dica
        </Typography>

        <Box m={2} display="flex" flexDirection="column" gap={2} width={350}>
          <TextField
            id="username"
            label="Usuario o correo electrónico"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            type="submit"
            fullWidth
            sx={{
              backgroundColor: "background.default",
              color: "primary.main",
              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
            }}
          >
            Ingresar a Dica
          </Button>

          {error && (
            <Typography color="error" fontSize={14}>
              {error}
            </Typography>
          )}

          {success && (
            <Typography color="success.main" fontSize={14}>
              {success}
            </Typography>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
