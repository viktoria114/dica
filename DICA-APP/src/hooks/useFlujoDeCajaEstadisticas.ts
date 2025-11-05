// src/hooks/useFlujoDeCajaEstadisticas.ts

import { useMemo } from "react";
import { format } from "date-fns";
import type { Gasto, Pago } from "../types";

// Interfaces asumidas (ajusta si tus tipos son diferentes)
interface FlujoDataPoint {
    fecha: string;
    ingresos: number;
    egresos: number;
    neto: number;
}

interface GastosStats {
    totalGastos: number;
    gastosPorCategoria: Record<string, number>;
}

interface FlujoDeCajaStats extends GastosStats {
    flujoPorDia: FlujoDataPoint[];
}

// Función auxiliar para el filtrado de fechas
const isDateWithinRange = (dateStr: string, fechaInicio: Date | null, fechaFin: Date | null): boolean => {
    const fecha = new Date(dateStr);
    
    let endOfDayFechaFin = fechaFin ? new Date(fechaFin) : null;
    if (endOfDayFechaFin) {
        endOfDayFechaFin.setHours(23, 59, 59, 999);
    }

    if (fechaInicio && fecha < fechaInicio) return false;
    if (endOfDayFechaFin && fecha > endOfDayFechaFin) return false;
    return true;
};


export const useFlujoDeCajaEstadisticas = (
  pagos: Pago[] | undefined,
  gastos: Gasto[] | undefined,
  fechaInicio: Date | null,
  fechaFin: Date | null
): FlujoDeCajaStats => {

  const stats = useMemo(() => {
    
    const diarioMap = new Map<string, { ingresos: number, egresos: number }>();
    let totalGastos = 0;
    const gastosPorCategoria: Record<string, number> = {};

    // 1. Procesar PAGOS (Ingresos)
    (pagos || []).forEach(pago => {
      if (isDateWithinRange(pago.fk_fecha, fechaInicio, fechaFin)) {
        const monto = parseFloat(pago.monto || "0");
        const fechaDia = format(new Date(pago.fk_fecha), 'yyyy-MM-dd');

        if (!diarioMap.has(fechaDia)) {
          diarioMap.set(fechaDia, { ingresos: 0, egresos: 0 });
        }
        diarioMap.get(fechaDia)!.ingresos += monto;
      }
    });

    // 2. Procesar GASTOS (Egresos)
    (gastos || []).forEach(gasto => {
      if (isDateWithinRange(gasto.fecha, fechaInicio, fechaFin)) {
        const monto = parseFloat(gasto.monto || "0");
        const fechaDia = format(new Date(gasto.fecha), 'yyyy-MM-dd');
        
        // Acumular totales y categorías
        totalGastos += monto;
        const categoria = gasto.categoria || 'Sin Categoría';
        gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + monto;

        // Acumular por día para el flujo de caja
        if (!diarioMap.has(fechaDia)) {
          diarioMap.set(fechaDia, { ingresos: 0, egresos: 0 });
        }
        diarioMap.get(fechaDia)!.egresos += monto;
      }
    });

    // 3. Crear el array final de Flujo de Caja por día
    const flujoPorDia: FlujoDataPoint[] = Array.from(diarioMap.entries())
      .map(([fecha, { ingresos, egresos }]) => ({
        fecha,
        ingresos,
        egresos,
        neto: ingresos - egresos,
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha)); // Ordenar cronológicamente

    return {
        flujoPorDia,
        totalGastos,
        gastosPorCategoria,
    };

  }, [pagos, gastos, fechaInicio, fechaFin]);

  return stats;
};