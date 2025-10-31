import { useState } from 'react';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useAppDispatch } from '../store/hooks';
import { eliminarGastos, getGastos } from '../store/slices/gastosSlice';

export const useBorrarGasto = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSnackbar } = useSnackbar();

  const borrar = async (id: number) => {
    setIsDeleting(true);
    try {
      await dispatch(eliminarGastos(id));
      await dispatch(getGastos());
      showSnackbar('Gasto eliminado con éxito!', 'success');
      onSuccess?.();
    } catch (error) {
      console.error(error);
      showSnackbar('Error al eliminar el gasto', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return { borrar, isDeleting };
};
