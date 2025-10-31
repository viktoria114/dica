import { useState } from "react";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useAppDispatch } from "../../store/hooks";
import { getClientesInvisibles, restaurarCliente } from "../../store/slices/clientesSlice";

export function useRestaurarCliente(onSuccess: () => void) {
  const dispatch = useAppDispatch();
  const [isRestoring, setIsRestoring] = useState(false);
  const { showSnackbar } = useSnackbar();

  const restaurar = async (tel: string) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas restaurar este cliente?"
    );
    if (!confirmar) return;

    try {
      setIsRestoring(true);
      await dispatch(restaurarCliente(tel)).unwrap();
      await dispatch(getClientesInvisibles()); // Refresca la lista de clientes
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
