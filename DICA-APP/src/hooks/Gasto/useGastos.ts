import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getGastos } from "../../store/slices/gastosSlice";

export const useGastos = () => {
  const dispatch = useAppDispatch();

  const { gastos, loading, error } = useAppSelector((state) => state.gastos);

  const refreshGastos = useCallback((year?: number, month?: number) => {
    dispatch(getGastos({ year, month }));
  }, [dispatch]);

  return {
    gastos,
    loading,
    error,
    refreshGastos,
  };
};
