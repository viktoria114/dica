import { configureStore } from "@reduxjs/toolkit";
import empleadosReducer from "./slices/empleadosSlice";

export const store = configureStore({
  reducer: {
    empleados: empleadosReducer,
  },
});

// Tipos del store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
