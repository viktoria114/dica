import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Empleado } from "../../types/index.ts";
import {
  fetchEmpleados,
  fetchCrearEmpleado,
  fetchActualizarEmpleado,
  fetchEmpleadosInvisibles,
  fetchBorrarEmpleado,
  fetchRestaurarEmpleado,
} from "../../api/empleados";

// Estado inicial
interface EmpleadosState {
  data: Empleado[];
  loading: boolean;
  error: string | null;
}

const initialState: EmpleadosState = {
  data: [],
  loading: false,
  error: null,
};

// Thunks (acciones asíncronas)
export const getEmpleados = createAsyncThunk(
  "empleados/getEmpleados",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchEmpleados();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const crearEmpleado = createAsyncThunk(
  "empleados/crearEmpleado",
  async (empleado: Partial<Empleado>, { rejectWithValue }) => {
    try {
      const data = await fetchCrearEmpleado(empleado);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const actualizarEmpleado = createAsyncThunk(
  "empleados/actualizarEmpleado",
  async (empleado: Empleado, { rejectWithValue }) => {
    try {
      const data = await fetchActualizarEmpleado(empleado);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener empleados invisibles
export const getEmpleadosInvisibles = createAsyncThunk(
  "empleados/getEmpleadosInvisibles",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchEmpleadosInvisibles();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Borrar empleado
export const borrarEmpleado = createAsyncThunk(
  "empleados/borrarEmpleado",
  async (dni: string, { rejectWithValue }) => {
    try {
      const data = await fetchBorrarEmpleado(dni);
      return { dni, mensaje: data.mensaje };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Restaurar empleado
export const restaurarEmpleado = createAsyncThunk(
  "empleados/restaurarEmpleado",
  async (dni: string, { rejectWithValue }) => {
    try {
      const data = await fetchRestaurarEmpleado(dni);
      return { dni, mensaje: data.mensaje };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


// Slice
const empleadosSlice = createSlice({
  name: "empleados",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // getEmpleados
    builder
      .addCase(getEmpleados.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEmpleados.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getEmpleados.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // crearEmpleado
    builder
      .addCase(crearEmpleado.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(crearEmpleado.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(crearEmpleado.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(actualizarEmpleado.pending, (state) => {
        state.loading = true;
      })
      .addCase(actualizarEmpleado.fulfilled, (state, action) => {
        state.loading = false;
        // reemplazamos el empleado modificado
        const idx = state.data.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) {
          state.data[idx] = action.payload;
        }
      })
      .addCase(actualizarEmpleado.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // getEmpleadosInvisibles
    builder
      .addCase(getEmpleadosInvisibles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEmpleadosInvisibles.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // reemplaza la lista con invisibles
      })
      .addCase(getEmpleadosInvisibles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // borrarEmpleado
    builder
      .addCase(borrarEmpleado.fulfilled, (state, action) => {
        state.data = state.data.filter(
          (e) => e.dni !== action.payload.dni
        );
      })
      .addCase(borrarEmpleado.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // restaurarEmpleado
    builder
      .addCase(restaurarEmpleado.fulfilled, (state, action) => {
        // opcional: podrías volver a agregar el empleado si lo devuelve el backend
        console.log(action.payload.mensaje);
      })
      .addCase(restaurarEmpleado.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default empleadosSlice.reducer;
