import React, { useState } from 'react';
import { Tabs, Tab, Box, Select, MenuItem, FormControl, InputLabel, Container } from '@mui/material';
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
          {children}
        </Box>
      )}
    </div>
  );
};

export const Balance = () => {
  const [value, setValue] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Container>
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

      <Box display="flex" gap={2} p={2}>
        <FormControl>
          <InputLabel>Año</InputLabel>
          <Select value={year} onChange={(e) => setYear(e.target.value as number)}>
            {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel>Mes</InputLabel>
          <Select value={month} onChange={(e) => setMonth(e.target.value as number)}>
            {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <TabPanel value={value} index={0}>
        <Gastos year={year} month={month} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Pagos year={year} month={month} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Reporte year={year} month={month} />
      </TabPanel>
    </Box>
    </Container>
  );
};
