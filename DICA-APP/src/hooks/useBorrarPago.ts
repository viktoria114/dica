import { useState } from 'react';
import { eliminarPago } from '../api/pagos';
import { useSnackbar } from '../contexts/SnackbarContext';

export const useBorrarPago = (onSuccess?: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSnackbar } = useSnackbar();

  const borrar = async (id: number) => {
    setIsDeleting(true);
    try {
      await eliminarPago(id);
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
