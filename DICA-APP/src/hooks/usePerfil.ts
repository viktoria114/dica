// src/hooks/useEmpleadoActual.ts
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { fetchActualizarEmpleado, fetchEmpleadosbyDNI } from "../api/empleados";
import type { Empleado } from "../types";
import { useSnackbar } from "../contexts/SnackbarContext";

export const usePerfil = () => {
  const { usuario } = useAuth();
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();

  const [values, setValues] = useState({
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const cargarEmpleado = async () => {
      if (!usuario) {
        setEmpleado(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchEmpleadosbyDNI(usuario.dni.toString());
        setEmpleado(data.empleado);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido");
        }
      } finally {
        setLoading(false);
      }
    };

    cargarEmpleado();
  }, [usuario]);

  const handleChange = (field: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSaving(true);
    const nuevosErrores: Record<string, string> = {};

    // Validaciones
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
if (!empleado) {
  setIsSaving(false);
  return;
}

const payload: Empleado = {
  ...empleado,
  password: values.password,
};

      await fetchActualizarEmpleado(payload);
      showSnackbar("Contraseña actualizada correctamente", "success");
      setValues({ password: "", confirmPassword: "" }); // limpiar
   //   onSuccess();
    } catch (error) {
      if (error instanceof Error) showSnackbar(error.message, "error");
      else showSnackbar("Error desconocido", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    empleado,
    usuario,
    loading,
    error,
    setEmpleado,
    values,
    formErrors,
    isSaving,
    handleChange,
    handleGuardar,
  };
};
