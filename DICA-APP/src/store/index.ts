import { configureStore } from "@reduxjs/toolkit";
import empleadosReducer from "./slices/empleadosSlice";
import clientesReducer from "./slices/clientesSlice";
import menuReducer from "./slices/menuSlice";
import promocionesReducer from "./slices/promocionesSlice";
import stockReducer from "./slices/stockSlice";
import pagosReducer from "./slices/pagosSlice";
import gastosReducer from "./slices/gastosSlice";
import pedidosReducer from "./slices/pedidosSlices";
import registroStockReducer from "./slices/registroStockSlice";

export const store = configureStore({
  reducer: {
    empleados: empleadosReducer,
    clientes: clientesReducer,
    menu: menuReducer,
    promociones: promocionesReducer,
    stock: stockReducer,
    registroStock: registroStockReducer,
    pagos: pagosReducer,
    gastos: gastosReducer,
    pedidos: pedidosReducer,
  },
});

// Tipos del store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
