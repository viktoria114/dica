import { useEffect, useState, useCallback } from "react";
import type { Cliente } from "../types";
import { fetchClientes, fetchClientesInvisibles } from "../api/clientes";

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesInvisibles, setClientesInvisibles] = useState<Cliente[]>([]);
  const [modoPapelera, setModoPapelera] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClientes();
      setClientes(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleInvisibles = useCallback(async () => {
    try {
      if (!modoPapelera) {
        const data = await fetchClientesInvisibles();
        setClientesInvisibles(data);
        setModoPapelera(true);
      } else {
        setModoPapelera(false);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, [modoPapelera]);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  const baseList = modoPapelera ? clientesInvisibles : clientes;

  return {
    clientes: baseList,
    modoPapelera,
    toggleInvisibles,
    loading,
    error,
    refetch: cargarClientes,
  };
};
