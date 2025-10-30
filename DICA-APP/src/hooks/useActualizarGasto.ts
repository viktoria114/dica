import { useState } from 'react';
import { modificarGasto } from '../api/gastos';
import { useSnackbar } from '../contexts/SnackbarContext';
import type { Gasto } from '../types';

export const useActualizarGasto = (onSuccess?: () => void) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSnackbar } = useSnackbar();

  const actualizar = async (id: number, values: Partial<Gasto>) => {
    setIsUpdating(true);
    try {
      await modificarGasto(id, values as Gasto);
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
