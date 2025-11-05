// Components/Estadisticas/PedidosPorDiaSemanaChart.tsx

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement, // Específico para gráfico de barras
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  data: Record<string, number>; // El objeto volumenPorDiaSemana del hook
}

// Orden de los días para la visualización (debe coincidir con el hook)
const DIAS_SEMANA_ORDEN = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export const PedidosPorDiaSemanaChart: React.FC<Props> = ({ data }) => {
  // Aseguramos el orden de los datos según el orden de los días
  const dataValues = DIAS_SEMANA_ORDEN.map(day => data[day] || 0);

  const chartData = {
    labels: DIAS_SEMANA_ORDEN,
    datasets: [
      {
        label: "Pedidos Totales",
        data: dataValues,
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Un color claro para las barras
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Volumen de Pedidos por Día de la Semana'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de Pedidos'
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
};