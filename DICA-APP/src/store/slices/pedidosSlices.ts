// src/store/slices/pedidosSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPedidos as fetchPedidosAPI } from "../../api/pedidos";
import type { Pedido } from "../../types";

export interface PedidosState {
  pedidos: Pedido[];
  loading: boolean;
  error: string | null;
}

const initialState: PedidosState = {
  pedidos: [],
  loading: false,
  error: null,
};

// 🔄 Thunk renombrado a getPedidos
export const getPedidos = createAsyncThunk(
  "pedidos/getPedidos",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchPedidosAPI();
      return data;
    } catch (err) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Error desconocido al obtener pedidos");
    }
  }
);

// 🧩 Slice
const pedidosSlice = createSlice({
  name: "pedidos",
  initialState,
  reducers: {
    limpiarPedidos: (state) => {
      state.pedidos = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

// 🧱 Exportaciones
export const { limpiarPedidos } = pedidosSlice.actions;
export default pedidosSlice.reducer;
