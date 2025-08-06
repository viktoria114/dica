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

// GET empleados
export const fetchEmpleados = async (): Promise<Empleado[]> => {
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

// PUT empleado
export const fetchActualizarEmpleado = async (empleado: Empleado) => {
  const res = await fetch(`${API_URL}${EMPLEADOS_URL}/${empleado.dni}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(empleado),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Error al actualizar el empleado");
  }

  return await res.json(); // { message: "Registro actualizado" }
};

// DELETE empleado
export const fetchBorrarEmpleado = async (dni: string) => {
  const res = await fetch(`${API_URL}${EMPLEADOS_URL}/${dni}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Error al borrar el empleado");
  }

  return await res.json(); // { message: "Empleado eliminado" }
};
