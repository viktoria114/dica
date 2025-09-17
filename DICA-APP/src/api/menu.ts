import axios from "axios";
import type { ItemsMenu } from "../types";
import api from "./api";

const MENU_URL = import.meta.env.VITE_MENU;

// GET Menús
export const fetchMenus = async (): Promise<ItemsMenu[]> => {
  try {
    const res = await api.get<ItemsMenu[]>(MENU_URL);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al obtener Menús"
      );
    }
    throw err;
  }
};

// GET Menús invisibles o borrados
export const fetchMenusInvisibles = async (): Promise<ItemsMenu[]> => {
  try {
    const res = await api.get<ItemsMenu[]>(`${MENU_URL}/invisibles`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al obtener menús invisibles"
      );
    }
    throw err;
  }
};


// ✅ DELETE (soft delete)
export const eliminarMenu = async (id: number): Promise<void> => {
  try {
    await api.delete(`${MENU_URL}/${id}`);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al eliminar el menú"
      );
    }
    throw err;
  }
};

// ✅ POST restaurar
export const restaurarMenu = async (id: number): Promise<ItemsMenu> => {
  try {
    const res = await api.post<ItemsMenu>(`${MENU_URL}/restaurar/${id}`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Error al restaurar el menú"
      );
    }
    throw err;
  }
};