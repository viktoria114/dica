import { useState } from 'react';
import { modificarGasto } from '../../api/gastos';
import { useSnackbar } from '../../contexts/SnackbarContext';
import type { Gasto } from '../../types';

const formatDateForBackend = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export const useActualizarGasto = (onSuccess?: () => void) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSnackbar } = useSnackbar();

  const actualizar = async (id: number, values: Partial<Gasto>) => {
    setIsUpdating(true);
    try {
      const formattedValues = {
        ...values,
        fecha: values.fecha ? formatDateForBackend(new Date(values.fecha)) : undefined,
      };
      await modificarGasto(id, formattedValues as Gasto);
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
