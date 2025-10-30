import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Cliente } from "../../types";
import {
  fetchClientes,
  fetchCrearCliente,
  fetchActualizarCliente,
  fetchBorrarCliente,
  fetchRestaurarCliente,
  fetchClientesInvisibles,
} from "../../api/clientes";

// Estado inicial
interface ClientesState {
  data: Cliente[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientesState = {
  data: [],
  loading: false,
  error: null,
};

// ======== Thunks =========

// GET clientes visibles
export const getClientes = createAsyncThunk(
  "clientes/getClientes",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchClientes();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Error al obtener clientes");
    }
  }
);

// GET clientes invisibles (en papelera)
export const getClientesInvisibles = createAsyncThunk(
  "clientes/getClientesInvisibles",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchClientesInvisibles();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Error al obtener clientes invisibles");
    }
  }
);

// POST crear cliente
export const crearCliente = createAsyncThunk(
  "clientes/crearCliente",
  async (cliente: Partial<Cliente>, { rejectWithValue }) => {
    try {
      const data = await fetchCrearCliente(cliente);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Error al crear cliente");
    }
  }
);

// PUT actualizar cliente
export const actualizarCliente = createAsyncThunk(
  "clientes/actualizarCliente",
  async (cliente: Cliente, { rejectWithValue }) => {
    try {
      const data = await fetchActualizarCliente(cliente);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Error al actualizar cliente");
    }
  }
);

// DELETE cliente
export const borrarCliente = createAsyncThunk(
  "clientes/borrarCliente",
  async (dni: string, { rejectWithValue }) => {
    try {
      const res = await fetchBorrarCliente(dni);
      return res.mensaje;
    } catch (err: any) {
      return rejectWithValue(err.message || "Error al borrar cliente");
    }
  }
);

// PUT restaurar cliente
export const restaurarCliente = createAsyncThunk(
  "clientes/restaurarCliente",
  async (dni: string, { rejectWithValue }) => {
    try {
      const res = await fetchRestaurarCliente(dni);
      return res.mensaje;
    } catch (err: any) {
      return rejectWithValue(err.message || "Error al restaurar cliente");
    }
  }
);

// ======== Slice =========
const clientesSlice = createSlice({
  name: "clientes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GET clientes
    builder
      .addCase(getClientes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getClientes.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getClientes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // CREAR cliente
    builder
      .addCase(crearCliente.pending, (state) => {
        state.loading = true;
      })
      .addCase(crearCliente.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(crearCliente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ACTUALIZAR cliente
    builder
      .addCase(actualizarCliente.pending, (state) => {
        state.loading = true;
      })
      .addCase(actualizarCliente.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.data.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.data[idx] = action.payload;
      })
      .addCase(actualizarCliente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // BORRAR cliente
    builder
      .addCase(borrarCliente.pending, (state) => {
        state.loading = true;
      })
      .addCase(borrarCliente.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(borrarCliente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // RESTAURAR cliente
    builder
      .addCase(restaurarCliente.pending, (state) => {
        state.loading = true;
      })
      .addCase(restaurarCliente.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(restaurarCliente.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default clientesSlice.reducer;
