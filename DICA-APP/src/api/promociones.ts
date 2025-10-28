import axios from "axios";
import type { Promocion } from "../types";
import api from "./api";

const PROMOCIONES_URL = import.meta.env.VITE_PROMOCIONES;

// GET Promociones
export const fetchPromociones = async (): Promise<Promocion[]> => {
  try {
    const res = await api.get<Promocion[]>(PROMOCIONES_URL);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al obtener Promociones"
      );
    }
    throw err;
  }
};

// GET Promociones invisibles o borradas
export const fetchPromocionesInvisibles = async (): Promise<Promocion[]> => {
  try {
    const res = await api.get<Promocion[]>(`${PROMOCIONES_URL}/invisibles`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al obtener promociones invisibles"
      );
    }
    throw err;
  }
};


// ✅ DELETE (soft delete)
export const eliminarPromocion = async (id: number): Promise<void> => {
  try {
    await api.delete(`${PROMOCIONES_URL}/${id}`);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al eliminar la promoción"
      );
    }
    throw err;
  }
};

// ✅ POST restaurar
export const restaurarPromocion = async (id: number): Promise<Promocion> => {
  try {
    const res = await api.post<Promocion>(`${PROMOCIONES_URL}/restaurar/${id}`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al restaurar la promoción"
      );
    }
    throw err;
  }
};

// POST Crear Promoción
export interface CrearPromocionPayload {
  nombre: string;
  tipo: '2x1' | 'DESCUENTO' | 'MONTO_FIJO';
  precio: number;
  menus: { id_menu: number; cantidad: number }[];
}

export const crearPromocion = async (payload: CrearPromocionPayload): Promise<{ id: number; message: string }> => {
  try {
    const res = await api.post<{ id: number; message: string }>(
      `${PROMOCIONES_URL}`,
      payload
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al crear Promoción"
      );
    }
    throw err;
  }
};
