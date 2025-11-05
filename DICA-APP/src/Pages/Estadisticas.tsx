/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  Container,
} from "@mui/material";
import { usePagos } from "../hooks/Pago/usePagos";
import { getVentasDiarias } from "../api/reportes";
import { DateRangeFilter } from "../Components/Estadisticas/DateRangeFilter";
import { GraficoVentasTotales } from "../Components/Estadisticas/VentasTotalesChart";
import { RendimientoChart } from "../Components/Estadisticas/RendimientoChart";
import { GastosChart } from "../Components/Estadisticas/GastosChart";
import { VentasPorHoraRadar } from "../Components/Estadisticas/Ventasporhora";
import { DashboardCard } from "../Components/Inicio/DashboardCard";
import { MetodosDePagoChart } from "../Components/Estadisticas/MetodosDePagoChart";
import { usePedidos } from "../hooks/Pedidos/usePedido";
import { usePedidosEstadisticas } from "../hooks/usePedidosEstats";
import { PedidosVolumenChart } from "../Components/Estadisticas/PedidosVolumenChart";
import { PedidosPorEstadoChart } from "../Components/Estadisticas/PedidosPorEstadoChart";
import { PedidosPorDiaSemanaChart } from "../Components/Estadisticas/PedidosPorDiaSemanaChart";
import { FlujoDeCajaChart } from "../Components/Estadisticas/FlujoDeCajaChart";
import { useFlujoDeCajaEstadisticas } from "../hooks/useFlujoDeCajaEstadisticas";
import { useGastos } from "../hooks/Gasto/useGastos";
import { ProductosChart } from "../Components/Estadisticas/ProductosChart";

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
  const { allPedidos } = usePedidos();
    const {gastos} = useGastos()


  const handleFilter = async (filters: {
    fecha_inicio: Date | null;
    fecha_fin: Date | null;
  }) => {
    setFechaInicio(filters.fecha_inicio);
    setFechaFin(filters.fecha_fin);

    const formatted = {
      fecha_inicio: formatDate(filters.fecha_inicio),
      fecha_fin: formatDate(filters.fecha_fin),
    };

    const ventasData = await getVentasDiarias(formatted);
    setVentas(ventasData);

    refreshPagos();
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

  const endOfDayFechaFin = fechaFin ? new Date(fechaFin) : null;
  if (endOfDayFechaFin) {
    endOfDayFechaFin.setHours(23, 59, 59, 999);
  }

  const pagosFiltrados = pagos.filter((pago) => {
    const fechaPago = new Date(pago.fk_fecha);
    if (fechaInicio && fechaPago < fechaInicio) return false;
    if (endOfDayFechaFin && fechaPago > endOfDayFechaFin) return false;
    return true;
  });

  // 2. Calcular los totales y promedios
  const estadisticas = pagosFiltrados.reduce(
    (acc, pago) => {
      const monto = parseFloat(pago.monto);
      if (!isNaN(monto)) {
        acc.montoTotal += monto;
        acc.totalTransacciones += 1;
      }
      return acc;
    },
    { montoTotal: 0, totalTransacciones: 0 }
  );

  const montoPromedio =
    estadisticas.totalTransacciones > 0
      ? estadisticas.montoTotal / estadisticas.totalTransacciones
      : 0;

  const totalVentasMonto = estadisticas.montoTotal.toFixed(0);
  const totalVentasCount = estadisticas.totalTransacciones;
  const promedioVenta = montoPromedio.toFixed(0);

  const {
    totalPedidos,
    pedidosAbiertos,
    pedidosCerrados,
    volumenPorEstado,
    volumenPorDia,
    volumenPorDiaSemana,
  } = usePedidosEstadisticas(allPedidos, fechaInicio, fechaFin);


  const {
        flujoPorDia,
        totalGastos,
        gastosPorCategoria,
    } = useFlujoDeCajaEstadisticas(pagos, gastos, fechaInicio, fechaFin);
  return (
    <Container>
      <Box sx={{ width: "100%" }}>
        <DateRangeFilter onFilter={handleFilter} />

        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="estadisticas tabs"
          centered
          sx={{
            "& .MuiTab-root": {
              color: "gray", // O 'grey.600' para usar colores del tema MUI
              fontWeight: 500, // Hace que el texto se vea un poco más fuerte
            },
            "& .Mui-selected": {
              color: (theme) => `${theme.palette.primary.main} !important`, // Usa el color primario del tema
              fontWeight: 700, // Hace el texto seleccionado más visible
            },
            "& .MuiTabs-indicator": {
              backgroundColor: (theme) => theme.palette.primary.main, // Usa el color primario
            },
          }}
        >
          <Tab label="Ventas" />
          <Tab label="Pedidos" />
          <Tab label="Ingresos" />
          <Tab label="Productos" />
          <Tab label="Rendimiento" />
          <Tab label="Gastos" />
        </Tabs>

        <TabPanel value={value} index={0}>
          <Box display="flex" justifyContent="center" gap={8} mb={8}>
            <DashboardCard
              label="Cantidad de ventas"
              value={totalVentasCount}
              color="primary.main"
            />
            <DashboardCard
              label="Total de Ventas"
              value={`$${totalVentasMonto}`}
              color="#c7c174ff"
            />
            <DashboardCard
              label="Promedio de Venta"
              value={`$${promedioVenta}`}
              color="primary.main"
            />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 7 }} sx={{ alignContent: "center" }}>
              <GraficoVentasTotales
                data={pagosFiltrados}
                fechaInicio={fechaInicio}
                fechaFin={fechaFin}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <VentasPorHoraRadar
                data={pagosFiltrados}
                fechaInicio={fechaInicio}
                fechaFin={fechaFin}
              />
            </Grid>
             <Grid size={{md:3.5}}></Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <MetodosDePagoChart data={pagosFiltrados} />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={value} index={1}>
          
            <Box display="flex" justifyContent="center" gap={6  } mb={8}>
              <DashboardCard
                label="Total de Pedidos"
                value={totalPedidos}
                color="#c7c174ff"
              />

              <DashboardCard
                label="Pedidos Abiertos"
                value={pedidosAbiertos}
                color="primary.main" // Color de aviso
              />

              <DashboardCard
                label="Pedidos Cerrados/Completados"
                value={pedidosCerrados}
                color="#c7c174ff" // Color de éxito
              />
            </Box>
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <PedidosVolumenChart data={volumenPorDia} />
            </Grid>
             <Grid size={{ xs: 12, md: 6 }}>
              <PedidosPorDiaSemanaChart data={volumenPorDiaSemana} />
            </Grid>
             <Grid size={{ xs: 12, md: 6 }}>
              <RendimientoChart 
        fechaInicio={fechaInicio} // <-- Pasar prop
        fechaFin={fechaFin}       // <-- Pasar prop
        />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <PedidosPorEstadoChart data={volumenPorEstado} />
            </Grid>
           
           
          </Grid>
        </TabPanel>

        <TabPanel value={value} index={2}>
        {/* Indicadores KPI de Ingresos y Egresos */}
       <Box display="flex" justifyContent="center" gap={6  } mb={8}>
                <DashboardCard
                    label="Total Ingresos (Filtrado)"
                    value={`$${totalVentasMonto}`} // De tu hook de ventas
                    color="success.main"
                />
           
                <DashboardCard
                    label="Total Egresos (Gastos)"
                    value={`$${totalGastos.toFixed(0)}`}
                    color="error.main"
                />
          
                <DashboardCard
                    label="Balance Neto Estimado"
                    value={`$${(parseFloat(totalVentasMonto) - totalGastos).toFixed(0)}`}
                    color="info.main"
                />
           </Box>
        
        {/* Flujo de Caja Temporal */}
        <Grid container spacing={2}>
          <Grid size={{sm:0.6}}></Grid>
            <Grid size={{sm:11}}>
                <FlujoDeCajaChart data={flujoPorDia} />
            </Grid>
        

        {/* Distribución de Gastos */}
        <Grid size={{sm:3}}></Grid>
            <Grid size={{sm:6}}>
                <GastosChart
        fechaInicio={fechaInicio} 
        fechaFin={fechaFin}
    />
            </Grid>
        </Grid>
    </TabPanel>

        <TabPanel value={value} index={3}>
<ProductosChart  fechaInicio={fechaInicio}
            fechaFin={fechaFin}> </ProductosChart>

        </TabPanel>
        <TabPanel value={value} index={4}>
          <RendimientoChart
            data={[]}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
          />
        </TabPanel>
        <TabPanel value={value} index={5}>
          <GastosChart
            data={[]}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
          />
        </TabPanel>
      </Box>
    </Container>
  );
};
