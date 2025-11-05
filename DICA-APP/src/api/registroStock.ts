// src/api/registroStock.ts
import axios from "axios";
import api from "./api";

const STOCK_URL = import.meta.env.VITE_STOCK;

export interface RegistroStock {
  id: number | null;
  cantidad_inicial: number;
  cantidad_actual: number;
  fk_stock: number;
  estado: string;
  fk_fecha: Date | string;
  visibilidad: boolean;
}

// GET Registros de un Stock específico
export const fetchRegistrosStock = async (
  stockId: number
): Promise<RegistroStock[]> => {
  try {
    const res = await api.get<RegistroStock[]>(
      `${STOCK_URL}/registro/${stockId}`
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.mensaje || "Error al obtener registros de stock"
      );
    }
    throw err;
  }
};

// POST Crear Registro de Stock
export const fetchCrearRegistroStock = async (payload: {
  cantidad: number;
  fk_stock: number;
}): Promise<{ mensaje: string; registro: RegistroStock }> => {
  try {
    const res = await api.post<{ mensaje: string; registro: RegistroStock }>(
      `${STOCK_URL}/registro`,
      payload
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al crear registro de stock"
      );
    }
    throw err;
  }
};

// PUT Actualizar Registro de Stock
export const fetchActualizarRegistroStock = async (
  id: number,
  payload: {
    cantidad_inicial: number;
    cantidad_actual: number;
    fk_stock: number;
    estado: string;
  }
): Promise<{ mensaje: string; registro: RegistroStock }> => {
  try {
    const res = await api.put<{ mensaje: string; registro: RegistroStock }>(
      `${STOCK_URL}/registro/${id}`,
      payload
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al actualizar registro de stock"
      );
    }
    throw err;
  }
};

// DELETE Registro de Stock
export const fetchEliminarRegistroStock = async (
  id: number
): Promise<{ mensaje: string }> => {
  try {
    const res = await api.delete<{ mensaje: string }>(
      `${STOCK_URL}/registro/${id}`
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al eliminar registro de stock"
      );
    }
    throw err;
  }
};
