import { useState } from 'react';
import { eliminarGasto } from '../../api/gastos';
import { useSnackbar } from '../../contexts/SnackbarContext';

export const useBorrarGasto = (onSuccess?: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSnackbar } = useSnackbar();

  const borrar = async (id: number) => {
    setIsDeleting(true);
    try {
      await eliminarGasto(id);
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
