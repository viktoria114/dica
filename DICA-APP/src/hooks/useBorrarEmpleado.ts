import { useState } from "react";
import { fetchBorrarEmpleado } from "../api/empleados";
import { useSnackbar } from "../contexts/SnackbarContext";

export const useBorrarEmpleado = (onSuccess?: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSnackbar } = useSnackbar();

  const borrarEmpleado = async (dni: string) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas borrar este empleado?"
    );
    if (!confirmar) return;

    setIsDeleting(true);
    try {
      await fetchBorrarEmpleado(dni);
      showSnackbar("Empleado borrado correctamente", "success");
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) showSnackbar(error.message, "error");
      else showSnackbar("Error desconocido al borrar", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return { borrarEmpleado, isDeleting };
};
