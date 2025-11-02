// src/hooks/useRestaurarStock.ts
import { useState } from "react";
<<<<<<< HEAD:DICA-APP/src/hooks/Stock/useRestaurarStock.ts
import { fetchRestaurarStock } from "../../api/stock";
import { useSnackbar } from "../../contexts/SnackbarContext";
=======
import { useSnackbar } from "../contexts/SnackbarContext";
import { useAppDispatch } from "../store/hooks";
import { getStock, restaurarStock } from "../store/slices/stockSlice";
>>>>>>> origin/main:DICA-APP/src/hooks/useRestaurarStock.ts

export function useRestaurarStock(onSuccess: () => void) {
  const dispatch = useAppDispatch();
  const [isRestoring, setIsRestoring] = useState(false);
  const { showSnackbar } = useSnackbar();

  const restaurar = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas restaurar este stock?"
    );
    if (!confirmar) return;

    try {
      setIsRestoring(true);
      await dispatch(restaurarStock(id));
      await dispatch(getStock()); // Refresca la papelera
      showSnackbar("Stock restaurado correctamente", "success");
      onSuccess();
    } catch (err) {
      if (err instanceof Error) showSnackbar(err.message, "error");
      else showSnackbar("Error desconocido al restaurar stock", "error");
    } finally {
      setIsRestoring(false);
    }
  };

  return { restaurar, isRestoring };
}
