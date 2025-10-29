import axios from "axios";
import type { Stock } from "../types";
import api from "./api";

const STOCK_URL = import.meta.env.VITE_STOCK;

// GET Stock
export const fetchStock = async (): Promise<Stock[]> => {
  try {
    const res = await api.get<Stock[]>(STOCK_URL);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al obtener Stock"
      );
    }
    throw err;
  }
};
