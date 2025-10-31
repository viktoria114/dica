import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { getReporteGastos } from '../../api/reportes';
import { Filter } from './Filter';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Box } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

export const GastosChart = () => {
  const [chartData, setChartData] = useState<any>(null);

  const fetchData = async (filters?: any) => {
    try {
      const data = await getReporteGastos(filters);
      const chartJsData = {
        labels: data.map((item: any) => item.categoria),
        datasets: [
          {
            label: 'Gastos por Categoría',
            data: data.map((item: any) => item.total_gastos),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
          },
        ],
      };
      setChartData(chartJsData);
    } catch (error) {
      console.error('Error fetching reporte gastos:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Filter onFilter={fetchData} />
      <Box sx={{ maxWidth: '600px', maxHeight: '400px', margin: 'auto' }}>
        {chartData && <Doughnut data={chartData} />}
      </Box>
    </div>
  );
};
