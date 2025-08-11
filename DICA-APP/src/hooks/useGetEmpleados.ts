import { useEffect, useState } from "react";
import type { Empleado } from "../types";
import { fetchEmpleados } from "../api/empleados";

export const useGetEmpleados = () => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarEmpleados = async () => {
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
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  // 📌 FUTURO: podrías integrar React Query o SWR para manejo de datos y cache
  return { empleados, loading, error, refetchEmpleados: cargarEmpleados };
};
