import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getEmpleados } from "../store/slices/empleadosSlice";
import { fetchEmpleadosInvisibles } from "../api/empleados";
import type { Empleado } from "../types";

export const useEmpleados = () => {
  const dispatch = useAppDispatch();

  // Estado global de Redux
  const { data: empleados, loading, error } = useAppSelector(
    (state) => state.empleados
  );

  // Estado local solo para UI
  const [empleadosInvisibles, setEmpleadosInvisibles] = useState<Empleado[]>([]);
  const [modoPapelera, setModoPapelera] = useState(false);

  // Cargar empleados visibles (usa thunk de Redux)
  const cargarEmpleados = useCallback(() => {
    dispatch(getEmpleados());
  }, [dispatch]);

  // Alternar empleados invisibles
  const toggleInvisibles = useCallback(async () => {
    try {
      if (!modoPapelera) {
        const data = await fetchEmpleadosInvisibles();
        setEmpleadosInvisibles(data);
        setModoPapelera(true);
      } else {
        setModoPapelera(false);
      }
    } catch (err) {
      console.error("Error al cargar empleados invisibles:", err);
    }
  }, [modoPapelera]);

  // Cargar empleados al montar
  useEffect(() => {
    cargarEmpleados();
  }, [cargarEmpleados]);

  // Determinar qué lista mostrar
  const empleadosFinal = modoPapelera ? empleadosInvisibles : empleados;

  return {
    empleados: empleadosFinal,
    modoPapelera,
    toggleInvisibles,
    loading,
    error,
    refetch: cargarEmpleados,
  };
};
