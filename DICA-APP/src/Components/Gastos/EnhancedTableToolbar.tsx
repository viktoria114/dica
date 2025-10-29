import { Toolbar, Typography } from '@mui/material';

export const EnhancedTableToolbar = () => {
  return (
    <Toolbar>
      <Typography variant="h6" component="div" sx={{ flex: '1 1 100%' }}>
        Gastos
      </Typography>
    </Toolbar>
  );
};
