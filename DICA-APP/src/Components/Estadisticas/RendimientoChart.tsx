/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { getRendimientoEmpleados } from '../../api/reportes';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Box, Typography } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface RendimientoChartProps {
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

export const RendimientoChart: React.FC<RendimientoChartProps> = ({ fechaInicio, fechaFin }) => {
    const [chartData, setChartData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // 1. Formatear las fechas solo cuando cambian
    const formattedFilters = useMemo(() => {
        return {
            fecha_inicio: formatDate(fechaInicio),
            fecha_fin: formatDate(fechaFin),
        };
    }, [fechaInicio, fechaFin]);


    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await getRendimientoEmpleados(formattedFilters);

            const chartJsData = {
                labels: data.map((item: any) => item.nombre_completo),
                datasets: [
                    {
                        label: 'Pedidos Gestionados',
                        data: data.map((item: any) => item.total_pedidos_gestionados),
                        backgroundColor: 'rgba(153, 102, 255, 0.6)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1,
                    },
                ],
            };
            setChartData(chartJsData);

        } catch (error) {
            console.error('Error fetching rendimiento empleados:', error);
            setChartData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Ejecutar la llamada a la API cada vez que cambian las fechas
    useEffect(() => {
        fetchData();
    }, [formattedFilters.fecha_inicio, formattedFilters.fecha_fin]); // Dependencias del useEffect

    if (isLoading) {
        return <Typography variant="h6" color="textSecondary">Cargando rendimiento de empleados...</Typography>;
    }

    if (!chartData || chartData.labels.length === 0) {
        return <Typography variant="h6" color="textSecondary">No hay datos de rendimiento para el período seleccionado.</Typography>;
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Rendimiento de Empleados (Pedidos Gestionados)'
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

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ maxWidth: '800px', height: '400px', margin: 'auto' }}>
                <Bar data={chartData} options={options} />
            </Box>
        </Box>
    );
};