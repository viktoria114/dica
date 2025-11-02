import { useState } from 'react';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useAppDispatch } from '../../store/hooks';
import { eliminarPagos } from '../../store/slices/pagosSlice';

export const useBorrarPago = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSnackbar } = useSnackbar();

  const borrar = async (id: number) => {
    setIsDeleting(true);
    try {
      await dispatch(eliminarPagos(id));
      showSnackbar('Pago eliminado con éxito!', 'success');
      onSuccess?.();
    } catch (error) {
      console.error(error);
      showSnackbar('Error al eliminar el pago', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return { borrar, isDeleting };
};
