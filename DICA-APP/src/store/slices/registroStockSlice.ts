import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchRegistrosStock,
  fetchCrearRegistroStock,
  fetchActualizarRegistroStock,
  fetchEliminarRegistroStock,
  type RegistroStock,
} from "../../api/registroStock";

// 🧩 Estado inicial
interface RegistroStockState {
  registros: RegistroStock[];
  loading: boolean;
  error: string | null;
  mensaje: string | null;
}

const initialState: RegistroStockState = {
  registros: [],
  loading: false,
  error: null,
  mensaje: null,
};

// ================================
// 🔹 AsyncThunks
// ================================

// Obtener registros por id de stock
export const getRegistrosStock = createAsyncThunk(
  "registroStock/getRegistrosStock",
  async (stockId: number, { rejectWithValue }) => {
    try {
      const data = await fetchRegistrosStock(stockId);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al obtener registros de stock");
    }
  }
);

// Crear nuevo registro de stock
export const crearRegistroStock = createAsyncThunk(
  "registroStock/crearRegistroStock",
  async (
    payload: { cantidad: number; fk_stock: number },
    { rejectWithValue }
  ) => {
    try {
      const data = await fetchCrearRegistroStock(payload);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al crear registro de stock");
    }
  }
);

// Actualizar registro de stock
export const actualizarRegistroStock = createAsyncThunk(
  "registroStock/actualizarRegistroStock",
  async (
    {
      id,
      payload,
    }: {
      id: number;
      payload: {
        cantidad_inicial: number;
        cantidad_actual: number;
        fk_stock: number;
        estado: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const data = await fetchActualizarRegistroStock(id, payload);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al actualizar registro de stock");
    }
  }
);

// Eliminar registro de stock
export const eliminarRegistroStock = createAsyncThunk(
  "registroStock/eliminarRegistroStock",
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await fetchEliminarRegistroStock(id);
      return { ...data, id };
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al eliminar registro de stock");
    }
  }
);

// ================================
// 🔹 Slice
// ================================
const registroStockSlice = createSlice({
  name: "registroStock",
  initialState,
  reducers: {
    clearMensaje: (state) => {
      state.mensaje = null;
    },
    clearError: (state) => {
      state.error = null;
    },

    // 🧹 Nuevo reducer para limpiar los registros
    limpiarRegistrosStock: (state) => {
      state.registros = [];
    },
  },
  extraReducers: (builder) => {
    // GET
    builder
      .addCase(getRegistrosStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRegistrosStock.fulfilled, (state, action) => {
        state.loading = false;
        state.registros = action.payload; // ✅ reemplaza, no concatena
      })
      .addCase(getRegistrosStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // POST
    builder
      .addCase(crearRegistroStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(crearRegistroStock.fulfilled, (state, action) => {
        state.loading = false;
        state.mensaje = action.payload.mensaje;
        state.registros.push(action.payload.registro);
      })
      .addCase(crearRegistroStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // PUT
    builder
      .addCase(actualizarRegistroStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(actualizarRegistroStock.fulfilled, (state, action) => {
        state.loading = false;
        state.mensaje = action.payload.mensaje;
        const index = state.registros.findIndex(
          (r) => r.id === action.payload.registro.id
        );
        if (index !== -1) {
          state.registros[index] = action.payload.registro;
        }
      })
      .addCase(actualizarRegistroStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // DELETE
    builder
      .addCase(eliminarRegistroStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(eliminarRegistroStock.fulfilled, (state, action) => {
        state.loading = false;
        state.mensaje = action.payload.mensaje;
        state.registros = state.registros.filter(
          (r) => r.id !== action.payload.id
        );
      })
      .addCase(eliminarRegistroStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ✅ exportá el nuevo reducer
export const { clearMensaje, clearError, limpiarRegistrosStock } = registroStockSlice.actions;
export default registroStockSlice.reducer;

