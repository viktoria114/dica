// src/hooks/useMenus.ts
import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getMenus,
  getMenusInvisibles,
  toggleModoPapelera,
} from "../store/slices/menuSlice";

export const useMenu = () => {
  const dispatch = useAppDispatch();
  const { menus, menusInvisibles, loading, error, modoPapelera } = useAppSelector(
    (state) => state.menu
  );

  // 🔁 Cargar menús al montar el componente
  useEffect(() => {
    dispatch(getMenus());
  }, [dispatch]);

  // 🧩 Alternar entre menús visibles e invisibles
  const toggleInvisibles = useCallback(async () => {
    if (!modoPapelera) {
      await dispatch(getMenusInvisibles());
    } else {
      await dispatch(getMenus());
    }
    dispatch(toggleModoPapelera());
  }, [dispatch, modoPapelera]);

  // 📦 Determinar lista base según el modo actual
  const baseList = modoPapelera ? menusInvisibles : menus;

  // 🔄 Refetch manual (por ejemplo, después de crear/editar un menú)
  const refetch = useCallback(() => {
    dispatch(getMenus());
  }, [dispatch]);

  return {
    menus: baseList,
    modoPapelera,
    toggleInvisibles,
    loading,
    error,
    refetch,
  };
};
