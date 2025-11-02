import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  getPromociones,
  getPromocionesInvisibles,
  toggleModoPapelera,
} from "../../store/slices/promocionesSlice";

export const usePromociones = () => {
  const dispatch = useAppDispatch();

  const { promociones, promocionesInvisibles, loading, error, modoPapelera } =
    useAppSelector((state) => state.promociones);

  // 🔁 Cargar promociones al montar
  useEffect(() => {
    dispatch(getPromociones());
  }, [dispatch]);

  // 🧩 Alternar entre visibles e invisibles
  const toggleInvisibles = async () => {
    if (!modoPapelera) {
      await dispatch(getPromocionesInvisibles());
    } else {
      await dispatch(getPromociones());
    }
    dispatch(toggleModoPapelera());
  };

  // 🔄 Refrescar según el modo actual (como antes)
  const refreshPromociones = async () => {
    if (modoPapelera) {
      await dispatch(getPromocionesInvisibles());
    } else {
      await dispatch(getPromociones());
    }
  };

  // 📦 Lista base según el modo actual
  const baseList = modoPapelera ? promocionesInvisibles : promociones;

  return {
    promociones: baseList,
    loading,
    error,
    modoPapelera,
    toggleInvisibles,
    refreshPromociones, // 👈 se mantiene igual que antes
  };
};
