import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import { Gastos } from './Gastos';
import { Pagos } from './Pagos';
import { Reporte } from './Reporte';

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
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

export const Balance = () => {
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
          aria-label="balance tabs"
          indicatorColor="primary"
        >
          <Tab label="Gastos" sx={{ color: 'text.primary' }} />
          <Tab label="Pagos" sx={{ color: 'text.primary' }} />
          <Tab label="Reporte" sx={{ color: 'text.primary' }} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Gastos />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Pagos />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Reporte />
      </TabPanel>
    </Box>
  );
};
