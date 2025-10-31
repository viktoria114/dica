import { useState, useEffect, useCallback } from 'react';
import type { Gasto } from '../../types';
import { fetchGastos } from '../../api/gastos';

export const useGastos = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshGastos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchGastos();
      const mappedData = data.map((g: any) => ({
        ...g,
        id: g.id,
        monto: parseFloat(g.monto),
        categoria: g.categoria,
        descripcion: g.descripcion,
        metodo_de_pago: g.metodo_pago,
        fecha: g.fk_fecha,
        fk_registro_stock: g.fk_registro_stock,
      }));
      setGastos(mappedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshGastos();
  }, [refreshGastos]);

  return { gastos, loading, error, refreshGastos };
};
