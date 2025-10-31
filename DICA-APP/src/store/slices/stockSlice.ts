import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Stock } from "../../types";
import {
  fetchStock,
  fetchStockInvisible,
  fetchCrearStock,
  fetchActualizarStock,
  fetchBorrarStock,
  fetchRestaurarStock,
} from "../../api/stock";

// 🧩 Estado inicial
interface StockState {
  stock: Stock[];
  stockInvisibles: Stock[];
  loading: boolean;
  error: string | null;
  modoPapelera: boolean;
}

const initialState: StockState = {
  stock: [],
  stockInvisibles: [],
  loading: false,
  error: null,
  modoPapelera: false,
};

// 🔹 Obtener stock visible
export const getStock = createAsyncThunk(
  "stock/getStock",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchStock();
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al obtener el stock");
    }
  }
);

// 🔹 Obtener stock invisible
export const getStockInvisible = createAsyncThunk(
  "stock/getStockInvisible",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchStockInvisible();
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al obtener el stock invisible");
    }
  }
);

// 🔹 Crear stock
export const crearStock = createAsyncThunk(
  "stock/crearStock",
  async (data: Partial<Stock>, { rejectWithValue }) => {
    try {
      return await fetchCrearStock(data);
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error al crear el stock");
    }
  }
);

// 🔹 Actualizar stock
export const actualizarStock = createAsyncThunk(
  "stock/actualizarStock",
  async (data: Stock, { rejectWithValue }) => {
    try {
      return await fetchActualizarStock(data);
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error al actualizar el stock");
    }
  }
);

// 🔹 Eliminar (soft delete)
export const borrarStock = createAsyncThunk(
  "stock/borrarStock",
  async (id: number, { rejectWithValue }) => {
    try {
      await fetchBorrarStock(id);
      return id;
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error al eliminar el stock");
    }
  }
);

// 🔹 Restaurar stock
export const restaurarStock = createAsyncThunk(
  "stock/restaurarStock",
  async (id: number, { rejectWithValue }) => {
    try {
      return await fetchRestaurarStock(id);
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error al restaurar el stock");
    }
  }
);

// 🧱 Slice principal
const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    toggleModoPapelera: (state) => {
      state.modoPapelera = !state.modoPapelera;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Obtener stock visible
      .addCase(getStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStock.fulfilled, (state, action) => {
        state.loading = false;
        state.stock = action.payload;
      })
      .addCase(getStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Obtener stock invisible
      .addCase(getStockInvisible.fulfilled, (state, action) => {
        state.stockInvisibles = action.payload;
      })

      // ✅ Crear stock
      .addCase(crearStock.fulfilled, (state, action) => {
        state.stock.push(action.payload);
      })

      // ✅ Actualizar stock
      .addCase(actualizarStock.fulfilled, (state, action) => {
        const index = state.stock.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.stock[index] = action.payload;
      })

      // ✅ Eliminar stock
      .addCase(borrarStock.fulfilled, (state, action) => {
        state.stock = state.stock.filter((s) => s.id !== action.payload);
      })

      // ✅ Restaurar stock
      .addCase(restaurarStock.fulfilled, (state, action) => {
        state.stock.push(action.payload);
        state.stockInvisibles = state.stockInvisibles.filter(
          (s) => s.id !== action.payload.id
        );
      });
  },
});

export const { toggleModoPapelera } = stockSlice.actions;
export default stockSlice.reducer;
