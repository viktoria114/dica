import api from "./api";
import axios from "axios";

const AGENTE_URL = import.meta.env.VITE_AGENTE_URL;

export const getAgentStatus = async (): Promise<{ isActive: boolean }> => {
  try {
    const res = await api.get<{ isActive: boolean }>(`${AGENTE_URL}/status`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.message || "Error al obtener el estado del agente");
    }
    throw err;
  }
};

export const toggleActivity = async (): Promise<{ message: string }> => {
  try {
    const res = await api.post<{ message: string }>(`${AGENTE_URL}/toggle-activity`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.response?.data?.message || "Error al cambiar el estado del agente");
    }
    throw err;
  }
};
