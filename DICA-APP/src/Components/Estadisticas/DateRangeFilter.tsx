import React, { useState } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { Button, Grid } from '@mui/material';

interface DateRangeFilterProps {
  onFilter: (filters: { fecha_inicio: Date | null; fecha_fin: Date | null }) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ onFilter }) => {
  const [fecha_inicio, setFechaInicio] = useState<Date | null>(null);
  const [fecha_fin, setFechaFin] = useState<Date | null>(null);

  const handleFilter = () => {
    onFilter({ fecha_inicio, fecha_fin });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <DatePicker
            label="Fecha de inicio"
            value={fecha_inicio}
            onChange={setFechaInicio}
            format="dd/MM/yy"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <DatePicker
            label="Fecha de fin"
            value={fecha_fin}
            onChange={setFechaFin}
            format="dd/MM/yy"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button variant="contained" onClick={handleFilter} fullWidth>
            Filtrar
          </Button>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};
