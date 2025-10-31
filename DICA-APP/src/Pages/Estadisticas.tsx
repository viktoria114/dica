import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import { VentasChart } from '../Components/Estadisticas/VentasChart';
import { ProductosChart } from '../Components/Estadisticas/ProductosChart';
import { RendimientoChart } from '../Components/Estadisticas/RendimientoChart';
import { GastosChart } from '../Components/Estadisticas/GastosChart';
import { IngresosChart } from '../Components/Estadisticas/IngresosChart';

const TabPanel = (props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component={'div'}>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

export const Estadisticas = () => {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={value} 
          onChange={handleChange} 
          aria-label="estadisticas tabs"
          indicatorColor="primary"
        >
          <Tab label="Ventas" sx={{ color: 'text.primary' }} />
          <Tab label="Ingresos" sx={{ color: 'text.primary' }} />
          <Tab label="Productos" sx={{ color: 'text.primary' }} />
          <Tab label="Rendimiento" sx={{ color: 'text.primary' }} />
          <Tab label="Gastos" sx={{ color: 'text.primary' }} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <VentasChart />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <IngresosChart />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <ProductosChart />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <RendimientoChart />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <GastosChart />
      </TabPanel>
    </Box>
  );
};
