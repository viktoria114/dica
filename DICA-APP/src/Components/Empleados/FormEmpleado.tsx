import {
  TextField,
  MenuItem,
  Grid,
  Typography,
  Box,
  Button,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useEmpleadoForm } from "../../hooks/useFormEmpleado";
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
    useEmpleadoForm(initialValues, onSuccess, modo);

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
            <TextField
              fullWidth
              label="Nombre Completo"
              value={editValues.nombre_completo}
              onChange={(e) => handleChange("nombre_completo", e.target.value)}
              margin="dense"
              focused
              variant="standard"
              error={!!formErrors.nombre_completo}
              helperText={formErrors.nombre_completo}
            />
            <TextField
              fullWidth
              label="Username"
              value={editValues.username}
              onChange={(e) => handleChange("username", e.target.value)}
              margin="dense"
              focused
              variant="standard"
              error={!!formErrors.username}
              helperText={formErrors.username}
            />
            <TextField
              fullWidth
              label="Correo"
              value={editValues.correo || ""}
              onChange={(e) => handleChange("correo", e.target.value)}
              margin="dense"
              focused
              variant="standard"
              error={!!formErrors.correo}
              helperText={formErrors.correo}
            />
            <TextField
              fullWidth
              label="Teléfono"
              value={editValues.telefono || ""}
              onChange={(e) => handleChange("telefono", e.target.value)}
              margin="dense"
              focused
              variant="standard"
              error={!!formErrors.telefono}
              helperText={formErrors.telefono}
            />
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
              <MenuItem value="admin">admin</MenuItem>
              <MenuItem value="cajero">cajero</MenuItem>
              <MenuItem value="repartidor">repartidor</MenuItem>
            </TextField>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 4,
                gap: 2,
              }}
            >
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
