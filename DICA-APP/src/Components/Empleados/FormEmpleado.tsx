import {
  TextField,
  MenuItem,
  Grid,
  Typography,
  Box,
  Button,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { useFormEmpleado } from "../../hooks/useFormEmpleado";
import type { Empleado } from "../../types";

interface EmpleadoFormProps {
  modo: "crear" | "editar";
  initialValues: Empleado;
  onSuccess: () => void;
  onCancel?: () => void;
}

const EmpleadoForm = ({
  modo,
  initialValues,
  onSuccess,
  onCancel,
}: EmpleadoFormProps) => {
  const { formErrors, editValues, handleChange, handleGuardar, isSaving } =
    useFormEmpleado(initialValues, onSuccess, modo);

  const camposTexto = [
    { name: "nombre_completo", label: "Nombre Completo" },
    { name: "username", label: "Usuario" },
    { name: "correo", label: "Correo" },
    { name: "telefono", label: "Teléfono" },
  ];

  return (
    <Box>
      <Grid container spacing={2} direction="column">
        <Grid>
          <Typography
            variant="h4"
            align="center"
            sx={{ fontWeight: 600, mt: { xs: 5, sm: 0 } }}
          >
            {modo === "crear" ? "Crear Empleado" : "Editar Empleado"}
          </Typography>
        </Grid>

        <Grid sx={{ ml: { sm: 0, xs: 7 } }}>
          <form onSubmit={handleGuardar}>
            {camposTexto.map(({ name, label }) => (
              <TextField
                key={name}
                fullWidth
                label={label}
                value={editValues[name as keyof Empleado] || ""}
                onChange={(e) => handleChange(name as keyof Empleado, e.target.value)}
                margin="dense"
                focused
                variant="standard"
                error={!!formErrors[name as keyof Empleado]}
                helperText={formErrors[name as keyof Empleado]}
              />
            ))}

            {/* Campos sólo en modo crear */}
            {modo === "crear" && (
              <>
                <TextField
                  fullWidth
                  label="DNI"
                  value={editValues.dni || ""}
                  onChange={(e) => handleChange("dni", e.target.value)}
                  margin="dense"
                  focused
                  variant="standard"
                  error={!!formErrors.dni}
                  helperText={formErrors.dni}
                />

                <TextField
                  fullWidth
                  label="Contraseña"
                  type="password"
                  value={editValues.password || ""}
                  onChange={(e) => handleChange("password", e.target.value)}
                  margin="dense"
                  focused
                  variant="standard"
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                />
              </>
            )}

            <TextField
              select
              fullWidth
              label="Rol"
              value={editValues.rol}
              onChange={(e) => handleChange("rol", e.target.value)}
              margin="dense"
              variant="standard"
              focused
              error={!!formErrors.rol}
              helperText={formErrors.rol}
            >
              {["admin", "cajero", "repartidor"].map((rol) => (
                <MenuItem key={rol} value={rol}>
                  {rol}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 4, gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                loading={isSaving} 
                sx={{ height: 50 }}
              >
                {modo === "crear" ? "Crear" : "Guardar"}
              </Button>
              {onCancel && (
                <Button
                  variant="outlined"
                  sx={{ height: 50 }}
                  onClick={onCancel}
                  startIcon={<CloseIcon />}
                >
                  Cancelar
                </Button>
              )}
            </Box>
          </form>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmpleadoForm;
