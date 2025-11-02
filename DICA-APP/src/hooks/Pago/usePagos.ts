import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getPagos } from "../../store/slices/pagosSlice";

export const usePagos = () => {
  const dispatch = useAppDispatch();

  const { pagos, loading, error } = useAppSelector((state) => state.pagos);

  // 🔁 Cargar pagos al montar el componente
  useEffect(() => {
    dispatch(getPagos());
  }, [dispatch]);

  // 🔄 Refrescar manualmente los pagos
  const refreshPagos = useCallback(() => {
    dispatch(getPagos());
  }, [dispatch]);

  return {
    pagos,
    loading,
    error,
    refreshPagos,
  };
};
