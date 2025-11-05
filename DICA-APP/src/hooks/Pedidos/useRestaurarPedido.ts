import { useState } from "react";
import { restaurarPedido } from "../../api/pedidos";
import { useSnackbar } from "../../contexts/SnackbarContext";

export function useRestaurarPedido(onSuccess: () => void) {
  const [isRestoringPedido, setIsRestoringPedido] = useState(false);
  const { showSnackbar } = useSnackbar();

  const restaurarP = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas restaurar este pedido?"
    );
    if (!confirmar) return;

    try {
      setIsRestoringPedido(true);
      await restaurarPedido(id);
      showSnackbar("Pedido restaurado correctamente", "success");
      onSuccess();
      window.location.reload();
    } catch (err) {
      if (err instanceof Error) showSnackbar(err.message, "error");
      else showSnackbar("Error desconocido al restaurar el pedido", "error");
    } finally {
      setIsRestoringPedido(false);
    }
  };

  return { restaurarP, isRestoringPedido };
}
