// src/hooks/useBorrarStock.ts
import { useState } from "react";
<<<<<<< HEAD:DICA-APP/src/hooks/Stock/useBorrarStock.ts
import { useSnackbar } from "../../contexts/SnackbarContext";
import { fetchBorrarStock } from "../../api/stock";
=======
import { useSnackbar } from "../contexts/SnackbarContext";
import { useAppDispatch } from "../store/hooks";
import { borrarStock, getStock } from "../store/slices/stockSlice";
>>>>>>> origin/main:DICA-APP/src/hooks/useBorrarStock.ts

export const useBorrarStock = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSnackbar } = useSnackbar();

  const borrarStockHandler = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas borrar este stock?"
    );
    if (!confirmar) return;

    setIsDeleting(true);
    try {
      await dispatch(borrarStock(id));
      await dispatch(getStock());
      showSnackbar("Stock borrado correctamente", "success");
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) showSnackbar(error.message, "error");
      else showSnackbar("Error desconocido al borrar stock", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return { borrarStockHandler, isDeleting };
};
