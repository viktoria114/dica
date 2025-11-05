// Components/Estadisticas/GraficoVentasTotales.tsx
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

interface Props {
  data: any[]; // Usamos la interfaz Pago para más seguridad
  fechaInicio: Date | null;
  fechaFin: Date | null;
}



export const GraficoVentasTotales: React.FC<Props> = ({ data, fechaInicio, fechaFin }) => {
    console.log(data);
    

    const totalDuration = 10000;
const delayBetweenPoints = totalDuration / data.length;
const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;
const animation = {
  x: {
    type: 'number',
    easing: 'linear',
    duration: delayBetweenPoints,
    from: NaN, // the point is initially skipped
    delay(ctx) {
      if (ctx.type !== 'data' || ctx.xStarted) {
        return 0;
      }
      ctx.xStarted = true;
      return ctx.index * delayBetweenPoints;
    }
  },
  y: {
    type: 'number',
    easing: 'linear',
    duration: delayBetweenPoints,
    from: previousY,
    delay(ctx) {
      if (ctx.type !== 'data' || ctx.yStarted) {
        return 0;
      }
      ctx.yStarted = true;
      return ctx.index * delayBetweenPoints;
    }
  }
};

  if (!data?.length) return <p>No hay datos disponibles.</p>;

  // 1. Clonamos fechaFin y ajustamos la hora al final del día
  const endOfDayFechaFin = fechaFin ? new Date(fechaFin) : null;
  if (endOfDayFechaFin) {
    endOfDayFechaFin.setHours(23, 59, 59, 999); // Incluye todo el día final
  }

  // 2. Filtramos los datos según el rango de fechas
  const filteredData = data.filter(pago => {
    const fechaPago = new Date(pago.fk_fecha);

    // Aplicamos los filtros
    if (fechaInicio && fechaPago < fechaInicio) return false;
    if (endOfDayFechaFin && fechaPago > endOfDayFechaFin) return false;
    
    return true;
  });

  // 3. Agrupamos los datos filtrados (resumen)
  const resumen = filteredData.reduce((acc: Record<string, number>, pago) => {
    // Usamos YYYY-MM-DD para agrupar y ordenar correctamente
    const fecha = new Date(pago.fk_fecha).toISOString().split("T")[0];
    

    const monto = parseFloat(pago.monto);

    if (isNaN(monto)) {
      console.warn("Dato de monto no válido, saltando:", pago);
      return acc; // Saltamos este 'pago' y no lo sumamos
    }

    // Sumamos el MONTO (monto), no la cantidad (+1)
    acc[fecha] = (acc[fecha] || 0) + monto; 
    return acc;
  }, {});

  // 4. Ordenamos las fechas (labels)
  const sortedFechas = Object.keys(resumen).sort((a, b) => a.localeCompare(b));

  // 5. Preparamos los datos para el gráfico
  const chartData = {
    labels: sortedFechas, // Labels ordenados
            options: {
    animation,
    interaction: {
      intersect: false
    },},
    datasets: [
      {
        label: "Total de Ventas",
        // Mapeamos los labels ordenados para obtener el dato (monto)
        data: sortedFechas.map(fecha => resumen[fecha]),
        borderColor: "#ff9e80",
        backgroundColor: "rgba(255, 159, 128, 0.2)",
        tension: 0.3,
        fill: true,

}
    ],
  };

  return <Line data={chartData} />;
};