import api from "./api"; // tu instancia de axios con interceptores
import type { Empleado } from "../types";
import axios from "axios";

const EMPLEADOS_URL = import.meta.env.VITE_EMPLEADOS;

// POST empleado
export const fetchCrearEmpleado = async (
  data: Partial<Empleado>
): Promise<Empleado[]> => {
  try {
    const res = await api.post<Empleado[]>(EMPLEADOS_URL, data);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.message || "Error al crear empleado");
    }
    throw err;
  }
};

// GET empleados
export const fetchEmpleados = async (): Promise<Empleado[]> => {
  try {
    const res = await api.get<Empleado[]>(EMPLEADOS_URL);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al obtener empleados"
      );
    }
    throw err;
  }
};

// GET empleados invisibles
export const fetchEmpleadosInvisibles = async (): Promise<Empleado[]> => {
  try {
    const res = await api.get<Empleado[]>(`${EMPLEADOS_URL}/invisibles`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al obtener empleados"
      );
    }
    throw err;
  }
};

// GET empleado by DNI
export const fetchEmpleadosbyDNI = async (
  dni: string
): Promise<{ mensaje: string; empleado: Empleado }> => {
  try {
    const res = await api.get<{ mensaje: string; empleado: Empleado }>(
      `${EMPLEADOS_URL}/dni/${dni}`
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al obtener empleado"
      );
    }
    throw err;
  }
};

// PUT empleado
export const fetchActualizarEmpleado = async (empleado: Empleado) => {
  try {
    const res = await api.put<Empleado>(
      `${EMPLEADOS_URL}/${empleado.dni}`,
      empleado
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al actualizar el empleado"
      );
    }
    throw err;
  }
};

// DELETE empleado
export const fetchBorrarEmpleado = async (dni: string) => {
  try {
    const res = await api.delete<{ mensaje: string }>(
      `${EMPLEADOS_URL}/${dni}`
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al borrar el empleado"
      );
    }
    throw err;
  }
};

// PUT restaurar empleado
export const fetchRestaurarEmpleado = async (dni: string) => {
  try {
    const res = await api.put<{ mensaje: string }>(
      `${EMPLEADOS_URL}/restaurar/${dni}`
    );
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al restaurar el empleado"
      );
    }
    throw err;
  }
};
