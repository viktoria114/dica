import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getPedidos as fetchPedidosAPI,
  getPedidosBorrados as fetchPedidosBorradosAPI,
  crearPedido as crearPedidoAPI,
  actualizarPedido as actualizarPedidoAPI,
  borrarPedido as borrarPedidoAPI,
  restaurarPedido as restaurarPedidoAPI,
  updatePedidoEstado as updatePedidoEstadoAPI,
  getTicketPedido as getTicketPedidoAPI,
} from "../../api/pedidos";
import type { Pedido } from "../../types";

// 🧩 Estado inicial
export interface PedidosState {
  pedidos: Pedido[];
  pedidosBorrados: Pedido[];
  loading: boolean;
  updatingEstado: boolean; //
  error: string | null;
}

const initialState: PedidosState = {
  pedidos: [],
  pedidosBorrados: [],
  loading: false,
  updatingEstado: false,
  error: null,
};

// 📦 Obtener todos los pedidos
export const getPedidos = createAsyncThunk(
  "pedidos/getPedidos",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchPedidosAPI();

      const pedidosBackend: Pedido[] = data.map((p: any) => {
        const rawDate = p.fecha;
        let normalizedFecha: string | null = null;

        if (rawDate) {
          const dateObj = rawDate instanceof Date ? rawDate : new Date(rawDate);
          if (!isNaN(dateObj.getTime())) {
            normalizedFecha = dateObj.toISOString();
          }
        }

        return {
          // --- IDs y Estado ---
          pedido_id: p.pedido_id ?? p.id ?? null,
          fk_estado: p.fk_estado ?? p.id_estado ?? 1,

          // --- Cliente y Ubicación ---
          id_cliente: p.id_cliente ?? null,
          ubicacion: p.ubicacion ?? "",

          // --- Fecha y Hora ---
          fecha: normalizedFecha,
          hora: p.hora ?? null,

          // --- Contenido ---
          items: p.items ?? [],
          promociones: p.promociones ?? [],

          // --- Precios ---
          precio_por_items: p.precio_por_items ?? 0,
          precio_por_promociones: p.precio_por_promociones ?? 0,
          precio_total: p.precio_total ?? 0,

          // --- Metadatos ---
          observaciones: p.observaciones ?? "",
          visibilidad: p.visibilidad ?? true,
        } as Pedido;
      });

      return pedidosBackend;
    } catch (err) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al obtener pedidos");
    }
  }
);

// 🗑️ Obtener pedidos borrados
export const getPedidosBorrados = createAsyncThunk(
  "pedidos/getPedidosBorrados",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchPedidosBorradosAPI();
      return data;
    } catch (err) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al obtener pedidos borrados");
    }
  }
);

// ➕ Crear nuevo pedido
export const crearPedido = createAsyncThunk(
  "pedidos/crearPedido",
  async (pedido: Partial<Pedido>, { rejectWithValue }) => {
    try {
      const data = await crearPedidoAPI(pedido);
      return data;
    } catch (err) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al crear el pedido");
    }
  }
);

// ✏️ Actualizar pedido existente
export const actualizarPedido = createAsyncThunk(
  "pedidos/actualizarPedido",
  async (
    {
      id,
      pedido,
      fk_empleado,
    }: { id: number; pedido: Partial<Pedido>; fk_empleado: number },
    { rejectWithValue }
  ) => {
    try {
      console.log("Actualizando pedido ACAAAAAA:", pedido);
      const data = await actualizarPedidoAPI(id, pedido, fk_empleado);
      return data;
    } catch (err) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al actualizar el pedido");
    }
  }
);

// ❌ Borrar pedido
export const borrarPedido = createAsyncThunk(
  "pedidos/borrarPedido",
  async (id: number, { rejectWithValue }) => {
    try {
      await borrarPedidoAPI(id);
      return id;
    } catch (err) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al borrar el pedido");
    }
  }
);

// 🔁 Restaurar pedido
export const restaurarPedido = createAsyncThunk(
  "pedidos/restaurarPedido",
  async (id: number, { rejectWithValue }) => {
    try {
      await restaurarPedidoAPI(id);
      return id;
    } catch (err) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al restaurar el pedido");
    }
  }
);

// 🔄 Actualizar estado del pedido
export const updatePedidoEstado = createAsyncThunk(
  "pedidos/updatePedidoEstado",
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await updatePedidoEstadoAPI(id);
      return data;
    } catch (err) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue(
        "Error desconocido al actualizar el estado del pedido"
      );
    }
  }
);

// 🧾 Obtener ticket del pedido
export const getTicketPedido = createAsyncThunk(
  "pedidos/getTicketPedido",
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await getTicketPedidoAPI(id);
      return data;
    } catch (err) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al obtener el ticket");
    }
  }
);

// 🧩 Slice principal
const pedidosSlice = createSlice({
  name: "pedidos",
  initialState,
  reducers: {
    limpiarPedidos: (state) => {
      state.pedidos = [];
      state.pedidosBorrados = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 Obtener pedidos
      .addCase(getPedidos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPedidos.fulfilled, (state, action) => {
        state.loading = false;
        state.pedidos = action.payload;
      })
      .addCase(getPedidos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔹 Pedidos borrados
      .addCase(getPedidosBorrados.fulfilled, (state, action) => {
        state.pedidosBorrados = action.payload;
      })

      // 🔹 Crear pedido
      .addCase(crearPedido.fulfilled, (state, action) => {
        state.pedidos.push(action.payload);
      })

      // 🔹 Actualizar pedido
      .addCase(actualizarPedido.fulfilled, (state, action) => {
        const index = state.pedidos.findIndex(
          (p) => p.pedido_id === action.payload.pedido_id
        );
        if (index !== -1) state.pedidos[index] = action.payload;
      })

      // 🔹 Borrar pedido
      .addCase(borrarPedido.fulfilled, (state, action) => {
        state.pedidos = state.pedidos.filter(
          (p) => p.pedido_id !== action.payload
        );
      })

      // 🔹 Restaurar pedido
      .addCase(restaurarPedido.fulfilled, (state, action) => {
        state.pedidosBorrados = state.pedidosBorrados.filter(
          (p) => p.pedido_id !== action.payload
        );
      })

      // 🔹 Actualizar estado
      .addCase(updatePedidoEstado.pending, (state) => {
        // ⬇️ Usamos el flag específico, NO el global 'loading'
        state.updatingEstado = false;
        state.error = null;
      })
      .addCase(updatePedidoEstado.fulfilled, (state, action) => {
        state.updatingEstado = false; // ⬅️ Lo desactivamos al terminar
        const index = state.pedidos.findIndex(
          (p) => p.pedido_id === action.payload.pedido_id
        );
        if (index !== -1) state.pedidos[index] = action.payload;
      })
      .addCase(updatePedidoEstado.rejected, (state, action) => {
        state.updatingEstado = false; // ⬅️ Lo desactivamos si falla
        state.error = action.payload as string;
      });
  },
});

// 🧱 Exportaciones
export const { limpiarPedidos } = pedidosSlice.actions;
export default pedidosSlice.reducer;
