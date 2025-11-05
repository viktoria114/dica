/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { getProductosMasVendidos } from '../../api/reportes';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Box, Typography } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProductosChartProps {
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

// Paleta de colores para el gráfico de torta
const BACKGROUND_COLORS = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)', // Gris
    'rgba(83, 102, 255, 0.7)',  // Índigo
];

export const ProductosChart: React.FC<ProductosChartProps> = ({ fechaInicio, fechaFin }) => {
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
            const data = await getProductosMasVendidos(formattedFilters);

            const chartJsData = {
                labels: data.map((item: any) => item.nombre),
                datasets: [
                    {
                        label: 'Total Vendido (Unidades)',
                        data: data.map((item: any) => item.total_vendido), // Asumiendo que es la cantidad
                        backgroundColor: data.map((_, index) => BACKGROUND_COLORS[index % BACKGROUND_COLORS.length]),
                        borderColor: '#ffffff',
                        borderWidth: 2,
                    },
                ],
            };
            setChartData(chartJsData);
        } catch (error) {
            console.error('Error fetching productos mas vendidos:', error);
            setChartData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [formattedFilters.fecha_inicio, formattedFilters.fecha_fin]);

    if (isLoading) {
        return <Typography variant="h6" color="textSecondary">Cargando productos más vendidos...</Typography>;
    }

    if (!chartData || chartData.labels.length === 0) {
        return <Typography variant="h6" color="textSecondary">No hay datos de productos para el período seleccionado.</Typography>;
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right' as const,
            },
            title: {
                display: true,
                text: 'Distribución de Productos Más Vendidos (Unidades)'
            }
        }
    };

    return (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', height: '400px' }}>
            <Box sx={{ maxWidth: '400px', margin: 'auto' }}>
                <Pie data={chartData} options={options} />
            </Box>
        </Box>
    );
};