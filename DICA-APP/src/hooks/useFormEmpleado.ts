import { useState } from "react";
import { fetchActualizarEmpleado, fetchCrearEmpleado } from "../api/empleados";
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
      nuevosErrores.username = "El usuario es obligatorio";
    }

    if (!editValues.nombre_completo.trim()) {
      nuevosErrores.nombre_completo = "El nombre completo es obligatorio";
    }

    if (!editValues.rol.trim()) {
      nuevosErrores.rol = "El rol es obligatorio";
    }

    // Validaciones modo crear: dni y password obligatorios
    if (mode === "crear") {
      if (!editValues.dni?.trim()) {
        nuevosErrores.dni = "El dni es obligatorio";
      } else if (!/^\d+$/.test(editValues.dni.trim())) {
        nuevosErrores.dni = "El dni debe contener solo números";
      } 
      if (!editValues.password?.trim()) {
        nuevosErrores.password = "La contraseña es obligatoria";
      }
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
        visibilidad: true,
      };

      if (mode === "crear") {
        console.log(payload);

        await fetchCrearEmpleado(payload);
        alert("Empleado creado correctamente");
      } else {
        await fetchActualizarEmpleado(payload);
        alert("Empleado actualizado correctamente");
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
  };
};
