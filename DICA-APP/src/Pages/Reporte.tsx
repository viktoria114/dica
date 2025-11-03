import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { useEffect } from 'react';
import { useGastos } from '../hooks/Gasto/useGastos';
import { usePagos } from '../hooks/Pago/usePagos';
import { GastosTable } from '../Components/Reporte/GastosTable';
import { PagosTable } from '../Components/Reporte/PagosTable';
import { generarBalancePDFConTabla } from '../services/pdfGenerator';

export const Reporte = ({ year, month }: { year: number, month: number }) => {
  const { gastos, loading: loadingGastos, error: errorGastos, refreshGastos } = useGastos();
  const { pagos, loading: loadingPagos, error: errorPagos, refreshPagos } = usePagos();

  useEffect(() => {
    refreshGastos(year, month);
    refreshPagos(year, month);
  }, [year, month, refreshGastos, refreshPagos]);

  const loading = loadingGastos || loadingPagos;
  const error = errorGastos || errorPagos;

  const handleDownloadPDF = () => {
    const periodo = `${year}-${String(month).padStart(2, '0')}`;
    generarBalancePDFConTabla(gastos, pagos, periodo);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          Reporte de Balance
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownloadPDF}
          disabled={loading || !!error}
        >
          Descargar PDF
        </Button>
      </Box>

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && !error && (
        <Box>
          <Typography variant="h5" gutterBottom>Gastos</Typography>
          <GastosTable gastos={gastos} />
          <Typography variant="h5" gutterBottom mt={4}>Ingresos</Typography>
          <PagosTable pagos={pagos} />
        </Box>
      )}
    </Box>
  );
};
