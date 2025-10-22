import { useEffect, useState } from "react";
import { fetchActualizarCliente, fetchCrearCliente } from "../api/clientes";
import type { Cliente } from "../types";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import type { FieldConfig } from "../Components/common/FormBase";

const fields: FieldConfig<Cliente>[] = [
  { name: "nombre", label: "Nombre completo" },
  { name: "telefono", label: "Teléfono" },
  {
    name: "dieta",
    label: "Dieta",
    type: "select",
    options: [
      { value: "vegano", label: "Vegano" },
      { value: "vegetariano", label: "Vegetariano" },
     //{ value: "celiaco", label: "Celíaco" },
     // { value: "hipertenso", label: "Hipertenso" },
     // { value: "diabetico", label: "Diabético" },
      { value: "neutra", label: "Neutra" },
      { value: "sin asignar", label: "Sin asignar" },
    ],
  },
  { name: "preferencias", label: "Preferencias" },
  {
    name: "ultima_compra",
    label: "Última compra",
    render: (value, handleChange, error) => (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          label="Última compra"
          // El valor que llega es el string del estado, lo convertimos a Dayjs
          value={value ? dayjs(value) : null}
          onChange={(newValue: Dayjs | null) => {
            // Al cambiar, guardamos el string ISO en el estado
            handleChange(
              "ultima_compra",
              newValue && newValue.isValid() ? newValue.toISOString() : null
            );
          }}
          slotProps={{
            textField: {
               color: "primary",
              focused: true,
              fullWidth: true,
              error: !!error,
              helperText: error,
            },
          }}
        />
      </LocalizationProvider>
    ),
  },
];

export const useFormClientes = (
  initialValues: Cliente | null,
  onSuccess: () => void,
  mode: "crear" | "editar" = "editar"
) => {
  const [editValues, setEditValues] = useState<Cliente>(
    initialValues ?? ({} as Cliente)
  );
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof Cliente, string>>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setEditValues((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(initialValues)) {
          return initialValues;
        }
        return prev;
      });
    }
  }, [initialValues]);

  const handleChange = (field: keyof Cliente, value: string | string[]) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async (values: Cliente) => {
    setIsSaving(true);
    const nuevosErrores: { [key: string]: string } = {};

    // Validaciones básicas
    if (!values.nombre?.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }

    if (!values.telefono) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    } else if (isNaN(Number(values.telefono))) {
      nuevosErrores.telefono = "Debe contener solo números";
    }

    // Validación opcional: dieta
    if (values.dieta && !values.dieta.trim()) {
      nuevosErrores.dieta = "La dieta no puede estar vacía";
    }

    setFormErrors(nuevosErrores);

    // 🚫 Si hay errores, no continuar
    if (Object.keys(nuevosErrores).length > 0) {
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        ...values,
        telefono: values.telefono ? Number(values.telefono) : null,
        preferencias: values.preferencias || null,
        dieta: values.dieta?.trim() || null,
      };

      if (mode === "crear") {
        await fetchCrearCliente(payload);
        alert("Cliente creado correctamente");
      } else {
        await fetchActualizarCliente(payload);
        alert("Cliente actualizado correctamente");
      }

      onSuccess();
    } catch (error) {
      if (error instanceof Error) alert(error.message);
      else alert("Error desconocido");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    editValues,
    handleChange,
    handleGuardar,
    formErrors,
    isSaving,
    setEditValues,
    fields,
  };
};
