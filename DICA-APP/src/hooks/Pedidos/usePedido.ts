/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { getPedidos, getPedidosBorrados } from '../../api/pedidos';
import type { Pedido } from '../../types';

// Asumimos que tienes una función para actualizar el estado en la API
// import { updatePedidoEstado } from '../api/pedidos';

export const usePedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosBorrados, setPedidosBorrados] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 1. Estado de la UI y filtros
  const [modo, setModo] = useState<"normal" | "borrados" | "cancelados">("normal");
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([]);

  // 2. Carga inicial de datos
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargamos todo en paralelo
      const [dataPedidos, dataBorrados] = await Promise.all([
        getPedidos(),
        getPedidosBorrados(),
      ]);

      // Tu lógica de mapeo
      const pedidosBackend = dataPedidos.map((p: any) => ({
       // --- IDs y Estado ---
  pedido_id: p.pedido_id ?? null,
  fk_estado: p.fk_estado ?? p.id_estado ?? 1, // Fallback a 1 (Pendiente) si no viene nada

  // --- Cliente y Ubicación ---
  id_cliente: p.id_cliente ?? null,
  ubicacion: p.ubicacion ?? "", // Es mejor un string vacío que null

  // --- Fecha y Hora (¡Importante la conversión!) ---
  id_fecha: p.id_fecha ? new Date(p.id_fecha) : null,
  hora: p.hora ?? null,

  // --- Contenido del Pedido ---
  items: p.items ?? [], // Es mejor un array vacío que undefined
  promociones: p.promociones ?? [], // Igual aquí

  // --- Precios (Calculados en el backend) ---
  precio_por_items: p.precio_por_items ?? 0,
  precio_por_promociones: p.precio_por_promociones ?? 0,
  precio_total: p.precio_total ?? 0,

  // --- Metadatos ---
  observaciones: p.observaciones ?? "",
  visibilidad: p.visibilidad ?? true, // Asumimos true si no se especifica
      }));
      
      setPedidos(pedidosBackend);
      setPedidosBorrados(dataBorrados);

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]); // Cargar solo una vez al montar

  // 3. Lógica de filtrado y modo
  const cambiarModo = useCallback((nuevoModo: "borrados" | "cancelados" | "normal") => {
    setModo(nuevoModo);
    setPedidosFiltrados([]); // Resetea el filtro al cambiar de modo
  }, []);

  const actualizarPedidosFiltrados = useCallback((filtered: Pedido[]) => {
    setPedidosFiltrados(filtered);
  }, []);

  // 4. Lógica de "qué mostrar" (estado derivado)
  const pedidosAMostrar = useMemo(() => {
    const base = pedidosFiltrados.length > 0 ? pedidosFiltrados : pedidos;
    switch (modo) {
      case "normal":
        return base;
      case "borrados":
        // Aquí podrías filtrar `pedidosBorrados` si tuvieras un searchbar en esa vista
        return pedidosBorrados;
      case "cancelados":
        // El estado base `pedidos` ya contiene los cancelados
        return pedidos.filter(p => p.fk_estado === 9); 
      default:
        return base;
    }
  }, [modo, pedidos, pedidosBorrados, pedidosFiltrados]);

  // 5. Acciones (Mutaciones)
  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newEstadoId = Number(destination.droppableId);
    const pedidoId = Number(draggableId);
    
    // Guardar estado original para rollback
    const pedidoOriginal = pedidos.find(p => p.pedido_id === pedidoId);
    if (!pedidoOriginal) return;

    // Actualización optimista de UI
    setPedidos((prev) =>
      prev.map((p) =>
        p.pedido_id === pedidoId
          ? { ...p, fk_estado: newEstadoId }
          : p
      )
    );
    
    // Llamada a la API
    try {
      // Deberías tener una función así en tu API
      // await updatePedidoEstado(pedidoId, newEstadoId);
      console.log(`API CALL: Mover pedido ${pedidoId} a estado ${newEstadoId}`);
    } catch (err) {
      console.error("Error al actualizar estado del pedido", err);
      // Rollback en caso de error
      setPedidos((prev) =>
        prev.map((p) =>
          p.pedido_id === pedidoId
            ? pedidoOriginal // Revierte al estado original
            : p
        )
      );
      // Aquí podrías mostrar un toast/alerta de error
    }
  };

  // 6. Función para actualizar un pedido en la lista (después de editar)
  const actualizarPedidoLocal = (pedidoActualizado: Pedido) => {
    setPedidos((prev) =>
      prev.map((p) =>
        p.pedido_id === pedidoActualizado.pedido_id ? pedidoActualizado : p
      )
    );
  };
  
  return {
    loading,
    error,
    modo,
    pedidosAMostrar,
    allPedidos: pedidos, // Para la base del SearchBar
    cambiarModo,
    actualizarPedidosFiltrados,
    handleDragEnd,
    actualizarPedidoLocal,
    refetch: cargarDatos, // Para refrescar datos si es necesario
  };
};