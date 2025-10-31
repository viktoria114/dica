import React from 'react';
import { TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface FilterProps {
  onFilter: (filters: any) => void;
}

export const Filter: React.FC<FilterProps> = ({ onFilter }) => {
  const [filters, setFilters] = React.useState<any>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setFilters((prevFilters: any) => ({ ...prevFilters, [name as string]: value }));
  };

  const handleFilter = () => {
    onFilter(filters);
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={2}>
        <TextField
          name="anio"
          label="Año"
          type="number"
          fullWidth
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={2}>
        <TextField
          name="mes"
          label="Mes"
          type="number"
          fullWidth
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={2}>
        <TextField
          name="semana_anio"
          label="Semana del Año"
          type="number"
          fullWidth
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={2}>
        <FormControl fullWidth>
          <InputLabel>Trimestre</InputLabel>
          <Select
            name="trimestre"
            value={filters.trimestre || ''}
            onChange={handleChange}
          >
            <MenuItem value={1}>Q1</MenuItem>
            <MenuItem value={2}>Q2</MenuItem>
            <MenuItem value={3}>Q3</MenuItem>
            <MenuItem value={4}>Q4</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={2}>
        <Button variant="contained" onClick={handleFilter} fullWidth>
          Filtrar
        </Button>
      </Grid>
    </Grid>
  );
};
