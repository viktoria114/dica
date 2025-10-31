import { useState } from "react";

import { useSnackbar } from "../contexts/SnackbarContext";
import { useAppDispatch } from "../store/hooks";
import { borrarEmpleado, getEmpleados} from "../store/slices/empleadosSlice";


export const useBorrarEmpleado = (onSuccess?: () => void) => {
    const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSnackbar } = useSnackbar();

  const borrarEmpleadoHandler  = async (dni: string) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas borrar este empleado?"
    );
    if (!confirmar) return;

    setIsDeleting(true);
    try {
      await dispatch(borrarEmpleado(dni)).unwrap();
      await dispatch(getEmpleados());
      showSnackbar("Empleado borrado correctamente", "success");
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) showSnackbar(error.message, "error");
      else showSnackbar("Error desconocido al borrar", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return { borrarEmpleadoHandler , isDeleting };
};
