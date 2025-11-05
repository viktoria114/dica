
import axios from "axios";
import api from "./api";

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD;

export interface DashboardData {
  pedidos_activos: number;
  pedidos_completados: number;
 pedidos_cancelados: number;
}

export const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    const res = await api.get<DashboardData>(DASHBOARD_URL);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al obtener los datos del dashboard"
      );
    }
    throw err;
  }
};
