/* eslint-disable @typescript-eslint/no-explicit-any */
import  { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { getIngresosDiarios } from '../../api/reportes';
import { DateRangeFilter } from './DateRangeFilter';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Box } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const formatDate = (date: Date | null) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const IngresosChart = () => {
  const [chartData, setChartData] = useState<any>(null);

  const fetchData = async (filters?: { fecha_inicio: Date | null; fecha_fin: Date | null }) => {
    try {
      const formattedFilters = filters
        ? {
            fecha_inicio: formatDate(filters.fecha_inicio),
            fecha_fin: formatDate(filters.fecha_fin),
          }
        : {};
      const data = await getIngresosDiarios(formattedFilters);
      const chartJsData = {
        labels: data.map((item: any) => new Date(item.fecha).toLocaleDateString()),
        datasets: [
          {
            label: 'Ingresos Diarios',
            data: data.map((item: any) => item.total_ventas),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          },
        ],
      };
      setChartData(chartJsData);
    } catch (error) {
      console.error('Error fetching ingresos diarios:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <DateRangeFilter onFilter={fetchData} />
      <Box sx={{ maxWidth: '600px', maxHeight: '400px', margin: 'auto' }}>
        {chartData && <Bar data={chartData} />}
      </Box>
    </div>
  );
};
