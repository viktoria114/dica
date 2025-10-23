import { useState } from "react";
import { fetchBorrarCliente } from "../api/clientes";
import { useSnackbar } from "../contexts/SnackbarContext";

export const useBorrarCliente = (onSuccess?: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSnackbar } = useSnackbar();

  const borrarCliente = async (tel: string) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas borrar este cliente?"
    );
    if (!confirmar) return;

    setIsDeleting(true);
    try {
      await fetchBorrarCliente(tel);
      showSnackbar("Cliente borrado correctamente", "success");
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) showSnackbar(error.message, "error", 4);
      else showSnackbar("Error desconocido al borrar cliente", "error", 4);
    } finally {
      setIsDeleting(false);
    }
  };

  return { borrarCliente, isDeleting };
};
