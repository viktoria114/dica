import { useState } from 'react';
import { useSnackbar } from '../contexts/SnackbarContext';
import type { Pago } from '../types';
import { useAppDispatch } from '../store/hooks';
import { getPagos, modificarPagos } from '../store/slices/pagosSlice';

const formatDateForBackend = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export const useActualizarPago = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSnackbar } = useSnackbar();

  const actualizar = async (id: number, values: Partial<Pago>) => {
    setIsUpdating(true);
    try {
      const payload: Partial<Pago> = { ...values };

      if (payload.monto !== undefined && payload.monto !== null) {
        payload.monto = parseFloat(String(payload.monto));
      }

      if (payload.validado !== undefined) {
        payload.validado = Boolean(payload.validado);
      }

      if (payload.fk_fecha) {
        payload.fk_fecha = formatDateForBackend(new Date(payload.fk_fecha));
      }

      await dispatch(modificarPagos({ id, payload: payload as Pago }));
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
