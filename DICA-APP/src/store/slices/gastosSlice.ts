import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { fetchGastos, crearGasto, modificarGasto, eliminarGasto } from "../../api/gastos";
import type { Gasto } from "../../types";

// 🧩 Estado inicial
interface GastosState {
  gastos: Gasto[];
  loading: boolean;
  error: string | null;
}

const initialState: GastosState = {
  gastos: [],
  loading: false,
  error: null,
};

// 🔁 Obtener todos los gastos
export const getGastos = createAsyncThunk("gastos/getGastos", async (_, { rejectWithValue }) => {
  try {
    const gastos = await fetchGastos();
    // @ts-ignore
    return gastos.map(g => ({
      ...g,
      fecha: g.fk_fecha,
      metodo_de_pago: g.metodo_pago
    }))
  } catch (err) {
    if (err instanceof Error) return rejectWithValue(err.message);
    return rejectWithValue("Error desconocido al obtener gastos");
  }
});

// ➕ Crear un nuevo gasto
export const crearGastos = createAsyncThunk(
  "gastos/crearGastos",
  async (payload: Parameters<typeof crearGasto>[0], { rejectWithValue }) => {
    try {
      return await crearGasto(payload);
    } catch (err) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al crear gasto");
    }
  }
);

// ✏️ Modificar un gasto existente
export const modificarGastos = createAsyncThunk(
  "gastos/modificarGastos",
  async ({ id, payload }: { id: number; payload: Parameters<typeof modificarGasto>[1] }, { rejectWithValue }) => {
    try {
      return await modificarGasto(id, payload);
    } catch (err) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al modificar gasto");
    }
  }
);

// ❌ Eliminar gasto
export const eliminarGastos = createAsyncThunk(
  "gastos/eliminarGastos",
  async (id: number, { rejectWithValue }) => {
    try {
      await eliminarGasto(id);
      return id;
    } catch (err) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al eliminar gasto");
    }
  }
);

// 🧠 Slice principal
const gastosSlice = createSlice({
  name: "gastos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // --- Obtener ---
    builder.addCase(getGastos.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getGastos.fulfilled, (state, action: PayloadAction<Gasto[]>) => {
      state.loading = false;
      state.gastos = action.payload;
    });
    builder.addCase(getGastos.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // --- Crear ---
    builder.addCase(crearGastos.fulfilled, (state, action: PayloadAction<Gasto>) => {
      state.gastos.push(action.payload);
    });

    // --- Modificar ---
    builder.addCase(modificarGastos.fulfilled, (state, action: PayloadAction<Gasto>) => {
      const index = state.gastos.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) state.gastos[index] = action.payload;
    });

    // --- Eliminar ---
    builder.addCase(eliminarGastos.fulfilled, (state, action: PayloadAction<number>) => {
      state.gastos = state.gastos.filter((g) => g.id !== action.payload);
    });
  },
});

export default gastosSlice.reducer;
