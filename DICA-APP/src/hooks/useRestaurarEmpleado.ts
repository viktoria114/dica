import { useState } from "react";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useAppDispatch } from "../store/hooks";
import { restaurarEmpleado, getEmpleadosInvisibles } from "../store/slices/empleadosSlice";

export function useRestaurarEmpleado(onSuccess?: () => void) {
  const dispatch = useAppDispatch();
  const [isRestoring, setIsRestoring] = useState(false);
  const { showSnackbar } = useSnackbar();

  const restaurar = async (dni: string) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas restaurar este empleado?");
    if (!confirmar) return;

    try {
      setIsRestoring(true);
      await dispatch(restaurarEmpleado(dni)).unwrap();
      await dispatch(getEmpleadosInvisibles()); // Refresca la papelera
      showSnackbar("Empleado restaurado correctamente", "success");
      onSuccess?.();
    } catch (err) {
      if (err instanceof Error) showSnackbar(err.message, "error");
      else showSnackbar("Error desconocido al restaurar empleado", "error");
    } finally {
      setIsRestoring(false);
    }
  };

  return { restaurar, isRestoring };
}
