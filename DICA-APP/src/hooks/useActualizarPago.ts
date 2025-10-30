import { useState } from 'react';
import { modificarPago } from '../api/pagos';
import { useSnackbar } from '../contexts/SnackbarContext';
import type { Pago } from '../types';

const formatDateForBackend = (date: Date): string => {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export const useActualizarPago = (onSuccess?: () => void) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSnackbar } = useSnackbar();

  const actualizar = async (id: number, values: Partial<Pago>) => {
    setIsUpdating(true);
    try {
      const formattedValues = {
        ...values,
        fk_fecha: values.fk_fecha ? formatDateForBackend(new Date(values.fk_fecha)) : undefined,
      };
      await modificarPago(id, formattedValues);
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
