// src/hooks/useBorrarStock.ts
import { useState } from "react";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { fetchBorrarStock } from "../../api/stock";

export const useBorrarStock = (onSuccess?: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSnackbar } = useSnackbar();

  const borrarStock = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas borrar este stock?"
    );
    if (!confirmar) return;

    setIsDeleting(true);
    try {
      await fetchBorrarStock(id);
      showSnackbar("Stock borrado correctamente", "success");
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) showSnackbar(error.message, "error");
      else showSnackbar("Error desconocido al borrar stock", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return { borrarStock, isDeleting };
};
