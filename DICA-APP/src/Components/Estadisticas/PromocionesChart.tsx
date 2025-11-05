
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { getPromocionesMasPedidas } from '../../api/reportes'; 
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Box, Typography } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PromocionesChartProps {
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

export const PromocionesChart: React.FC<PromocionesChartProps> = ({ fechaInicio, fechaFin }) => {
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
            // Asumiendo que la data es: [{ nombre: 'Promo 2x1', veces_usada: 45 }, ...]
            const data = await getPromocionesMasPedidas(formattedFilters); 

            const chartJsData = {
                labels: data.map((item: any) => item.nombre),
                datasets: [
                    {
                        label: 'Veces Aplicada',
                        data: data.map((item: any) => item.veces_usada), 
                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            };
            setChartData(chartJsData);
        } catch (error) {
            console.error('Error fetching promociones mas pedidas:', error);
            setChartData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [formattedFilters.fecha_inicio, formattedFilters.fecha_fin]);

    if (isLoading) {
        return <Typography variant="h6" color="textSecondary">Cargando promociones más pedidas...</Typography>;
    }

    if (!chartData || chartData.labels.length === 0) {
        return <Typography variant="h6" color="textSecondary">No hay datos de promociones para el período seleccionado.</Typography>;
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Ranking de Promociones Más Vendidas'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Vendida'
                }
            }
        }
    };

    return (
        <Box sx={{ p: 2, height: '400px' }}>
            <Bar data={chartData} options={options} />
        </Box>
    );
};