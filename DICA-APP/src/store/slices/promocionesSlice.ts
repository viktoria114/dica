import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Promocion } from "../../types";
import {
  fetchPromociones,
  fetchPromocionesInvisibles,
  eliminarPromocion,
  restaurarPromocion,
  crearPromocion,
  actualizarPromocion,
  agregarItemPromocion,
  eliminarItemPromocion,
} from "../../api/promociones";

import type {
  CrearPromocionPayload,
  ActualizarPromocionPayload,
  AgregarItemPromocionPayload,
  EliminarItemPromocionPayload,
} from "../../api/promociones";

// 📦 Estado inicial
interface PromocionesState {
  promociones: Promocion[];
  promocionesInvisibles: Promocion[];
  loading: boolean;
  error: string | null;
  modoPapelera: boolean;
}

const initialState: PromocionesState = {
  promociones: [],
  promocionesInvisibles: [],
  loading: false,
  error: null,
  modoPapelera: false,
};

// 🔹 Obtener promociones visibles
export const getPromociones = createAsyncThunk(
  "promociones/getPromociones",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchPromociones();
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al obtener promociones");
    }
  }
);

// 🔹 Obtener promociones invisibles
export const getPromocionesInvisibles = createAsyncThunk(
  "promociones/getPromocionesInvisibles",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchPromocionesInvisibles();
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error desconocido al obtener promociones invisibles");
    }
  }
);

// 🔹 Crear promoción
export const createPromocion = createAsyncThunk(
  "promociones/createPromocion",
  async (payload: CrearPromocionPayload, { rejectWithValue }) => {
    try {
      const data = await crearPromocion(payload);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error al crear la promoción");
    }
  }
);

// 🔹 Actualizar promoción
export const updatePromocion = createAsyncThunk(
  "promociones/updatePromocion",
  async (
    { id, payload }: { id: number; payload: ActualizarPromocionPayload },
    { rejectWithValue }
  ) => {
    try {
      const data = await actualizarPromocion(id, payload);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error al actualizar la promoción");
    }
  }
);

// 🔹 Eliminar (soft delete)
export const deletePromocion = createAsyncThunk(
  "promociones/deletePromocion",
  async (id: number, { rejectWithValue }) => {
    try {
      await eliminarPromocion(id);
      return id;
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error al eliminar la promoción");
    }
  }
);

// 🔹 Restaurar promoción
export const restorePromocion = createAsyncThunk(
  "promociones/restorePromocion",
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await restaurarPromocion(id);
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error al restaurar la promoción");
    }
  }
);

// 🔹 Agregar item a promoción
export const addItemPromocion = createAsyncThunk(
  "promociones/addItemPromocion",
  async (
    { id, id_menu, cantidad }: { id: number; id_menu: number; cantidad: number },
    { rejectWithValue }
  ) => {
    try {
      const payload: AgregarItemPromocionPayload = { id_menu, cantidad };
      await agregarItemPromocion(id, payload);
      return { id, id_menu, cantidad };
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error al agregar item a la promoción");
    }
  }
);

// 🔹 Eliminar item de promoción
export const removeItemPromocion = createAsyncThunk(
  "promociones/removeItemPromocion",
  async (
    { id, id_menu, cantidad }: { id: number; id_menu: number; cantidad: number },
    { rejectWithValue }
  ) => {
    try {
      const payload: EliminarItemPromocionPayload = { id_menu, cantidad };
      await eliminarItemPromocion(id, payload);
      return { id, id_menu, cantidad };
    } catch (err: unknown) {
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Error al eliminar item de la promoción");
    }
  }
);

// 🧩 Slice principal
const promocionesSlice = createSlice({
  name: "promociones",
  initialState,
  reducers: {
    toggleModoPapelera: (state) => {
      state.modoPapelera = !state.modoPapelera;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Obtener promociones
      .addCase(getPromociones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPromociones.fulfilled, (state, action) => {
        state.loading = false;
        state.promociones = action.payload;
      })
      .addCase(getPromociones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Obtener invisibles
      .addCase(getPromocionesInvisibles.fulfilled, (state, action) => {
        state.promocionesInvisibles = action.payload;
      })

      // ✅ Crear promoción
      .addCase(createPromocion.fulfilled, (state, action) => {
        state.promociones.push(action.payload);
      })

      // ✅ Actualizar promoción
      .addCase(updatePromocion.fulfilled, (state, action) => {
        const index = state.promociones.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.promociones[index] = action.payload;
      })

      // ✅ Eliminar promoción
      .addCase(deletePromocion.fulfilled, (state, action) => {
        state.promociones = state.promociones.filter(
          (promo) => promo.id !== action.payload
        );
      })

      // ✅ Restaurar promoción
      .addCase(restorePromocion.fulfilled, (state, action) => {
        state.promociones.push(action.payload);
        state.promocionesInvisibles = state.promocionesInvisibles.filter(
          (promo) => promo.id !== action.payload.id
        );
      })

      // ✅ Agregar item a promoción
      .addCase(addItemPromocion.fulfilled, (state, action) => {
        const promo = state.promociones.find((p) => p.id === action.payload.id);
        if (promo) {
          promo.items.push({
            id_menu: action.payload.id_menu,
            cantidad: action.payload.cantidad,
          });
        }
      })

      // ✅ Eliminar item de promoción
      .addCase(removeItemPromocion.fulfilled, (state, action) => {
        const promo = state.promociones.find((p) => p.id === action.payload.id);
        if (promo) {
          promo.items = promo.items.filter(
            (item) => item.id_menu !== action.payload.id_menu
          );
        }
      });
  },
});

export const { toggleModoPapelera } = promocionesSlice.actions;
export default promocionesSlice.reducer;
