import React, { useEffect, useState } from "react";
import { Tabs, Tab, Box, Typography, Grid, Container } from "@mui/material";
import { usePagos } from "../hooks/Pago/usePagos";
import { getVentasDiarias } from "../api/reportes";
import { DateRangeFilter } from "../Components/Estadisticas/DateRangeFilter";
import { VentasChart } from "../Components/Estadisticas/VentasChart";
import { GraficoVentasTotales } from "../Components/Estadisticas/VentasTotalesChart";
import { IngresosChart } from "../Components/Estadisticas/IngresosChart";
import { ProductosChart } from "../Components/Estadisticas/ProductosChart";
import { RendimientoChart } from "../Components/Estadisticas/RendimientoChart";
import { GastosChart } from "../Components/Estadisticas/GastosChart";
import { VentasPorHoraRadar } from "../Components/Estadisticas/Ventasporhora";

const formatDate = (date: Date | null) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const TabPanel = (props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) => {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
};

export const Estadisticas = () => {
  const [value, setValue] = useState(0);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [ventas, setVentas] = useState<any[]>([]);

  const { pagos, refreshPagos } = usePagos();

  const handleFilter = async (filters: { fecha_inicio: Date | null; fecha_fin: Date | null }) => {
    setFechaInicio(filters.fecha_inicio);
    setFechaFin(filters.fecha_fin);

    const formatted = {
      fecha_inicio: formatDate(filters.fecha_inicio),
      fecha_fin: formatDate(filters.fecha_fin),
    };

    const ventasData = await getVentasDiarias(formatted);
    setVentas(ventasData);

    // podrías también refrescar pagos filtrados si querés:
    refreshPagos(filters.fecha_inicio?.getFullYear() || 2025, filters.fecha_inicio?.getMonth() + 1 || 11);
  };

  useEffect(() => {
    handleFilter({ fecha_inicio: null, fecha_fin: null });
  }, []);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const ventasDiarias = Object.values(
  pagos.reduce((acc: any, pago) => {
    const fecha = new Date(pago.fk_fecha).toISOString().split("T")[0];
    if (!acc[fecha]) acc[fecha] = { fecha, total: 0 };
    acc[fecha].total += 1; // o +1 si querés cantidad de ventas, no monto
    return acc;
  }, {})
);

  return (
    <Container>
      <Box sx={{ width: "100%" }}>
        <DateRangeFilter onFilter={handleFilter} />

        <Tabs value={value} onChange={handleChange} aria-label="estadisticas tabs">
          <Tab label="Resumen" />
          <Tab label="Ventas" />
          <Tab label="Ingresos" />
          <Tab label="Productos" />
          <Tab label="Rendimiento" />
          <Tab label="Gastos" />
        </Tabs>

        <TabPanel value={value} index={0}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <GraficoVentasTotales data={pagos} fechaInicio={fechaInicio} fechaFin={fechaFin} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
             <VentasPorHoraRadar data={pagos} fechaInicio={fechaInicio} fechaFin={fechaFin} />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={value} index={1}>
          <VentasChart data={ventas} fechaInicio={fechaInicio} fechaFin={fechaFin} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <IngresosChart data={pagos} fechaInicio={fechaInicio} fechaFin={fechaFin} />
        </TabPanel>
        <TabPanel value={value} index={3}>
         
        </TabPanel>
        <TabPanel value={value} index={4}>
          <RendimientoChart data={[]} fechaInicio={fechaInicio} fechaFin={fechaFin} />
        </TabPanel>
        <TabPanel value={value} index={5}>
          <GastosChart data={[]} fechaInicio={fechaInicio} fechaFin={fechaFin} />
        </TabPanel>
      </Box>
    </Container>
  );
};
