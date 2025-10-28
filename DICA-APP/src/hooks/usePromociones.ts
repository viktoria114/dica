import { useState, useEffect, useCallback } from "react";
import { fetchPromociones, fetchPromocionesInvisibles } from "../api/promociones";
import type { Promocion } from "../types";

export const usePromociones = () => {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modoPapelera, setModoPapelera] = useState(false);

  const cargarPromociones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPromociones();
      setPromociones(data);
    } catch (err) {
      setError("Error al cargar promociones" + {err});
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarPromocionesInvisibles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPromocionesInvisibles();
      setPromociones(data);
    } catch (err) {
      setError("Error al cargar promociones invisibles" + {err});
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleInvisibles = useCallback(() => {
    if (modoPapelera) {
      cargarPromociones();
    } else {
      cargarPromocionesInvisibles();
    }
    setModoPapelera((prev) => !prev);
  }, [modoPapelera, cargarPromociones, cargarPromocionesInvisibles]);

  useEffect(() => {
    cargarPromociones();
  }, [cargarPromociones]);

  return { promociones, loading, error, modoPapelera, toggleInvisibles };
};
