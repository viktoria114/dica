import {
  Button,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AccountCircle from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    setError("");

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
      console.log("Inicio de sesión exitoso!");
      console.log("Token o datos:", data);

      navigate("/inicio");
      localStorage.setItem("token", data.token);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido");
      }
    }
    setLoading(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
      <Box
        sx={{
          position: "fixed", // este cambio es clave
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          bgcolor: "primary.main",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 0,
        }}
      >
        <Paper
          elevation={3}
          sx={{ p: 4, borderRadius: 2, bgcolor: "background.default" }}
        >
          <Typography
            variant="h5"
            align="center"
            sx={{ color: "black", fontWeight: "750", mb: "24px" }}
          >
            INICIO DE SESIÓN
          </Typography>

          <TextField
            label="Usuario o correo"
            fullWidth
            margin="dense"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
            sx={{
              color: "black",
              backgroundColor: "#FAFAFA",
              borderRadius: 1,
              "& .MuiInputLabel-root": {
                color: "#000",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#000",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="dense"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            sx={{
              color: "black",
              backgroundColor: "#FAFAFA",
              borderRadius: 1,
              "& .MuiInputLabel-root": {
                color: "#000",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#000",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Typography
            sx={{
              color: error ? "error.main" : "#FAFAFA",
              mt: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {error || ""}
          </Typography>

          <Button
            variant="contained"
            fullWidth
            sx={{
              color: "black",
              bgcolor: "#F4CE14",
              mt: 2,
              p: 2,
              "&:hover": { bgcolor: "#c2a61cff" },
            }}
            onClick={handleSubmit}
            loading={loading}
          >
            INGRESAR
          </Button>
        </Paper>
      </Box>
  );
};

export default Login;
