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
    const res = await api.put<Promocion>(`${PROMOCIONES_URL}/restaurar/${id}`);
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
  tipo: 'DESCUENTO' | 'MONTO_FIJO';
  precio: number;
  visibilidad: boolean;
  items: { id_menu: number; cantidad: number }[];
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

// PUT Actualizar Promoción
export interface ActualizarPromocionPayload {
  nombre: string;
  tipo: 'DESCUENTO' | 'MONTO_FIJO';
  precio: number;
  visibilidad: boolean;
  items: { id: number; cantidad: number }[];
}

export const actualizarPromocion = async (id: number, payload: ActualizarPromocionPayload): Promise<Promocion> => {
  try {
    const res = await api.put<Promocion>(`${PROMOCIONES_URL}/${id}`, payload);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al actualizar la promoción"
      );
    }
    throw err;
  }
};

// POST Agregar item a la promoción
export interface AgregarItemPromocionPayload {
  id_menu: number;
  cantidad: number;
}

export const agregarItemPromocion = async (id: number, payload: AgregarItemPromocionPayload): Promise<void> => {
  try {
    await api.post(`${PROMOCIONES_URL}/item/${id}`, payload);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al agregar item a la promoción"
      );
    }
    throw err;
  }
};

// DELETE Eliminar item de la promoción
export interface EliminarItemPromocionPayload {
  id_menu: number;
  cantidad: number;
}

export const eliminarItemPromocion = async (id: number, payload: EliminarItemPromocionPayload): Promise<void> => {
  try {
    await api.delete(`${PROMOCIONES_URL}/item/${id}`, { data: payload });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al eliminar item de la promoción"
      );
    }
    throw err;
  }
};
