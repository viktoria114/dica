import { configureStore } from "@reduxjs/toolkit";
import empleadosReducer from "./slices/empleadosSlice";
import clientesReducer from "./slices/clientesSlice";
import menuReducer from "./slices/menuSlice";
import promocionesReducer from "./slices/promocionesSlice";

export const store = configureStore({
  reducer: {
    empleados: empleadosReducer,
    clientes: clientesReducer,
    menu: menuReducer,
    Promociones: promocionesReducer,
  },
});

// Tipos del store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
