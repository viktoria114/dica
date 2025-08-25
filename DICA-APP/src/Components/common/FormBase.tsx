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

export interface FieldConfig<T> {
  name: keyof T;
  label: string;
  type?: "text" | "password" | "select" | "number";
  options?: { value: string; label: string }[]; // para selects
  onlyInCreate?: boolean; // campos visibles solo en modo "crear"
}

interface GenericFormProps<T> {
  entityName: string; // ej: "Empleado", "Cliente"
  modo: "crear" | "editar";
  fields: FieldConfig<T>[];
  formErrors: Partial<Record<keyof T, string>>;
  values: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (field: keyof T, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

function GenericForm<T>({
  entityName,
  modo,
  fields,
  formErrors,
  values,
  onChange,
  onSubmit,
  onCancel,
  isSaving,
}: GenericFormProps<T>) {
  return (
    <Box>
      <Grid container spacing={2} direction="column">
        <Grid>
          <Typography
            variant="h4"
            align="center"
            sx={{ fontWeight: 600, mt: { xs: 5, sm: 0 } }}
          >
            {modo === "crear" ? `Crear ${entityName}` : `Editar ${entityName}`}
          </Typography>
        </Grid>

        <Grid sx={{ ml: { sm: 0, xs: 7 } }}>
          <form onSubmit={onSubmit}>
            {fields.map((field) => {
              if (field.onlyInCreate && modo !== "crear") return null;

              return (
                <TextField
                  key={String(field.name)}
                  fullWidth
                  label={field.label}
                  type={field.type ?? "text"}
                  value={values[field.name] ?? ""}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  margin="dense"
                  variant="standard"
                  focused
                  error={!!formErrors[field.name]}
                  helperText={formErrors[field.name]}
                  select={field.type === "select"}
                >
                  {field.type === "select" &&
                    field.options?.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                </TextField>
              );
            })}

            <Box sx={{ display: "flex", justifyContent: "center", mt: 4, gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                disabled={isSaving}
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
}

export default GenericForm;
