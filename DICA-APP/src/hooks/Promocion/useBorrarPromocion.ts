import { useState } from "react";
import { eliminarPromocion } from "../../api/promociones";
import { useSnackbar } from "../../contexts/SnackbarContext";

export const useBorrarPromocion = (onSuccess?: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSnackbar } = useSnackbar();

  const borrarPromocion = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas borrar esta promoción?"
    );
    if (!confirmar) return;

    setIsDeleting(true);
    try {
      await eliminarPromocion(id);
      showSnackbar("Promoción borrada correctamente", "success");
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) showSnackbar(error.message, "error", 4);
      else showSnackbar("Error desconocido al borrar la promoción", "error", 4);
    } finally {
      setIsDeleting(false);
    }
  };

  return { borrarPromocion, isDeleting };
};
