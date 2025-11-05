// Components/Estadisticas/VentasPorHoraRadar.tsx

import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale, // Específico para Radar
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler // Para el fondo de color
);

interface Props {
  data: any[]; // Tus 'pagos'
  fechaInicio: Date | null;
  fechaFin: Date | null;
}

export const VentasPorHoraRadar: React.FC<Props> = ({ data, fechaInicio, fechaFin }) => {
  if (!data?.length) return <p>No hay datos disponibles.</p>;

  // 1. HORAS OBJETIVO: Las "etiquetas" de tu gráfico de radar
  // Estas son las horas que nos interesan (20:00 a 03:00)
  const horasTarget = [20, 21, 22, 23, 0, 1, 2, 3];
  const labels = [
    "8 PM", "9 PM", "10 PM", "11 PM", 
    "12 AM", "1 AM", "2 AM", "3 AM"
  ];

  // 2. Inicializamos el acumulador de ventas para esas horas
  const ventasPorHora = horasTarget.reduce((acc, hora) => {
    acc[hora] = 0; // { 20: 0, 21: 0, 22: 0, ... }
    return acc;
  }, {} as Record<number, number>);

  // 3. Filtramos por FECHA (igual que en el gráfico de línea)
  const endOfDayFechaFin = fechaFin ? new Date(fechaFin) : null;
  if (endOfDayFechaFin) {
    endOfDayFechaFin.setHours(23, 59, 59, 999);
  }

  const filteredData = data.filter(pago => {
    const fechaPago = new Date(pago.fk_fecha);
    if (fechaInicio && fechaPago < fechaInicio) return false;
    if (endOfDayFechaFin && fechaPago > endOfDayFechaFin) return false;
    return true;
  });

  // 4. Procesamos los datos filtrados para sumar por HORA
  for (const pago of filteredData) {
    // Extraemos la hora del string "HH:MM:SS"
    const hora = parseInt(pago.hora.split(":")[0]); // "23:44:38" -> 23

    // Verificamos si es una de las horas que nos interesa
    if (ventasPorHora.hasOwnProperty(hora)) {
      const monto = parseFloat(pago.monto);
      if (!isNaN(monto)) {
        ventasPorHora[hora] += monto;
      }
    }
  }

  // 5. Convertimos el objeto de ventas en un array ordenado
  const dataValues = horasTarget.map(hora => ventasPorHora[hora]);

  // 6. Configuramos los datos para Chart.js
  const chartData = {
    labels: labels, // ["8 PM", "9 PM", ...]
    datasets: [
      {
        label: "Ventas Totales por Hora",
        data: dataValues, // [1500, 2300, 5000, ...]
        fill: true,
        backgroundColor: "rgba(255, 159, 128, 0.2)", // Mismo color que el otro gráfico
        borderColor: "#ff9e80",
        pointBackgroundColor: "#ff9e80",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#ff9e80",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Ventas en Horario Pico (20hs - 03hs)'
      },
      legend: {
        display: false, // Opcional: ocultar la leyenda si solo hay 1 dataset
      }
    },
    scales: {
      r: { // 'r' es la escala radial (los números $500, $1000, etc.)
        ticks: {
          backdropColor: 'transparent', // Oculta los números sobre el fondo
          callback: function(value: any) {
             return '$' + value; // Agrega el símbolo $
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)' // Líneas de la telaraña
        },
        angleLines: {
           color: 'rgba(0, 0, 0, 0.1)' // Líneas que van del centro a la etiqueta
        }
      }
    }
  };

  return <Radar data={chartData} options={options} />;
};