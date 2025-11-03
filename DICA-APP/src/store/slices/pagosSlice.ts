// src/store/slices/pagosSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Pago } from "../../types";
import { fetchPagos, crearPago, modificarPago, eliminarPago } from "../../api/pagos";

// 🧱 Estado inicial
interface PagosState {
  pagos: Pago[];
  loading: boolean;
  error: string | null;
}

const initialState: PagosState = {
  pagos: [],
  loading: false,
  error: null,
};
// 📦 Thunks asíncronos
export const getPagos = createAsyncThunk(
  "pagos/getPagos",
  async (filters: { year?: number; month?: number } | undefined = {}, { rejectWithValue }) => {
    try {
      return await fetchPagos(filters.year, filters.month);
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al obtener los pagos");
    }
  }
);

export const crearPagos = createAsyncThunk(
  "pagos/crearPagos",
  async (payload: Partial<Pago>, { rejectWithValue }) => {
    try {
      return await crearPago(payload);
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al crear el pago");
    }
  }
);

export const modificarPagos = createAsyncThunk(
  "pagos/modificarPagos",
  async ({ id, payload }: { id: number; payload: Partial<Pago> }, { rejectWithValue }) => {
    try {
      return await modificarPago(id, payload);
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al modificar el pago");
    }
  }
);

export const eliminarPagos = createAsyncThunk(
  "pagos/eliminarPagos",
  async (id: number, { rejectWithValue }) => {
    try {
      await eliminarPago(id);
      return id;
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al eliminar el pago");
    }
  }
);

// 🧩 Slice principal
const pagosSlice = createSlice({
  name: "pagos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // 📥 GET pagos
    builder
      .addCase(getPagos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPagos.fulfilled, (state, action) => {
        state.loading = false;
        state.pagos = action.payload;
      })
      .addCase(getPagos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ➕ Crear pago
    builder
      .addCase(crearPagos.pending, (state) => {
        state.loading = true;
      })
      .addCase(crearPagos.fulfilled, (state, action) => {
        state.loading = false;
        state.pagos.push(action.payload);
      })
      .addCase(crearPagos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ✏️ Modificar pago
    builder
      .addCase(modificarPagos.pending, (state) => {
        state.loading = true;
      })
      .addCase(modificarPagos.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pagos.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.pagos[index] = action.payload;
        }
      })
      .addCase(modificarPagos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ❌ Eliminar pago
    builder
      .addCase(eliminarPagos.pending, (state) => {
        state.loading = true;
      })
      .addCase(eliminarPagos.fulfilled, (state, action) => {
        state.loading = false;
        state.pagos = state.pagos.filter((p) => p.id !== action.payload);
      })
      .addCase(eliminarPagos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default pagosSlice.reducer;
