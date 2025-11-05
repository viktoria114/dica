import axios from "axios";
import type { ItemsYPromociones, Pedido } from "../types";
import api from "./api";

const PEDIDOS_URL = import.meta.env.VITE_PEDIDOS;

export const getPedidos = async (): Promise<Pedido[]> => {
  try {
    const res = await api.get<Pedido[]>(PEDIDOS_URL);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Error al obtener la lista de pedidos.";
      throw new Error(errorMessage);
    }
    throw err;
  }
};

export const getPedidosBorrados = async (): Promise<Pedido[]> => {
  try {
    const res = await api.get<Pedido[]>(`${PEDIDOS_URL}/invisibles`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message ||
        "Error al obtener la lista de pedidos borrados.";
      throw new Error(errorMessage);
    }
    throw err;
  }
};

export const crearPedido = async (pedido: Partial<Pedido>): Promise<Pedido> => {
  try {
    const res = await api.post<Pedido>(PEDIDOS_URL, pedido);
    console.log(pedido);
    
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Error al crear el pedido.";
      throw new Error(errorMessage);
    }
    throw err;
  }
};

// Actualizar un pedido
export const actualizarPedido = async (
  id: number,
  pedido: Partial<Pedido>, // Este objeto contiene `items` y `promociones` con claves de frontend (ej: id, subtotal)
  fk_empleado: number
): Promise<Pedido> => {
  // --- 1. NORMALIZACIÓN DE ITEMS PARA EL BACKEND ---
  const limpiarItems = (items: ItemsYPromociones[] | undefined) => {
    if (!items) return [];

    return items.map((item) => ({
      // ✅ Campos esperados por el backend (vienen de ItemsYPromociones)
      nombre: item.nombre,
      cantidad: item.cantidad,
      id_menu: item.id_menu,
      id_promocion: item.id_promocion,
      precio_unitario: item.precio_unitario, // ¡CLAVE! El precio que el backend espera
      subtotal: item.subtotal,
    }));
  };

  const payload = {
    // Campos simples
    fk_empleado: fk_empleado,
    id_cliente: pedido.id_cliente, 
    fk_estado: pedido.fk_estado,
    fecha: pedido.fecha,
    hora: pedido.hora,
    ubicacion: pedido.ubicacion,
    observacion: pedido.observaciones, 

    // ✅ 2. ITEMS Y PROMOCIONES LIMPIOS
    items: limpiarItems(pedido.items),
    promociones: limpiarItems(pedido.promociones),

    // ❌ IMPORTANTE: El backend DEBE calcular el precio total basado en los items/promos
    // Generalmente, no se envían precio_por_items, etc., al actualizar, solo se reciben.
    // Si tu backend lo requiere, inclúyelos (pero no es común).
  };

  try {
    const res = await api.put<Pedido>(`${PEDIDOS_URL}/${id}`, payload);
    console.log(payload, res.data);

    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Error al actualizar el pedido.";
      throw new Error(errorMessage);
    }
    throw err;
  }
};

export const borrarPedido = async (id: number): Promise<void> => {
  try {
    await api.delete(`${PEDIDOS_URL}/${id}`);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Error al borrar el pedido.";
      throw new Error(errorMessage);
    }
  }
};

export const restaurarPedido = async (id: number): Promise<void> => {
  try {
    await api.put(`${PEDIDOS_URL}/restaurar/${id}`);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Error al restaurar el pedido.";
      throw new Error(errorMessage);
    }
  }
};

export const updatePedidoEstado = async (id: number): Promise<Pedido> => {
  try {
    const res = await api.put<Pedido>(`${PEDIDOS_URL}/estado/${id}`); 
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Error al actualizar el estado del pedido.";
      throw new Error(errorMessage);
    }
    throw err;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getTicketPedido = async (id: number): Promise<any> => {
  try {
    const res = await api.get(`${PEDIDOS_URL}/ticket/${id}`, {
      responseType: 'blob',
    });
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Error al obtener el ticket del pedido.";
      throw new Error(errorMessage);
       }

    throw err;

  }

};
