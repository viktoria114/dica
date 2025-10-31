import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { getRendimientoEmpleados } from '../../api/reportes';
import { Filter } from './Filter';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Box } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const RendimientoChart = () => {
  const [chartData, setChartData] = useState<any>(null);

  const fetchData = async (filters?: any) => {
    try {
      const data = await getRendimientoEmpleados(filters);
      const chartJsData = {
        labels: data.map((item: any) => item.nombre_completo),
        datasets: [
          {
            label: 'Pedidos Gestionados',
            data: data.map((item: any) => item.total_pedidos_gestionados),
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
          },
        ],
      };
      setChartData(chartJsData);
    } catch (error) {
      console.error('Error fetching rendimiento empleados:', error);
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
