<<<<<<< HEAD
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
=======
import { useCallback, useEffect, useState } from "react";
import type { Stock } from "../types";
import { fetchStock, fetchStockInvisible } from "../api/stock";

export const useStock = () => {
  const [stock, setStock] = useState<Stock[]>([]);
  const [stockInvisible, setStockInvisible] = useState<Stock[]>([]);
  const [modoPapelera, setModoPapelera] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarStock = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStock();
      setStock(data);
    } catch (error) {
      setError((error as Error).message || "Error al cargar el stock");
>>>>>>> 517d4d9b985a429742ee17b5419112e20f433dd4
    } finally {
      setLoading(false);
    }
  }, []);

<<<<<<< HEAD
  useEffect(() => {
    refreshStock();
  }, [refreshStock]);

  return { stock, loading, error, refreshStock };
=======
  const toggleInvisibles = useCallback(async () => {
    try {
      if (!modoPapelera) {
        const data = await fetchStockInvisible();
        setStockInvisible(data);
        setModoPapelera(true);
      } else {
        setModoPapelera(false);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, [modoPapelera]);

  useEffect(() => {
    cargarStock();
  }, [cargarStock]);

  const baseList = modoPapelera ? stockInvisible : stock;

  return {
    stock: baseList,
    modoPapelera,
    toggleInvisibles,
    loading,
    error,
    refetch: cargarStock,
  };
>>>>>>> 517d4d9b985a429742ee17b5419112e20f433dd4
};
