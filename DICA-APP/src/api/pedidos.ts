import axios from "axios";
import type { Pedido } from "../types";
import api from "./api";

const PEDIDOS_URL = import.meta.env.VITE_PEDIDOS;

export const getPedidos = async (): Promise<Pedido[]> => {
  try {
    const res = await api.get<Pedido[]>(PEDIDOS_URL);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Error al obtener la lista de pedidos.";
      throw new Error(errorMessage);
    }
    throw err;
  }
};