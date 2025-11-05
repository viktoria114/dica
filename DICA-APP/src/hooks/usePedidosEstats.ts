// src/hooks/usePedidosEstadisticas.ts

import { useMemo } from "react";
import type { Pedido } from "../types";

// --- Mapeo de Estados (Añadir estas constantes) ---
const todosLosEstados = [
  { id: 1, nombre: "Pendiente" },
  { id: 2, nombre: "En Preparación" },
  { id: 3, nombre: "Listo" },
  { id: 4, nombre: "Por Entregar" },
  { id: 5, nombre: "Entregado" },
  { id: 6, nombre: "En Construcción" },
  { id: 7, nombre: "A Confirmar" },
  { id: 8, nombre: "En Espera a Cancelar" },
    { id: 9, nombre: "Cancelados" },

];
const DIAS_SEMANA_ORDEN = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Crear un mapa rápido de ID a Nombre
const estadoNombreMap: Record<number, string> = todosLosEstados.reduce((map, estado) => {
    map[estado.id] = estado.nombre;
    return map;
}, {} as Record<number, string>);

interface PedidosStats {
  pedidosFiltrados: Pedido[];
  totalPedidos: number;
  pedidosAbiertos: number;
  pedidosCerrados: number;
  volumenPorEstado: Record<string, number>;
  volumenPorDia: Record<string, number>;
}

export const usePedidosEstadisticas = (
  pedidos: Pedido[] | undefined,
  fechaInicio: Date | null,
  fechaFin: Date | null
): PedidosStats & { volumenPorDiaSemana: Record<string, number> }=> {

  const {
    pedidosFiltrados,
    totalPedidos,
    pedidosAbiertos,
    pedidosCerrados,
    volumenPorEstado,
    volumenPorDia,
    volumenPorDiaSemana,
  } = useMemo(() => {
    if (!pedidos || pedidos.length === 0) {
      return {
        pedidosFiltrados: [],
        totalPedidos: 0,
        pedidosAbiertos: 0,
        pedidosCerrados: 0,
        volumenPorEstado: {},
        volumenPorDia: {},
      };
    }

    const initialDayCount = DIAS_SEMANA_ORDEN.reduce((acc, dia) => {
        acc[dia] = 0;
        return acc;
    }, {} as Record<string, number>);

    // 1. Filtrado por fecha (Igual que en Ventas)
    const endOfDayFechaFin = fechaFin ? new Date(fechaFin) : null;
    if (endOfDayFechaFin) {
      endOfDayFechaFin.setHours(23, 59, 59, 999);
    }

    const filtered = pedidos.filter((pedido) => {
      const fechaPedido = new Date(pedido.fecha); // Usar el campo 'fecha'
      if (fechaInicio && fechaPedido < fechaInicio) return false;
      if (endOfDayFechaFin && fechaPedido > endOfDayFechaFin) return false;
      return true;
    });

    const acumulador = filtered.reduce(
      (acc, pedido) => {
        acc.totalPedidos += 1;
        
        const fechaPedido = new Date(pedido.fecha);
        const diaIndex = fechaPedido.getDay(); // 0 (Domingo) a 6 (Sábado)
        const diaNombre = DIAS_SEMANA_ORDEN[diaIndex];
        
        acc.volumenPorDiaSemana[diaNombre] += 1;

        // --- CÓDIGO MODIFICADO AQUÍ ---
        // 1. Obtener el nombre del estado (o usar ID si no se encuentra)
        const estadoNombre = estadoNombreMap[pedido.fk_estado] || `Estado ${pedido.fk_estado}`;
        
        // 2. Agrupación por Estado (usando el nombre)
        acc.volumenPorEstado[estadoNombre] = (acc.volumenPorEstado[estadoNombre] || 0) + 1;
        
        // 3. Clasificación Abierto/Cerrado (Mantenemos la lógica anterior)
        // Definición de Cerrados/Completados: 5 (Entregado), 8 (En Espera a Cancelar)
        if (pedido.fk_estado === 5 || pedido.fk_estado === 8) {
          acc.pedidosCerrados += 1;
        } else {
          acc.pedidosAbiertos += 1;
        }
        // -----------------------------

        // Agrupación por Día (Análisis Temporal)
        const fechaDia = new Date(pedido.fecha).toISOString().split("T")[0];
        acc.volumenPorDia[fechaDia] = (acc.volumenPorDia[fechaDia] || 0) + 1;

        return acc;
      },
      {
        totalPedidos: 0,
        pedidosAbiertos: 0,
        pedidosCerrados: 0,
        volumenPorEstado: {} as Record<string, number>,
        volumenPorDia: {} as Record<string, number>,
        volumenPorDiaSemana: initialDayCount,
      }
    );
return {
      pedidosFiltrados: filtered,
      ...acumulador,
    };
  }, [pedidos, fechaInicio, fechaFin]);

  return {
    pedidosFiltrados,
    totalPedidos,
    pedidosAbiertos,
    pedidosCerrados,
    volumenPorEstado,
    volumenPorDia,
    volumenPorDiaSemana,
  };
};