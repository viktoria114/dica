import { configureStore } from "@reduxjs/toolkit";
import empleadosReducer from "./slices/empleadosSlice";
import clientesReducer from "./slices/clientesSlice";

export const store = configureStore({
  reducer: {
    empleados: empleadosReducer,
    clientes: clientesReducer,
  },
});

// Tipos del store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
