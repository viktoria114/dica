

import { Button, Box, Typography } from '@mui/material';
import { useGastos } from '../hooks/useGastos';
import { usePagos } from '../hooks/usePagos';
import { generarBalancePDF } from '../services/pdfGenerator';

export const Reporte = () => {
  const { gastos } = useGastos();
  const { pagos } = usePagos();

  const handleGenerateReport = async () => {
    const totalIngresos = pagos.reduce((acc, pago) => acc + parseFloat(pago.monto), 0);
    const totalEgresos = gastos.reduce((acc, gasto) => acc + parseFloat(gasto.monto), 0);

    const datos = {
      ingresos: pagos.map(p => ({ descripcion: p.metodo_pago, monto: parseFloat(p.monto) })),
      egresos: gastos.map(g => ({ descripcion: g.descripcion, monto: parseFloat(g.monto) })),
      totalIngresos,
      totalEgresos,
    };

    await generarBalancePDF(datos, 'mensual');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Generar Reporte de Balance
      </Typography>
      <Button variant="contained" color="primary" onClick={handleGenerateReport}>
        Calcular Balance y Generar PDF
      </Button>
    </Box>
  );
};
