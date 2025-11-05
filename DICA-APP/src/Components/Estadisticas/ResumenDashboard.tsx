/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Box, Grid } from "@mui/material";
import { DateRangeFilter } from "./DateRangeFilter";

import {
  getVentasDiarias,
  //getHorasPico,
  getProductosMasVendidos,
  //getPromosMasVendidas,
} from "../../api/reportes";
import { GraficoVentasTotales } from "./VentasTotalesChart";
import { usePagos } from "../../hooks/Pago/usePagos";

const formatDate = (date: Date | null) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const ResumenDashboard = () => {
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [ventas, setVentas] = useState<any[]>([]);
  const [horasPico, setHorasPico] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const { pagos } = usePagos()

  const fetchAll = async (filters?: { fecha_inicio: Date | null; fecha_fin: Date | null }) => {
    try {
      const formatted = filters
        ? {
            fecha_inicio: formatDate(filters.fecha_inicio),
            fecha_fin: formatDate(filters.fecha_fin),
          }
        : {};

      // 🔹 Reutiliza las mismas funciones que tu componente VentasChart
      const [ventasData, horasData, productosData, promosData] = await Promise.all([
        getVentasDiarias(formatted),
        //getHorasPico(formatted),
        getProductosMasVendidos(formatted),
        //getPromosMasVendidas(formatted),
      ]);

      setVentas(ventasData);
      setHorasPico(horasData);
      //setProductos(productosData);
      //setPromos(promosData);
    } catch (error) {
      console.error("Error al obtener datos del dashboard:", error);
    }
  };

  // 🔹 Se ejecuta al montar
  useEffect(() => {
    fetchAll();
  }, []);

  // 🔹 Se ejecuta al filtrar
  const handleFilter = (filters: { fecha_inicio: Date | null; fecha_fin: Date | null }) => {
    setFechaInicio(filters.fecha_inicio);
    setFechaFin(filters.fecha_fin);
    fetchAll(filters);
  };

  return (
    <Box sx={{ p: 3 }}>
      <DateRangeFilter onFilter={handleFilter} />

      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid size={{xs:12, md:6}}>
            
          <GraficoVentasTotales data={pagos.map(v => ({
            fecha: new Date(v.fk_fecha).toLocaleDateString(),
            total: pagos.length,
          }))} />
        </Grid>
{/*
        <Grid size={{xs:12, md:6}}>
          <GraficoHorasPico data={horasPico} />
        </Grid>

        <Grid size={{xs:12, md:6}}>
          <GraficoProductosMasVendidos data={productos} />
        </Grid>

        <Grid size={{xs:12, md:6}}>
          <GraficoPromosMasVendidas data={promos} />
         
        </Grid>
         */}
      </Grid>
    </Box>
  );
};
