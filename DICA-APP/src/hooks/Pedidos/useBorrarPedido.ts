import { useState } from "react";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { borrarPedido } from "../../api/pedidos";

export const useBorrarPedido = (onDeleteSuccess: (id: number) => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSnackbar } = useSnackbar();

  const handleDelete = async (pedidoId: number) => {
    setIsDeleting(true);
    try {
      await borrarPedido(pedidoId);

      // Actualiza la UI quitando el pedido de la lista
      onDeleteSuccess(pedidoId);

      showSnackbar(
        `Pedido #${pedidoId} movido a la papelera con éxito.`,
        "success"
      );
      window.location.reload();
    } catch (error) {
      console.error(error);
      showSnackbar("Error al borrar el pedido.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    handleDelete,
  };
};
