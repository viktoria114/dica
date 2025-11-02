import { useState } from 'react';
<<<<<<< HEAD:DICA-APP/src/hooks/Gasto/useActualizarGasto.ts
import { modificarGasto } from '../../api/gastos';
import { useSnackbar } from '../../contexts/SnackbarContext';
import type { Gasto } from '../../types';
=======
import { useSnackbar } from '../contexts/SnackbarContext';
import type { Gasto } from '../types';
import { useAppDispatch } from '../store/hooks';
import { getGastos, modificarGastos } from '../store/slices/gastosSlice';
>>>>>>> origin/main:DICA-APP/src/hooks/useActualizarGasto.ts

const formatDateForBackend = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export const useActualizarGasto = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSnackbar } = useSnackbar();

  const actualizar = async (id: number, values: Partial<Gasto>) => {
    setIsUpdating(true);
    try {
      const formattedValues = {
        ...values,
        fecha: values.fecha ? formatDateForBackend(new Date(values.fecha)) : undefined,
      };
      await dispatch(modificarGastos({ id, payload: formattedValues as Gasto }));
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
