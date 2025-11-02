import axios from "axios";
import type { Pedido } from "../types";
import api from "./api";

const PEDIDOS_URL = import.meta.env.VITE_PEDIDOS;
const PROMOCIONES_URL = import.meta.env.VITE_PROMOCIONES;


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
  pedido: Partial<Pedido>,
  fk_empleado: number // <-- 1. Recíbelo como argumento
): Promise<Pedido> => {

  const payload = {
    // Campos que el backend requiere
    fk_empleado: fk_empleado, // <-- 3. Úsalo desde el argumento
    fk_cliente: pedido.id_cliente,
    fk_estado: pedido.fk_estado,
    fecha: pedido.fecha,
    hora: pedido.hora,
    ubicacion: pedido.ubicacion,
    observacion: pedido.observaciones, // Asumo que esto estaba bien
    items: pedido.items,
    promociones: pedido.promociones,
  };
console.log(payload);

  try {
  const res = await api.put<Pedido>(`${PEDIDOS_URL}/${id}`, payload);
  console.log(payload, res.data);
  
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

export const borrarPedido = async (id: number): Promise<void> => {
  try {
    await api.delete(`${PEDIDOS_URL}/${id}`);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Error al borrar el pedido.";
      throw new Error(errorMessage);
    }
 }
};

export const restaurarPedido = async (id: number): Promise<void> => {
  try {
    await api.put(`${PEDIDOS_URL}/restaurar/${id}`);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Error al restaurar el pedido.";
      throw new Error(errorMessage);
    }
 }
};

export interface ItemPedidoPayload {
  id_menu: number | string;
  cantidad: number;
  tel: string;
}

export interface PromocionPedidoPayload {
  promociones: { id_promocion: number; cantidad: number }[];
  tel: string;
}

// POST Agregar item al pedido
export const agregarItemPedido = async (
  id: number,
  payload: ItemPedidoPayload
): Promise<void> => {
  try {
    await api.post(`${PEDIDOS_URL}/item/${id}`, payload);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al agregar item al pedido"
      );
    }
    throw err;
  }
};

// DELETE Quitar item del pedido
export const eliminarItemPedido = async (
  id: number,
  payload: ItemPedidoPayload
): Promise<void> => {
  try {
    await api.delete(`${PEDIDOS_URL}/item/${id}`, { data: payload });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al eliminar item del pedido"
      );
    }
    throw err;
  }
};

// POST Agregar promoción al pedido
export const agregarPromocionPedido = async (
  id: number,
  payload: PromocionPedidoPayload
): Promise<void> => {
  try {
    await api.post(`${PROMOCIONES_URL}/${id}`, payload);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message ||
          "Error al agregar promoción al pedido"
      );
    }
    throw err;
  }
};

// DELETE Quitar promoción del pedido
export const eliminarPromocionPedido = async (
  id: number,
  payload: PromocionPedidoPayload
): Promise<void> => {
  try {
    await api.delete(`${PROMOCIONES_URL}/${id}`, { data: payload });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message ||
          "Error al eliminar promoción del pedido"
      );
    }
    throw err;
  }
};