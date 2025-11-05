// src/api/stock.ts
import axios from "axios";
import api from "./api";
import type { Stock } from "../types";

const STOCK_URL = import.meta.env.VITE_STOCK;

// GET Stock
export const fetchStock = async (): Promise<Stock[]> => {
  try {
    const res = await api.get<Stock[]>(STOCK_URL);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.message || "Error al obtener Stock");
    }
    throw err;
  }
};

// GET Stock bajo (stock_actual < stock_minimo)
export const fetchValidateLowStock = async (): Promise<Stock[]> => {
  try {
    const res = await api.get<Stock[]>(`${STOCK_URL}/verificar`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al verificar stock bajo"
      );
    }
    throw err;
  }
};

//GET Registros vencidos
export const fetchVencidosStock = async (): Promise<Stock[]> => {
  try {
    const res = await api.get<Stock[]>(`${STOCK_URL}/vencidos`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al obtener registros vencidos"
      );
    }
    throw err;
  }
};

// GET Stock Invisible
export const fetchStockInvisible = async (): Promise<Stock[]> => {
  try {
    const res = await api.get<Stock[]>(`${STOCK_URL}/invisibles`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al obtener Stock Invisible"
      );
    }
    throw err;
  }
};

// POST Crear Stock
export const fetchCrearStock = async (data: Partial<Stock>): Promise<Stock> => {
  try {
    const res = await api.post<Stock>(STOCK_URL, data);
    console.log("Stock creado:", res.data);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const backendError =
        err.response?.data?.error || err.response?.data?.message;
      throw new Error(backendError || "Error al crear Stock");
    }
    throw err;
  }
};

// PUT Actualizar Stock
export const fetchActualizarStock = async (stock: Stock): Promise<Stock> => {
  try {
    const res = await api.put<Stock>(`${STOCK_URL}/${stock.id}`, stock);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const backendError =
        err.response?.data?.error || err.response?.data?.message;
      throw new Error(backendError || "Error al actualizar Stock");
    }
    throw err;
  }
};

// DELETE Stock (soft delete)
export const fetchBorrarStock = async (id: number): Promise<void> => {
  try {
    await api.delete(`${STOCK_URL}/${id}`);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.message || "Error al borrar Stock");
    }
    throw err;
  }
};

// PUT Restaurar Stock
export const fetchRestaurarStock = async (id: number): Promise<Stock> => {
  try {
    const res = await api.put<Stock>(`${STOCK_URL}/restaurar/${id}`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al restaurar Stock"
      );
    }
    throw err;
  }
};

// POST /vencidos
export const setVencimientoStock = async (): Promise<void> => {
  try {
    await api.post(`${STOCK_URL}/vencidos`);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al setear vencimiento de stock"
      );
    }
    throw err;
  }
};
