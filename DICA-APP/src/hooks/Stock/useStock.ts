import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  getStock,
  getStockInvisible,
  toggleModoPapelera,
} from "../../store/slices/stockSlice";

export const useStock = () => {
  const dispatch = useAppDispatch();

  const { stock, stockInvisibles, loading, error, modoPapelera } = useAppSelector(
    (state) => state.stock
  );

  // Carga inicial
  useEffect(() => {
    dispatch(getStock());
  }, [dispatch]);

  // Alternar entre visibles/invisibles
  const toggleInvisibles = useCallback(async () => {
    if (modoPapelera) {
      await dispatch(getStock()); // mostrar visibles
    } else {
      await dispatch(getStockInvisible()); // mostrar invisibles
    }
    dispatch(toggleModoPapelera());
  }, [dispatch, modoPapelera]);

  // Lista base según modo
  const baseList = modoPapelera ? stockInvisibles : stock;

  // Recargar según modo actual
  const refetch = useCallback(() => {
    if (modoPapelera) {
      dispatch(getStockInvisible());
    } else {
      dispatch(getStock());
    }
  }, [dispatch, modoPapelera]);

  return {
    stock: baseList,
    modoPapelera,
    toggleInvisibles,
    loading,
    error,
    refetch,
  };
};
