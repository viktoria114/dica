/* eslint-disable @typescript-eslint/no-explicit-any */
import { TextField, MenuItem, Grid, Typography, Box } from "@mui/material";
import { ActionButtons } from "./ActionButtons";
import React from "react"; // Asegúrate de que React esté importado

// 👇 PASO 1: ACTUALIZAR LA INTERFAZ
export interface FieldConfig<T> {
  name: keyof T;
  label: string;
  type?: "text" | "password" | "select" | "number";
  options?: { value: string; label: string }[]; // para selects
  onlyInCreate?: boolean; // campos visibles solo en modo "crear"
  disabled?: boolean; // Para permitir campos deshabilitados
  // 👇 AÑADE ESTA PROPIEDAD
  render?: (
    value: any,
    handleChange: (field: keyof T, value: any) => void,
    error?: string
  ) => React.ReactNode;
}

interface GenericFormProps<T> {
  entityName: string; // ej: "Empleado", "Cliente"
  modo: "crear" | "editar";
  fields?: FieldConfig<T>[];
  formErrors: Partial<Record<keyof T, string>>;
  values: T;
  onChange?: (field: keyof T, value: any) => void;
  onSubmit?: (values: T) => void; // 👈 ahora devuelve los valores, no el evento
  onCancel?: () => void;
  isSaving?: boolean;
  disabledFields?: (keyof T)[];
  children?: React.ReactNode;
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
  disabledFields = [],
  children,
}: GenericFormProps<T>) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(values); // 👈 ahora el padre recibe los values directamente
  };

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
          <form onSubmit={handleSubmit}>
            {/* 👇 PASO 2: ACTUALIZAR LA LÓGICA DE RENDERIZADO */}
            {fields?.map((field) => {
              if (field.onlyInCreate && modo !== "crear") return null;

              // 👇 SI EL CAMPO TIENE UN RENDERIZADOR PERSONALIZADO, ÚSALO
              if (field.render && onChange) {
                return (
                  <Box
                    key={String(field.name)}
                    sx={{ mt: 2, mb: 1 }} // Damos un espaciado similar al 'dense'
                  >
                    {field.render(
                      values[field.name],
                      onChange,
                      formErrors[field.name]
                    )}
                  </Box>
                );
              }

              // 👇 SI NO, RENDERIZA EL TEXTFIELD NORMAL DE ANTES
              return (
                <TextField
                  key={String(field.name)}
                  fullWidth
                  label={field.label}
                  type={field.type ?? "text"}
                  value={values[field.name] ?? ""}
                  onChange={(e) =>
                    onChange?.(field.name, e.target.value as unknown)
                  }
                  margin="dense"
                  variant="standard"
                  focused
                  error={!!formErrors[field.name]}
                  helperText={formErrors[field.name]}
                  select={field.type === "select"}
                  disabled={
                    disabledFields.includes(field.name) || field.disabled
                  } // Manejo de campos deshabilitados
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

            {children}

            <ActionButtons
              mode="form"
              labelSave={modo === "crear" ? "Crear" : "Guardar"}
              onSave={() => onSubmit?.(values)}
              onCancel={onCancel}
              loadingSave={isSaving}
            />
          </form>
        </Grid>
      </Grid>
    </Box>
  );
}

export default GenericForm;
