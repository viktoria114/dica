import { useState } from "react";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useAppDispatch } from "../../store/hooks";
import { getPromociones, restorePromocion } from "../../store/slices/promocionesSlice";

export function useRestaurarPromocion(onSuccess: () => void) {
  const dispatch = useAppDispatch();
  const [isRestoring, setIsRestoring] = useState(false);
  const { showSnackbar } = useSnackbar();

  const restaurar = async (id: number) => {
    try {
      setIsRestoring(true);
      await dispatch(restorePromocion(id)).unwrap();
      await dispatch(getPromociones()); // Refresca la lista de promociones visibles
      showSnackbar("Promoción restaurada correctamente", "success");
      onSuccess();
    } catch (err) {
      if (err instanceof Error) showSnackbar(err.message, "error");
      else showSnackbar("Error desconocido al restaurar la promoción", "error");
    } finally {
      setIsRestoring(false);
    }
  };

  return { restaurar, isRestoring };
}
