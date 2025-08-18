import { useState } from "react";
import { fetchRestaurarEmpleado } from "../api/empleados";

export function useRestaurarEmpleado(onSuccess: () => void) {
  const [isRestoring, setIsRestoring] = useState(false);

  const restaurar = async (dni: string) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas restaurar este empleado?");
    if (!confirmar) return;

    try {
      setIsRestoring(true);
      await fetchRestaurarEmpleado(dni);
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRestoring(false);
    }
  };

  return { restaurar, isRestoring };
}
