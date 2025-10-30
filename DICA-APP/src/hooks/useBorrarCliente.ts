import { useState } from "react";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useAppDispatch } from "../store/hooks";
import { borrarCliente, getClientes } from "../store/slices/clientesSlice";

export const useBorrarCliente = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSnackbar } = useSnackbar();

  const borrarClienteHandler = async (tel: string) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas borrar este cliente?"
    );
    if (!confirmar) return;

    setIsDeleting(true);
    try {
      await dispatch(borrarCliente(tel)).unwrap();
      await dispatch(getClientes());
      showSnackbar("Cliente borrado correctamente", "success");
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) showSnackbar(error.message, "error", 4);
      else showSnackbar("Error desconocido al borrar cliente", "error", 4);
    } finally {
      setIsDeleting(false);
    }
  };

  return { borrarClienteHandler, isDeleting };
};
