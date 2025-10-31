import axios from "axios";
import type { Gasto } from "../types";
import api from "./api";

const GASTOS_URL = import.meta.env.VITE_GASTOS;

// GET Gastos
export const fetchGastos = async (): Promise<Gasto[]> => {
  try {
    const res = await api.get<Gasto[]>(GASTOS_URL);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al obtener Gastos"
      );
    }
    throw err;
  }
};

// POST Crear Gasto
export interface CrearGastoPayload {
  fk_stock?: number | null;
  monto: number;
  cantidad?: number;
  categoria: string;
  metodo_de_pago: string;
  descripcion: string;
  fecha: Date;
}

export const crearGasto = async (payload: CrearGastoPayload): Promise<Gasto> => {
  try {
    const res = await api.post<Gasto>(GASTOS_URL, payload);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al crear Gasto"
      );
    }
    throw err;
  }
};

// PUT Modificar Gasto
export interface ModificarGastoPayload extends CrearGastoPayload {}

export const modificarGasto = async (id: number, payload: ModificarGastoPayload): Promise<Gasto> => {
  try {
    const res = await api.put<Gasto>(`${GASTOS_URL}/${id}`, payload);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al modificar Gasto"
      );
    }
    throw err;
  }
};

// DELETE Gasto
export const eliminarGasto = async (id: number): Promise<void> => {
  try {
    await api.delete(`${GASTOS_URL}/${id}`);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al eliminar Gasto"
      );
    }
    throw err;
  }
};
