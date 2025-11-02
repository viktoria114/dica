import { useState } from 'react';
<<<<<<< HEAD:DICA-APP/src/hooks/Gasto/useBorrarGasto.ts
import { eliminarGasto } from '../../api/gastos';
import { useSnackbar } from '../../contexts/SnackbarContext';
=======
import { useSnackbar } from '../contexts/SnackbarContext';
import { useAppDispatch } from '../store/hooks';
import { eliminarGastos, getGastos } from '../store/slices/gastosSlice';
>>>>>>> origin/main:DICA-APP/src/hooks/useBorrarGasto.ts

export const useBorrarGasto = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSnackbar } = useSnackbar();

  const borrar = async (id: number) => {
    setIsDeleting(true);
    try {
      await dispatch(eliminarGastos(id));
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
