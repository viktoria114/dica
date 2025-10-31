import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { getVentasDiarias } from '../../api/reportes';
import { Filter } from './Filter';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Box } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const VentasChart = () => {
  const [chartData, setChartData] = useState<any>(null);

  const fetchData = async (filters?: any) => {
    try {
      const data = await getVentasDiarias(filters);
      const chartJsData = {
        labels: data.map((item: any) => new Date(item.fecha).toLocaleDateString()),
        datasets: [
          {
            label: 'Ventas Diarias',
            data: data.map((item: any) => item.total_ventas),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          },
        ],
      };
      setChartData(chartJsData);
    } catch (error) {
      console.error('Error fetching ventas diarias:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Filter onFilter={fetchData} />
      <Box sx={{ maxWidth: '600px', maxHeight: '400px', margin: 'auto' }}>
        {chartData && <Bar data={chartData} />}
      </Box>
    </div>
  );
};
