import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getPagos } from "../../store/slices/pagosSlice";

export const usePagos = () => {
  const dispatch = useAppDispatch();

  const { pagos, loading, error } = useAppSelector((state) => state.pagos);

  const refreshPagos = useCallback((year?: number, month?: number) => {
    dispatch(getPagos({ year, month }));
  }, [dispatch]);

  return {
    pagos,
    loading,
    error,
    refreshPagos,
  };
};
