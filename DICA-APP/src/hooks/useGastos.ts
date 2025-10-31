// src/hooks/useGastos.ts
import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getGastos } from "../store/slices/gastosSlice";

export const useGastos = () => {
  const dispatch = useAppDispatch();

  // 🎯 Traemos el estado desde Redux
  const { gastos, loading, error } = useAppSelector((state) => state.gastos);

  // 🔁 Cargar los gastos al montar el componente
  useEffect(() => {
    dispatch(getGastos());
  }, [dispatch]);

  // 🔄 Permite refrescar manualmente los gastos (por ejemplo tras crear o borrar)
  const refreshGastos = useCallback(() => {
    dispatch(getGastos());
  }, [dispatch]);

  return {
    gastos,
    loading,
    error,
    refreshGastos,
  };
};
