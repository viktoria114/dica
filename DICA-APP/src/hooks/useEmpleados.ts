import { useEffect, useState, useCallback } from "react";
import type { Empleado } from "../types";
import { fetchEmpleados, fetchEmpleadosInvisibles } from "../api/empleados";

export const useEmpleados = () => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [empleadosInvisibles, setEmpleadosInvisibles] = useState<Empleado[]>([]);
  const [modoPapelera, setModoPapelera] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarEmpleados = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEmpleados();
      setEmpleados(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

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
      setError((err as Error).message);
    }
  }, [modoPapelera]);

  useEffect(() => {
    cargarEmpleados();
  }, [cargarEmpleados]);

  const baseList = modoPapelera ? empleadosInvisibles : empleados;

  return {
    empleados: baseList,
    modoPapelera,
    toggleInvisibles,
    loading,
    error,
    refetch: cargarEmpleados,
  };
};
