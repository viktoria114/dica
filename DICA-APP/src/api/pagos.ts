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

export async function obtenerLinkTemporalDropbox(
  pathArchivo: string,
  accessToken: string
): Promise<string | null> {
  const endpoint = "https://api.dropboxapi.com/2/files/get_temporary_link";

  try {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: pathArchivo }),
    });

    if (!resp.ok) {
      console.error("Error al obtener link temporal:", await resp.text());
      return null;
    }

    const data = await resp.json();
    return data.link || null;
  } catch (err) {
    console.error("Error en fetch de link temporal:", err);
    return null;
  }
}
