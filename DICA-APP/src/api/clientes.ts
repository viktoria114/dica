import api from "./api"; // tu instancia de axios con interceptores
import type { Cliente } from "../types";
import axios from "axios";

const CLIENTES_URL = import.meta.env.VITE_CLIENTES;

// POST Cliente
export const fetchCrearCliente = async (
  data: Partial<Cliente>
): Promise<Cliente[]> => {
  try {
    const res = await api.post<Cliente[]>(CLIENTES_URL, data);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.message || "Error al crear Cliente");
    }
    throw err;
  }
};

// GET Clientes
export const fetchClientes = async (): Promise<Cliente[]> => {
  try {
    const res = await api.get<Cliente[]>(CLIENTES_URL);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al obtener Clientes"
      );
    }
    throw err;
  }
};

// GET Clientes invisibles
export const fetchClientesInvisibles = async (): Promise<Cliente[]> => {
  try {
    const res = await api.get<Cliente[]>(`${CLIENTES_URL}/invisibles`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al obtener clientes"
      );
    }
    throw err;
  }
};

// GET empleado by tel
export const fetchClientebyTel = async (
  tel: string
): Promise<{ mensaje: string; cliente: Cliente }> => {
  try {
    const res = await api.get<{ mensaje: string; cliente: Cliente }>(
      `${CLIENTES_URL}/${tel}`
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al obtener cliente"
      );
    }
    throw err;
  }
};

// PUT Cliente
export const fetchActualizarCliente = async (cliente: Cliente) => {
  try {
    const res = await api.put<Cliente>(
      `${CLIENTES_URL}/${cliente.telefono}`,
      cliente
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al actualizar el Cliente"
      );
    }
    throw err;
  }
};

// DELETE Cliente
export const fetchBorrarCliente = async (tel: string) => {
  try {
    const res = await api.delete<{ mensaje: string }>(
      `${CLIENTES_URL}/${tel}`
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al borrar el Cliente"
      );
    }
    throw err;
  }
};

// PUT restaurar Cliente
export const fetchRestaurarCliente = async (tel: string) => {
  try {
    const res = await api.put<{ mensaje: string }>(
      `${CLIENTES_URL}/restaurar/${tel}`
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al restaurar el Cliente"
      );
    }
    throw err;
  }
};
