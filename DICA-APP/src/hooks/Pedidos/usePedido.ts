/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useCallback } from "react";
import { getPedidosBorrados, updatePedidoEstado } from "../../api/pedidos";
import type { Pedido } from "../../types";
import { useAppDispatch } from "../../store/hooks";
import { getPedidos } from "../../store/slices/pedidosSlices";
import { useSnackbar } from "../../contexts/SnackbarContext";

export const usePedidos = () => {
  const dispatch = useAppDispatch();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosBorrados, setPedidosBorrados] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   const { showSnackbar } = useSnackbar();

  // 1. Estado de la UI y filtros
  const [modo, setModo] = useState<"normal" | "borrados" | "cancelados">(
    "normal"
  );
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([]);

  // 2. Carga inicial de datos
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dataPedidos = await dispatch(getPedidos()).unwrap();

      // Cargamos todo en paralelo
      const [dataBorrados] = await Promise.all([getPedidosBorrados()]);

      // Tu lógica de mapeo
      const pedidosBackend = dataPedidos.map((p: any) => {
        const rawDate = p.fecha;
        let normalizedFecha: string | null = null;

        if (rawDate) {
          // Si el backend convierte a Date, ya es un objeto Date.
          // Si aún es un string ISO, new Date() lo convierte a Date.
          const dateObj = rawDate instanceof Date ? rawDate : new Date(rawDate);

          // Asegúrate de que la fecha sea válida antes de convertirla a string ISO
          if (!isNaN(dateObj.getTime())) {
            normalizedFecha = dateObj.toISOString();
          }
        }

        return {
          // --- IDs y Estado ---
          pedido_id: p.pedido_id ?? null,
          fk_estado: p.fk_estado ?? p.id_estado ?? 1, // Fallback a 1 (Pendiente) si no viene nada

          // --- Cliente y Ubicación ---
          id_cliente: p.id_cliente ?? null,
          ubicacion: p.ubicacion ?? "", // Es mejor un string vacío que null

          // --- Fecha y Hora (¡Importante la conversión!) ---
          fecha: normalizedFecha,
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
        };
      });

      setPedidos(pedidosBackend);
      setPedidosBorrados(dataBorrados);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]); // Cargar solo una vez al montar

  // 3. Lógica de filtrado y modo
  const cambiarModo = useCallback(
    (nuevoModo: "borrados" | "cancelados" | "normal") => {
      setModo(nuevoModo);
      setPedidosFiltrados([]); // Resetea el filtro al cambiar de modo
    },
    []
  );

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
        return pedidos.filter((p) => p.fk_estado === 9);
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
    const estadoOriginalId = Number(source.droppableId);

    // Guardar estado original para rollback
    const pedidoOriginal = pedidos.find((p) => p.pedido_id === pedidoId);
    if (!pedidoOriginal) return;

if (newEstadoId !== estadoOriginalId + 1) {
  showSnackbar(`Movimiento no permitido: El pedido ${pedidoId} (Estado ${estadoOriginalId}) solo puede ir al Estado ${estadoOriginalId + 1}.`, "warning")
            console.warn(
                `Movimiento no permitido: El pedido ${pedidoId} (Estado ${estadoOriginalId}) solo puede ir al Estado ${estadoOriginalId + 1}.`
            );
            return;
}

    // Actualización optimista de UI
    setPedidos((prev) =>
      prev.map((p) =>
        p.pedido_id === pedidoId ? { ...p, fk_estado: newEstadoId } : p
      )
    );

    // Llamada a la API
    try {
      await updatePedidoEstado(pedidoId);
      showSnackbar("Pedido movido con éxito!", "success");
      console.log(`API CALL: Mover pedido ${pedidoId} a estado ${newEstadoId}`);
    } catch (err) {
      console.error("Error al actualizar estado del pedido", err);
      showSnackbar("" + err, "error",10000);
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
