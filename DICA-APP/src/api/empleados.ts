import type { Empleado } from "../types";

const API_URL = import.meta.env.VITE_API_URL;
const EMPLEADOS_URL = import.meta.env.VITE_EMPLEADOS;

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// POST empleados

export const fetchCrearEmpleado = async (data: Partial<Empleado>): Promise<Empleado[]> => {
  const res = await fetch(`${API_URL}${EMPLEADOS_URL}`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Error al crear empleado1111");
  }

  return res.json();
};


// GET empleados
export const fetchEmpleados = async (): Promise<Empleado[]> => {
  // 📌 FUTURO: migrar este fetch a Axios (ejemplo: axios.get(`${API_URL}${EMPLEADOS_URL}`, { headers: getAuthHeaders() }))
  const res = await fetch(`${API_URL}${EMPLEADOS_URL}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Error al obtener empleados");
  }

  return await res.json();
};

// GET empleados invisibles
export const fetchEmpleadosInvisibles = async (): Promise<Empleado[]> => {
  // 📌 FUTURO: migrar este fetch a Axios (ejemplo: axios.get(`${API_URL}${EMPLEADOS_URL}`, { headers: getAuthHeaders() }))
  const res = await fetch(`${API_URL}${EMPLEADOS_URL}/invisibles`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Error al obtener empleados");
  }

  return await res.json();
};

// PUT empleado
export const fetchActualizarEmpleado = async (empleado: Empleado) => {
  // 📌 FUTURO: cambiar a axios.put(...)
  const res = await fetch(`${API_URL}${EMPLEADOS_URL}/${empleado.dni}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(empleado),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Error al actualizar el empleado");
  }

  return await res.json();
};

// DELETE empleado
export const fetchBorrarEmpleado = async (dni: string) => {
  // 📌 FUTURO: cambiar a axios.delete(...)
  const res = await fetch(`${API_URL}${EMPLEADOS_URL}/${dni}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Error al borrar el empleado");
  }

  return await res.json();
};

export const fetchRestaurarEmpleado = async (dni: string) => {
  // 📌 FUTURO: cambiar a axios.put(...)
  const res = await fetch(`${API_URL}${EMPLEADOS_URL}/restaurar/${dni}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Error al restaurar el empleado");
  }

  return await res.json();
};
