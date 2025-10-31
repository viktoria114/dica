import { useState } from 'react';
import { useSnackbar } from '../contexts/SnackbarContext';
import type { Gasto } from '../types';
import { useAppDispatch } from '../store/hooks';
import { getGastos, modificarGastos } from '../store/slices/gastosSlice';

export const useActualizarGasto = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSnackbar } = useSnackbar();

  const actualizar = async (id: number, values: Partial<Gasto>) => {
    setIsUpdating(true);
    try {
      await dispatch(modificarGastos(id, values as Gasto));
      await dispatch(getGastos());
      showSnackbar('Gasto actualizado con éxito!', 'success');
      onSuccess?.();
    } catch (error) {
      console.error(error);
      showSnackbar('Error al actualizar el gasto', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return { actualizar, isUpdating };
};
