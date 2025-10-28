import { useState } from "react";
import { fetchRestaurarEmpleado } from "../api/empleados";
import { useSnackbar } from "../contexts/SnackbarContext";

export function useRestaurarEmpleado(onSuccess: () => void) {
  const [isRestoring, setIsRestoring] = useState(false);
  const { showSnackbar } = useSnackbar();

  const restaurar = async (dni: string) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas restaurar este empleado?");
    if (!confirmar) return;

    try {
      setIsRestoring(true);
      await fetchRestaurarEmpleado(dni);
      showSnackbar("Empleado restaurado correctamente", "success");
      onSuccess();
    } catch (err) {
      if (err instanceof Error) showSnackbar(err.message, "error");
      else showSnackbar("Error desconocido al restaurar empleado", "error");
    } finally {
      setIsRestoring(false);
    }
  };

  return { restaurar, isRestoring };
}
