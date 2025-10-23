import { useState } from "react";
import { fetchRestaurarCliente } from "../api/clientes";
import { useSnackbar } from "../contexts/SnackbarContext";

export function useRestaurarCliente(onSuccess: () => void) {
  const [isRestoring, setIsRestoring] = useState(false);
  const { showSnackbar } = useSnackbar();

  const restaurar = async (tel: string) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas restaurar este cliente?"
    );
    if (!confirmar) return;

    try {
      setIsRestoring(true);
      await fetchRestaurarCliente(tel);
      showSnackbar("Cliente restaurado correctamente", "success");
      onSuccess();
    } catch (err) {
      if (err instanceof Error) showSnackbar(err.message, "error");
      else showSnackbar("Error desconocido al restaurar cliente", "error");
    } finally {
      setIsRestoring(false);
    }
  };

  return { restaurar, isRestoring };
}
