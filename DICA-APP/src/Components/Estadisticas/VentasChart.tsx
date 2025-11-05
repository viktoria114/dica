/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Box } from "@mui/material";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  data: any[];
  fechaInicio: Date | null;
  fechaFin: Date | null;
}

export const VentasChart: React.FC<Props> = ({ data, fechaInicio, fechaFin }) => {
  if (!data?.length) return <p>No hay datos disponibles en este rango.</p>;

  const chartJsData = {
    labels: data.map((item: any) => new Date(item.fecha).toLocaleDateString()),
    datasets: [
      {
        label: "Ventas Diarias",
        data: data.map((item: any) => item.cantidad_ventas),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <Box sx={{ maxWidth: "600px", maxHeight: "400px", margin: "auto" }}>
      <Bar data={chartJsData} />
    </Box>
  );
};
