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

export const getPedidosBorrados = async (): Promise<Pedido[]> => {
  try {
    const res = await api.get<Pedido[]>(`${PEDIDOS_URL}/invisibles`);  
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Error al obtener la lista de pedidos borrados.";
      throw new Error(errorMessage);
    }
    throw err;
  }
};

export const crearPedido = async (pedido: Partial<Pedido>): Promise<Pedido> => {
  try {
    const res = await api.post<Pedido>(PEDIDOS_URL, pedido);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Error al crear el pedido.";
      throw new Error(errorMessage);
    }
    throw err;
  }
};

// Actualizar un pedido
export const actualizarPedido = async (
  id: number,
  pedido: Partial<Pedido>
): Promise<Pedido> => {
  try {
  const res = await api.put<Pedido>(`${PEDIDOS_URL}/${id}`, pedido);
  return res.data;
} catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Error al actualizar el pedido.";
      throw new Error(errorMessage);
    }
    throw err;
  } 
};