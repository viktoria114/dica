import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { getProductosMasVendidos } from '../../api/reportes';
import { Filter } from './Filter';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Box } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

export const ProductosChart = () => {
  const [chartData, setChartData] = useState<any>(null);

  const fetchData = async (filters?: any) => {
    try {
      const data = await getProductosMasVendidos(filters);
      const chartJsData = {
        labels: data.map((item: any) => item.nombre),
        datasets: [
          {
            label: 'Productos más vendidos',
            data: data.map((item: any) => item.total_vendido),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)',
            ],
          },
        ],
      };
      setChartData(chartJsData);
    } catch (error) {
      console.error('Error fetching productos mas vendidos:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Filter onFilter={fetchData} />
      <Box sx={{ maxWidth: '600px', maxHeight: '400px', margin: 'auto' }}>
        {chartData && <Pie data={chartData} />}
      </Box>
    </div>
  );
};
