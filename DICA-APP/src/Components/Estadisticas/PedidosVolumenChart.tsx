// Components/Estadisticas/PedidosVolumenChart.tsx

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  data: Record<string, number>; // El objeto volumenPorDia del hook
}

export const PedidosVolumenChart: React.FC<Props> = ({ data }) => {
  const sortedDates = Object.keys(data).sort();
  const dataValues = sortedDates.map(date => data[date]);

  const chartData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Volumen de Pedidos",
        data: dataValues,
        borderColor: "#D7E8E0", 
        backgroundColor: "#7fddb1ff",
        tension: 0.3, 
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Volumen de Pedidos por Día'
      },
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

  return <Line data={chartData} options={options} />;
};