import { useState } from "react";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useAppDispatch } from "../../store/hooks";
import { getPedidos, restaurarPedido } from "../../store/slices/pedidosSlices";

export function useRestaurarPedido(onSuccess: () => void) {
  const dispatch = useAppDispatch();
  const [isRestoringPedido, setIsRestoringPedido] = useState(false);
  const { showSnackbar } = useSnackbar();

  const restaurarP = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas restaurar este pedido?"
    );
    if (!confirmar) return;

    try {
      setIsRestoringPedido(true);
      await dispatch(restaurarPedido(id)).unwrap();
      await dispatch(getPedidos()); // Refresca la lista de pedidos si es necesario
      showSnackbar("Pedido restaurado correctamente", "success");
      onSuccess();
    } catch (err) {
      if (err instanceof Error) showSnackbar(err.message, "error");
      else showSnackbar("Error desconocido al restaurar el pedido", "error");
    } finally {
      setIsRestoringPedido(false);
    }
  };

  return { restaurarP, isRestoringPedido };
}
