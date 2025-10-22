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
