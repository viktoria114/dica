import { useState } from "react";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useAppDispatch } from "../store/hooks";
import { deletePromocion, getPromociones } from "../store/slices/promocionesSlice";


export const useBorrarPromocion = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSnackbar } = useSnackbar();

  const borrarPromocionHandler = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas borrar esta promoción?"
    );
    if (!confirmar) return;

    setIsDeleting(true);
    try {
      await dispatch(deletePromocion(id));
      await dispatch(getPromociones());
      showSnackbar("Promoción borrada correctamente", "success");
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) showSnackbar(error.message, "error", 4);
      else showSnackbar("Error desconocido al borrar la promoción", "error", 4);
    } finally {
      setIsDeleting(false);
    }
  };

  return { borrarPromocionHandler, isDeleting };
};
