
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { type Gasto, type Pago } from "../../types";

interface BalanceTableProps {
  gastos: Gasto[];
  pagos: Pago[];
}

export const BalanceTable = ({ gastos, pagos }: BalanceTableProps) => {
  const rows = [
    ...gastos.map((g) => ({
      monto: g.monto,
      tipo: "Egreso",
      fecha: new Date(g.fecha).toLocaleDateString("es-AR"),
    })),
    ...pagos.map((p) => ({
      monto: p.monto,
      tipo: "Ingreso",
      fecha: new Date(p.fk_fecha).toLocaleDateString("es-AR"),
    })),
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const totalIngresos = pagos.reduce((acc, pago) => acc + Number(pago.monto), 0);
  const totalEgresos = gastos.reduce((acc, gasto) => acc + Number(gasto.monto), 0);
  const balanceNeto = totalIngresos - totalEgresos;

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Monto</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell
                  style={{ color: row.tipo === "Ingreso" ? "green" : "red" }}
                >
                  ${row.monto}
                </TableCell>
                <TableCell>{row.tipo}</TableCell>
                <TableCell>{row.fecha}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={2} p={2} component={Paper}>
        <Typography variant="h6">Resumen del Balance</Typography>
        <Typography>Total Ingresos: ${totalIngresos.toFixed(2)}</Typography>
        <Typography>Total Egresos: ${totalEgresos.toFixed(2)}</Typography>
        <Typography variant="h6" style={{ color: balanceNeto > 0 ? "green" : "red" }}>
          Balance Neto: ${balanceNeto.toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );
};
