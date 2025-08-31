import { useState } from "react";
import { fetchActualizarEmpleado } from "../api/empleados";
import type { Empleado } from "../types";

export const useFormPassword = (empleado: Empleado | null, onSuccess: () => void) => {
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [formErrors, setFormErrors] = useState<Record<string,string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof typeof values, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async () => {
    if (!empleado) return;

    setIsSaving(true);
    const nuevosErrores: Record<string,string> = {};

    if (!values.password.trim()) {
      nuevosErrores.password = "La contraseña es obligatoria";
    } else if (values.password.length < 6) {
      nuevosErrores.password = "Debe tener al menos 6 caracteres";
    }

    if (values.password !== values.confirmPassword) {
      nuevosErrores.confirmPassword = "Las contraseñas no coinciden";
    }

    setFormErrors(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      setIsSaving(false);
      return;
    }

    try {
      await fetchActualizarEmpleado({ ...empleado, password: values.password });
      alert("Contraseña actualizada correctamente");
      setValues({ password: "", confirmPassword: "" });
      onSuccess();
    } catch (error) {
      if (error instanceof Error) alert(error.message);
      else alert("Error desconocido");
    } finally {
      setIsSaving(false);
    }
  };

  return { values, formErrors, isSaving, handleChange, handleGuardar };
};
