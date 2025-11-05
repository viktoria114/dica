/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { getReporteGastos } from '../../api/reportes';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Box, Typography } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

interface GastosChartProps {
    fechaInicio: Date | null;
    fechaFin: Date | null;
}

const formatDate = (date: Date | null) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Paleta de colores más profesional
const BACKGROUND_COLORS = [
    'rgba(255, 99, 132, 0.7)',  // Rojo
    'rgba(54, 162, 235, 0.7)',  // Azul
    'rgba(255, 206, 86, 0.7)',  // Amarillo
    'rgba(75, 192, 192, 0.7)',  // Turquesa
    'rgba(153, 102, 255, 0.7)', // Púrpura
    'rgba(255, 159, 64, 0.7)',  // Naranja
];


export const GastosChart: React.FC<GastosChartProps> = ({ fechaInicio, fechaFin }) => {
    const [chartData, setChartData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Formatear las fechas solo cuando cambian
    const formattedFilters = useMemo(() => {
        return {
            fecha_inicio: formatDate(fechaInicio),
            fecha_fin: formatDate(fechaFin),
        };
    }, [fechaInicio, fechaFin]);


    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Usamos la función de API existente
            const data = await getReporteGastos(formattedFilters);

            const chartJsData = {
                labels: data.map((item: any) => item.categoria),
                datasets: [
                    {
                        label: 'Total Gastado ($)',
                        data: data.map((item: any) => item.total_gastos),
                        backgroundColor: data.map((_, index) => BACKGROUND_COLORS[index % BACKGROUND_COLORS.length]),
                        borderColor: '#ffffff',
                        borderWidth: 2,
                    },
                ],
            };
            setChartData(chartJsData);

        } catch (error) {
            console.error('Error fetching reporte gastos:', error);
            setChartData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Ejecutar la llamada a la API cada vez que cambian las fechas
    useEffect(() => {
        fetchData();
    }, [formattedFilters.fecha_inicio, formattedFilters.fecha_fin]);

    if (isLoading) {
        return <Typography variant="h6" color="textSecondary">Cargando distribución de gastos...</Typography>;
    }

    if (!chartData || chartData.labels.length === 0) {
        return <Typography variant="h6" color="textSecondary">No hay gastos registrados para el período seleccionado.</Typography>;
    }
    
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right' as const,
            },
            title: {
                display: true,
                text: 'Distribución de Gastos por Categoría',
                font: {
                    size: 16
                }
            }
        },
        cutout: '75%', // Hace que sea un gráfico de dona (doughnut)
    };

    return (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', height: '400px' }}>
            <Box sx={{ maxWidth: '400px', margin: 'auto' }}>
                <Doughnut data={chartData} options={options} />
            </Box>
        </Box>
    );
};