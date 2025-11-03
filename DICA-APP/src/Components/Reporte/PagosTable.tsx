import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { type Pago } from "../../types";

interface PagosTableProps {
  pagos: Pago[];
}

export const PagosTable = ({ pagos }: PagosTableProps) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Descripción</TableCell>
            <TableCell>Método de pago</TableCell>
            <TableCell>Monto</TableCell>
            <TableCell>Fecha</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pagos.map((pago) => (
            <TableRow key={pago.id}>
              <TableCell>{`Ingreso por venta (pedido #${pago.fk_pedido})`}</TableCell>
              <TableCell>{pago.metodo_pago}</TableCell>
              <TableCell style={{ color: 'green' }}>${pago.monto}</TableCell>
              <TableCell>{new Date(pago.fk_fecha).toLocaleDateString("es-AR")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};