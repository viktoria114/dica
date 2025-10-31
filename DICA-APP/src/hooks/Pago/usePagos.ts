import { useCallback, useEffect, useState } from "react";
import type { Pago } from "../../types";
import { fetchPagos } from "../../api/pagos";

export const usePagos = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPagos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPagos();
      setPagos(data);
    } catch (error) {
      setError((error as Error).message || "Error al cargar los pagos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPagos();
  }, [refreshPagos]);

  return {
    pagos,
    loading,
    error,
    refreshPagos,
  };
};
