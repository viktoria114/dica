// src/store/slices/menuSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ItemsMenu } from "../../types";
import {
  fetchMenus,
  fetchMenusInvisibles,
  eliminarMenu,
  restaurarMenu,
  crearMenu,
  type CrearMenuPayload,
} from "../../api/menu";

// 🧠 Estado inicial
interface MenuState {
  menus: ItemsMenu[];
  menusInvisibles: ItemsMenu[];
  loading: boolean;
  error: string | null;
  modoPapelera: boolean;
}

const initialState: MenuState = {
  menus: [],
  menusInvisibles: [],
  loading: false,
  error: null,
  modoPapelera: false,
};

//
// 🔄 Thunks asincrónicos
//

// Obtener todos los menús
export const getMenus = createAsyncThunk("menus/getMenus", async (_, thunkAPI) => {
  try {
    return await fetchMenus();
  } catch (error) {
    return thunkAPI.rejectWithValue((error as Error).message);
  }
});

// Obtener menús invisibles
export const getMenusInvisibles = createAsyncThunk(
  "menus/getMenusInvisibles",
  async (_, thunkAPI) => {
    try {
      return await fetchMenusInvisibles();
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

// Crear nuevo menú
export const crearMenuThunk = createAsyncThunk(
  "menus/crearMenu",
  async (payload: CrearMenuPayload, thunkAPI) => {
    try {
      return await crearMenu(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

// Eliminar (soft delete)
export const eliminarMenuThunk = createAsyncThunk(
  "menus/eliminarMenu",
  async (id: number, thunkAPI) => {
    try {
      await eliminarMenu(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

// Restaurar menú
export const restaurarMenuThunk = createAsyncThunk(
  "menus/restaurarMenu",
  async (id: number, thunkAPI) => {
    try {
      return await restaurarMenu(id);
    } catch (error) {
      return thunkAPI.rejectWithValue((error as Error).message);
    }
  }
);

//
// 🧱 Slice principal
//
const menuSlice = createSlice({
  name: "menus",
  initialState,
  reducers: {
    toggleModoPapelera: (state) => {
      state.modoPapelera = !state.modoPapelera;
    },
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 📦 Obtener menús
      .addCase(getMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMenus.fulfilled, (state, action: PayloadAction<ItemsMenu[]>) => {
        state.loading = false;
        state.menus = action.payload;
      })
      .addCase(getMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🕵️‍♀️ Menús invisibles
      .addCase(getMenusInvisibles.fulfilled, (state, action: PayloadAction<ItemsMenu[]>) => {
        state.menusInvisibles = action.payload;
      })

      // ➕ Crear menú
      .addCase(crearMenuThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(crearMenuThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // 🗑️ Eliminar menú
      .addCase(eliminarMenuThunk.fulfilled, (state, action: PayloadAction<number>) => {
        state.menus = state.menus.filter((menu) => menu.id !== action.payload);
      })

      // 🔁 Restaurar menú
      .addCase(restaurarMenuThunk.fulfilled, (state, action: PayloadAction<ItemsMenu>) => {
        // Lo quitamos de la lista de invisibles
        state.menusInvisibles = state.menusInvisibles.filter(
          (menu) => menu.id !== action.payload.id
        );
        // Lo agregamos a los visibles
        state.menus.push(action.payload);
      });
  },
});

export const { toggleModoPapelera, resetError } = menuSlice.actions;
export default menuSlice.reducer;
