import { useState } from "react";
import { fetchActualizarEmpleado } from "../api/empleados";
import type { Empleado } from "../types";

export const useEmpleadoForm = (
  initialValues: Empleado,
  onSuccess: () => void,
  mode: "crear" | "editar" = "editar"
) => {
  const [editValues, setEditValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof Empleado, string>>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof Empleado, value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSaving(true);
    const nuevosErrores: { [key: string]: string } = {};

    // Validaciones obligatorias
    if (!editValues.username.trim()) {
      nuevosErrores.username = "El username es obligatorio";
    }

    if (!editValues.nombre_completo.trim()) {
      nuevosErrores.nombre_completo = "El nombre completo es obligatorio";
    }

    if (!editValues.rol.trim()) {
      nuevosErrores.rol = "El rol es obligatorio";
    }

    // Validaciones opcionales
    if (editValues.telefono && !/^[\d+]+$/.test(editValues.telefono)) {
      nuevosErrores.telefono = "Solo números y '+'";
    }

    if (
      editValues.correo &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editValues.correo)
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
        ...editValues,
        telefono: editValues.telefono?.trim() || null,
        correo: editValues.correo?.trim() || null,
      };

      await fetchActualizarEmpleado(payload);
      alert(
        `Empleado ${mode === "crear" ? "creado" : "actualizado"} correctamente`
      );

      // ✅ Solo acá se llama a onSuccess()
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
  };
};
