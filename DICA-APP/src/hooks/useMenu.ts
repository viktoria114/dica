import { useState, useEffect, useCallback } from "react";
import { fetchMenus, fetchMenusInvisibles } from "../api/menu";
import type { ItemsMenu } from "../types";

export const useMenu = () => {
  const [menus, setMenus] = useState<ItemsMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modoPapelera, setModoPapelera] = useState(false);

  const cargarMenus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMenus();
      setMenus(data);
    } catch (err) {
      setError("Error al cargar menús" + {err});
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarMenusInvisibles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMenusInvisibles();
      setMenus(data);
    } catch (err) {
      setError("Error al cargar menús invisibles" + {err});
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleInvisibles = useCallback(() => {
    if (modoPapelera) {
      cargarMenus();
    } else {
      cargarMenusInvisibles();
    }
    setModoPapelera((prev) => !prev);
  }, [modoPapelera, cargarMenus, cargarMenusInvisibles]);

  useEffect(() => {
    cargarMenus();
  }, [cargarMenus]);

  return { menus, loading, error, modoPapelera, toggleInvisibles };
};
