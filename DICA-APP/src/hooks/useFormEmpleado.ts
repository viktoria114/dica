import { useEffect, useState } from "react";
import { fetchActualizarEmpleado, fetchCrearEmpleado } from "../api/empleados";
import type { Empleado } from "../types";
import type { FieldConfig } from "../Components/common/FormBase";
import { useSnackbar } from "../contexts/SnackbarContext";

const fields: FieldConfig<Empleado>[] = [
  { name: "nombre_completo", label: "Nombre Completo" },
  { name: "username", label: "Usuario" },
  { name: "correo", label: "Correo" },
  { name: "telefono", label: "Teléfono" },
  { name: "dni", label: "DNI", onlyInCreate: true },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
    onlyInCreate: true,
  },
  {
    name: "rol",
    label: "Rol",
    type: "select",
    options: [
      { value: "admin", label: "Admin" },
      { value: "cajero", label: "Cajero" },
      { value: "repartidor", label: "Repartidor" },
      { value: "cocinero", label: "Cocinero" },
    ],
  },
];

export const useFormEmpleado = (
  initialValues: Empleado | null,
  onSuccess: () => void,
  mode: "crear" | "editar" = "editar"
) => {
   const [editValues, setEditValues] = useState<Empleado>(
    initialValues ?? ({} as Empleado)
  );
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof Empleado, string>>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const { showSnackbar } = useSnackbar();

useEffect(() => {
  if (initialValues && Object.keys(initialValues).length > 0) {
    setEditValues((prev) => {
      // evitar resetear si ya tiene esos valores
      if (JSON.stringify(prev) !== JSON.stringify(initialValues)) {
        return initialValues;
      }
      return prev;
    });
  }
}, [initialValues]);


  const handleChange = (field: keyof Empleado, value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async (values: Empleado) => {
  setIsSaving(true);
  const nuevosErrores: { [key: string]: string } = {};

  // Validaciones obligatorias
  if (!values.username.trim()) {
    nuevosErrores.username = "El usuario es obligatorio";
  }

  if (!values.nombre_completo.trim()) {
    nuevosErrores.nombre_completo = "El nombre completo es obligatorio";
  }

  if (!values.rol.trim()) {
    nuevosErrores.rol = "El rol es obligatorio";
  }

  // Validaciones modo crear: dni y password obligatorios
  if (mode === "crear") {
    if (!values.dni?.trim()) {
      nuevosErrores.dni = "El dni es obligatorio";
    } else if (!/^\d+$/.test(values.dni.trim())) {
      nuevosErrores.dni = "El dni debe contener solo números";
    }
    if (!values.password?.trim()) {
      nuevosErrores.password = "La contraseña es obligatoria";
    }
  }

  // Validaciones opcionales
  if (values.telefono && !/^[\d+]+$/.test(values.telefono)) {
    nuevosErrores.telefono = "Solo números y '+'";
  }

  if (
    values.correo &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.correo)
  ) {
    nuevosErrores.correo = "Correo inválido";
  }

  setFormErrors(nuevosErrores);

  // 🚫 NO guardar ni cerrar si hay errores
  if (Object.keys(nuevosErrores).length > 0) {
    setIsSaving(false);
    return;
  }

  try {
    const payload = {
      ...values,
      telefono: values.telefono?.trim() || null,
      correo: values.correo?.trim() || null,
      visibilidad: true,
    };

    if (mode === "crear") {
      await fetchCrearEmpleado(payload);
      showSnackbar("Empleado creado correctamente", "success");
    } else {
      await fetchActualizarEmpleado(payload);
      showSnackbar("Empleado actualizado correctamente", "success");
    }

    onSuccess();
  } catch (error) {
    if (error instanceof Error) showSnackbar(error.message, "error");
    else showSnackbar("Error desconocido", "error");
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
