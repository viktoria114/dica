/* eslint-disable @typescript-eslint/no-explicit-any */
// Components/Estadisticas/MetodosDePagoChart.tsx

import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement, // Específico para gráficos de torta/dona
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  data: any[]; // Los 'pagos' ya filtrados por fecha
}

// Colores recomendados para gráficos de torta
const BACKGROUND_COLORS = [
  "#495e57ff",
        "#c7c174ff",
  "#A3A0FB", // Tarjeta (Púrpura claro)
  "#FFCD56", // Otro (Amarillo)
  "#E46651", // Débito/Crédito (Rojo claro)
];

export const MetodosDePagoChart: React.FC<Props> = ({ data }) => {
  // 1. Agrupar y sumar montos por método de pago
  const ventasPorMetodo = data.reduce((acc: Record<string, number>, pago) => {
    // Asegúrate de que tu campo sea 'metodo_pago' o el nombre correcto
    const metodo = (pago.metodo_pago).toLowerCase() || "Desconocido"; 
    const monto = parseFloat(pago.monto);

    if (!isNaN(monto)) {
      acc[metodo] = (acc[metodo] || 0) + monto;
    }
    return acc;
  }, {});

  // 2. Preparar los datos para Chart.js
  const labels = Object.keys(ventasPorMetodo);
  const dataValues = Object.values(ventasPorMetodo);

  if (labels.length === 0) {
    return <p>No hay datos de pagos para el rango seleccionado.</p>;
  }

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Monto ($)",
        data: dataValues,
        backgroundColor: labels.map((_, index) => BACKGROUND_COLORS[index % BACKGROUND_COLORS.length]),
        borderColor: "#ffffff", // Borde blanco entre segmentos
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribución de Ventas por Método de Pago'
      }
    }
  };

  return <Pie data={chartData} options={options} />;
};