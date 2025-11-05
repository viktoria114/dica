/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  getPedidos,
  getPedidosBorrados,
  updatePedidoEstado,
} from "../../store/slices/pedidosSlices";
import { useSnackbar } from "../../contexts/SnackbarContext";
import type { Pedido } from "../../types";

export const usePedidos = () => {
  const dispatch = useAppDispatch();
  const { pedidos, pedidosBorrados, loading, error, updatingEstado } = useAppSelector(
    (state) => state.pedidos
  );
  const { showSnackbar } = useSnackbar();

  // 🌈 Estado de UI (solo visual)
  const [modo, setModo] = useState<"normal" | "borrados" | "cancelados">("normal");
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([]);

  // 📦 Carga inicial de datos desde Redux
  const cargarDatos = useCallback(async () => {
    try {
      await dispatch(getPedidos()).unwrap();
      await dispatch(getPedidosBorrados()).unwrap();
    } catch (err) {
      showSnackbar("Error al cargar pedidos: " + (err as Error).message, "error");
    }
  }, [dispatch, showSnackbar]);

  // 🚀 Cargar una sola vez al montar
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // 🎛️ Cambiar modo de vista (normal, borrados, cancelados)
  const cambiarModo = useCallback(
    (nuevoModo: "borrados" | "cancelados" | "normal") => {
      setModo(nuevoModo);
      setPedidosFiltrados([]); // Resetea filtros
    },
    []
  );

  // 📋 Actualizar filtro manual
  const actualizarPedidosFiltrados = useCallback((filtered: Pedido[]) => {
    setPedidosFiltrados(filtered);
  }, []);

  // 🧮 Determinar qué lista mostrar según el modo
  const pedidosAMostrar = useMemo(() => {
    const base = pedidosFiltrados.length > 0 ? pedidosFiltrados : pedidos;
    switch (modo) {
      case "normal":
        return base;
      case "borrados":
        return pedidosBorrados;
      case "cancelados":
        return pedidos.filter((p) => p.fk_estado === 9);
      default:
        return base;
    }
  }, [modo, pedidos, pedidosBorrados, pedidosFiltrados]);

  // 🧩 Drag & Drop: cambio de estado del pedido
  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    if (updatingEstado) {
      showSnackbar("Espera a que termine la actualización anterior", "info");
      return;
    }

    const newEstadoId = Number(destination.droppableId);
    const pedidoId = Number(draggableId);
    const estadoOriginalId = Number(source.droppableId);

    const pedidoOriginal = pedidos.find((p) => p.pedido_id === pedidoId);
    if (!pedidoOriginal) return;

    // 🔒 Solo permitir mover al siguiente estado
    if (newEstadoId !== estadoOriginalId + 1) {
      showSnackbar(
        `Movimiento no permitido: el pedido ${pedidoId} solo puede pasar del estado ${estadoOriginalId} al ${estadoOriginalId + 1}.`,
        "warning"
      );
      return;
    }

    try {
      // 🚀 Llamada Redux (el thunk ya actualiza el store)
      await dispatch(updatePedidoEstado(pedidoId)).unwrap();
      showSnackbar("Pedido movido con éxito!", "success");
    } catch (err) {
      console.error("Error al actualizar estado del pedido", err);
      showSnackbar("" + err, "error", 10000);
    }
  };

  // 🧱 Actualizar pedido localmente (para edición directa)
  const actualizarPedidoLocal = (pedidoActualizado: Pedido) => {
    // Si usás Redux, idealmente deberías despachar un thunk de actualización.
    // Pero para actualizaciones locales pequeñas (sin API), se puede manejar así:
    // (Opcional: podrías crear un "setPedidosLocal" reducer para esto)
    console.warn("Actualización local sin persistir:", pedidoActualizado);
  };

  return {
    loading,
    updatingEstado,
    error,
    modo,
    pedidosAMostrar,
    allPedidos: pedidos,
    cambiarModo,
    actualizarPedidosFiltrados,
    handleDragEnd,
    actualizarPedidoLocal,
    refetch: cargarDatos,
  };
};
