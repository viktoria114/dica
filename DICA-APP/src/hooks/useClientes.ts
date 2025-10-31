import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getClientes,
  getClientesInvisibles,
} from "../store/slices/clientesSlice";
import type { Cliente } from "../types";

export const useClientes = () => {
  const dispatch = useAppDispatch();

  // Estado global (Redux)
  const { data: clientes, loading, error } = useAppSelector(
    (state) => state.clientes
  );

  // Estado local solo para alternar vista
  const [clientesInvisibles, setClientesInvisibles] = useState<Cliente[]>([]);
  const [modoPapelera, setModoPapelera] = useState(false);

  // Cargar clientes visibles (Redux thunk)
  const cargarClientes = useCallback(() => {
    dispatch(getClientes());
  }, [dispatch]);

  // Alternar entre visibles / invisibles
  const toggleInvisibles = useCallback(async () => {
    try {
      if (!modoPapelera) {
        const action = await dispatch(getClientesInvisibles()).unwrap();
        setClientesInvisibles(action);
        setModoPapelera(true);
      } else {
        setModoPapelera(false);
      }
    } catch (err) {
      console.error("Error al cargar clientes invisibles:", err);
    }
  }, [modoPapelera, dispatch]);

  // Cargar al montar
  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  // Determinar qué lista mostrar
  const clientesFinal = modoPapelera ? clientesInvisibles : clientes;

  return {
    clientes: clientesFinal,
    modoPapelera,
    toggleInvisibles,
    loading,
    error,
    refetch: cargarClientes,
  };
};
