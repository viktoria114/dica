// Components/Estadisticas/FlujoDeCajaChart.tsx

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale, // Importante para el eje X de tiempo
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // Adaptador de fechas para Chart.js
import { Box, Typography } from '@mui/material';

// Asegúrate de registrar TimeScale
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale 
);

interface FlujoDataPoint {
    fecha: string;
    ingresos: number;
    egresos: number;
    neto: number;
}

interface FlujoDeCajaChartProps {
    data: FlujoDataPoint[];
}

export const FlujoDeCajaChart: React.FC<FlujoDeCajaChartProps> = ({ data }) => {
    
    const chartJsData = {
        datasets: [
            {
                label: 'Ingresos Totales',
                data: data.map(item => ({ x: item.fecha, y: item.ingresos })),
                borderColor: '#4CAF50', // Verde para Ingresos
                backgroundColor: 'rgba(76, 175, 80, 0.5)',
                tension: 0.2,
            },
            {
                label: 'Egresos Totales',
                data: data.map(item => ({ x: item.fecha, y: item.egresos })),
                borderColor: '#F44336', // Rojo para Egresos
                backgroundColor: 'rgba(244, 67, 54, 0.5)',
                tension: 0.2,
            },
            {
                label: 'Flujo Neto',
                data: data.map(item => ({ x: item.fecha, y: item.neto })),
                borderColor: '#2196F3', // Azul para Neto
                backgroundColor: 'rgba(33, 150, 243, 0.5)',
                borderWidth: 3,
                tension: 0.2,
                // Opcional: mostrar como puntos grandes para diferenciar
                pointRadius: 4, 
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                text: 'Balance de Flujo de Caja Diario',
                display: true
            }
        },
        scales: {
            x: {
                type: 'time' as const, // Usar 'time' para el eje X
                display: true,
                offset: true,
                time: {
                    unit: 'day' as const,
                    tooltipFormat: 'dd MMM yyyy',
                    displayFormats: {
                        day: 'dd MMM'
                    }
                },
                title: {
                    display: true,
                    text: 'Fecha'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Monto ($)'
                }
            },
        },
    };

    if (data.length === 0) {
        return <Typography variant="h6" color="textSecondary">No hay datos de Ingresos/Egresos para el período.</Typography>;
    }

    return (
        <Box sx={{ p: 2, height: '450px' }}>
            <Line data={chartJsData} options={options} />
        </Box>
    );
};