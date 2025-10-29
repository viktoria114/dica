import axios from "axios";
import type { Pago } from "../types";
import api from "./api";

const PAGOS_URL = import.meta.env.VITE_PAGOS;

// GET Pagos
export const fetchPagos = async (): Promise<Pago[]> => {
  try {
    const res = await api.get<Pago[]>(PAGOS_URL);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al obtener Pagos"
      );
    }
    throw err;
  }
};

// POST Crear Pago
export const crearPago = async (payload: Partial<Pago>): Promise<Pago> => {
  try {
    const res = await api.post<Pago>(PAGOS_URL, payload);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al crear Pago"
      );
    }
    throw err;
  }
};

// PUT Modificar Pago
export const modificarPago = async (id: number, payload: Partial<Pago>): Promise<Pago> => {
  try {
    const res = await api.put<Pago>(`${PAGOS_URL}/${id}`, payload);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al modificar Pago"
      );
    }
    throw err;
  }
};

// DELETE Pago
export const eliminarPago = async (id: number): Promise<void> => {
  try {
    await api.delete(`${PAGOS_URL}/${id}`);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al eliminar Pago"
      );
    }
    throw err;
  }
};
