import { useState } from 'react';
import { useSnackbar } from '../contexts/SnackbarContext';
import type { Pago } from '../types';
import { useAppDispatch } from '../store/hooks';
import { getPagos, modificarPagos } from '../store/slices/pagosSlice';

export const useActualizarPago = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSnackbar } = useSnackbar();

  const actualizar = async (id: number, values: Partial<Pago>) => {
    setIsUpdating(true);
    try {
      await dispatch(modificarPagos(id, values as Pago));
      await dispatch(getPagos());
      showSnackbar('Pago actualizado con éxito!', 'success');
      onSuccess?.();
    } catch (error) {
      console.error(error);
      showSnackbar('Error al actualizar el pago', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return { actualizar, isUpdating };
};
