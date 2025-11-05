// Components/Estadisticas/PedidosPorEstadoChart.tsx

import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  data: Record<string, number>; // El objeto volumenPorEstado del hook
}

const COLORS = ["#6ce2abff", "#6cc56cff", "#ddcb61ff", "#ec8c69ff", "#b07ae4ff", "#20B2AA"];

export const PedidosPorEstadoChart: React.FC<Props> = ({ data }) => {
  const labels = Object.keys(data);
  const dataValues = Object.values(data);

  if (labels.length === 0) {
    return <p>No hay datos de pedidos para mostrar.</p>;
  }

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Cantidad de Pedidos",
        data: dataValues,
        backgroundColor: labels.map((_, index) => COLORS[index % COLORS.length]),
        borderColor: "#ffffff",
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
        text: 'Distribución de Pedidos por Estado'
      }
    }
  };

  return <Pie data={chartData} options={options} />;
};