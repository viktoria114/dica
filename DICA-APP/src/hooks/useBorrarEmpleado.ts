import { useState } from "react";
import { fetchBorrarEmpleado } from "../api/empleados";

export const useBorrarEmpleado = (onSuccess?: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const borrarEmpleado = async (dni: string) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas borrar este empleado?"
    );
    if (!confirmar) return;

    setIsDeleting(true);
    try {
      await fetchBorrarEmpleado(dni);
      alert("Empleado borrado correctamente");
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) alert(error.message);
      else alert("Error desconocido al borrar");
    } finally {
      setIsDeleting(false);
    }
  };

  return { borrarEmpleado, isDeleting };
};
