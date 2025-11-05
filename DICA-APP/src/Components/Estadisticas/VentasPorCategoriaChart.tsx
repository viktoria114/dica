/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { getVentasPorCategoria } from '../../api/reportes';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Box, Typography } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

interface VentasPorCategoriaChartProps {
    fechaInicio: Date | null;
    fechaFin: Date | null;
}

const formatDate = (date: Date | null) => {
    // (Misma función formatDate que ya tienes)
    if (!date) return null;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const BACKGROUND_COLORS = [
    'rgba(60, 179, 113, 0.7)', // Verde medio
    'rgba(255, 165, 0, 0.7)',  // Naranja
    'rgba(100, 149, 237, 0.7)',// Azul Acero
    'rgba(238, 130, 238, 0.7)',// Violeta
    'rgba(128, 0, 0, 0.7)',    // Borgoña
    'rgba(0, 128, 128, 0.7)',  // Teal
];


export const VentasPorCategoriaChart: React.FC<VentasPorCategoriaChartProps> = ({ fechaInicio, fechaFin }) => {
    const [chartData, setChartData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const formattedFilters = useMemo(() => {
        return {
            fecha_inicio: formatDate(fechaInicio),
            fecha_fin: formatDate(fechaFin),
        };
    }, [fechaInicio, fechaFin]);


    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await getVentasPorCategoria(formattedFilters); 

            const chartJsData = {
                labels: data.map((item: any) => item.categoria),
                datasets: [
                    {
                        label: 'Monto Vendido ($)',
                        // Usamos monto_vendido para la distribución de ingresos
                        data: data.map((item: any) => parseFloat(item.monto_vendido)), 
                        backgroundColor: data.map((_, index) => BACKGROUND_COLORS[index % BACKGROUND_COLORS.length]),
                        borderColor: '#ffffff',
                        borderWidth: 2,
                    },
                ],
            };
            setChartData(chartJsData);
        } catch (error) {
            console.error('Error fetching ventas por categoria:', error);
            setChartData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [formattedFilters.fecha_inicio, formattedFilters.fecha_fin]);


    if (!chartData || chartData.labels.length === 0) {
        return <Typography variant="h6" color="textSecondary">No hay datos de ventas por categoría para el período.</Typography>;
    }
    
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right' as const,
            },
            title: {
                display: true,
                text: 'Distribución de Ingresos por Categoría de Menú'
            }
        },
        cutout: '60%', 
    };

    return (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', height: '400px' }}>
            <Box sx={{ maxWidth: '450px', margin: 'auto' }}>
                <Doughnut data={chartData} options={options} />
            </Box>
        </Box>
    );
};