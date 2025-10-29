import { useState, useEffect, useCallback } from 'react';
import type { Stock } from '../types';
import { fetchStock } from '../api/stock';

export const useStock = () => {
  const [stock, setStock] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStock = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchStock();
      setStock(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStock();
  }, [refreshStock]);

  return { stock, loading, error, refreshStock };
};
