import { useState } from "react";
import { restaurarPromocion } from "../api/promociones";
import { useSnackbar } from "../contexts/SnackbarContext";

export function useRestaurarPromocion(onSuccess: () => void) {
  const [isRestoring, setIsRestoring] = useState(false);
  const { showSnackbar } = useSnackbar();

  const restaurar = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas restaurar esta promoción?"
    );
    if (!confirmar) return;

    try {
      setIsRestoring(true);
      await restaurarPromocion(id);
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
