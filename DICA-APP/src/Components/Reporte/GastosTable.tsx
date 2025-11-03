import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { type Gasto } from "../../types";

interface GastosTableProps {
  gastos: Gasto[];
}

export const GastosTable = ({ gastos }: GastosTableProps) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Descripción</TableCell>
            <TableCell>Categoría</TableCell>
            <TableCell>Monto</TableCell>
            <TableCell>Fecha</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {gastos.map((gasto) => (
            <TableRow key={gasto.id}>
              <TableCell>{gasto.descripcion}</TableCell>
              <TableCell>{gasto.categoria}</TableCell>
              <TableCell style={{ color: 'red' }}>${gasto.monto}</TableCell>
              <TableCell>{new Date(gasto.fecha).toLocaleDateString("es-AR")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};