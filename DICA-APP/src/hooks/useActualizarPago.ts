import { useState } from 'react';
import { modificarPago } from '../api/pagos';
import { useSnackbar } from '../contexts/SnackbarContext';
import type { Pago } from '../types';

export const useActualizarPago = (onSuccess?: () => void) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSnackbar } = useSnackbar();

  const actualizar = async (id: number, values: Partial<Pago>) => {
    setIsUpdating(true);
    try {
      await modificarPago(id, values as Pago);
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
