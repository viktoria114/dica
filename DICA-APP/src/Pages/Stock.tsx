import * as React from "react";
import {
  Box,
  Button,
  Container,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import type { Stock } from "../types";
import { useStock } from "../hooks/useStock";
import { EnhancedTableHead } from "../Components/Stock/EnhancedTableHead";

/*const ejemplo: Stock[] = [
  {
    id: 1,
    nombre: "Pan",
    stock_actual: 6,
    vencimiento: 5,
    stock_minimo: 3,
    tipo: "PERECEDERO",
    medida: "KG",
    visibilidad: true,
  },
];*/

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

type Order = "asc" | "desc";

function getComparator<Key extends keyof Stock>(
  order: Order,
  orderBy: Key
): (a: Stock, b: Stock) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export const Stock_1 = () => {
  const { stock, loading, error, modoPapelera } = useStock();
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof Stock>("stock_actual");

  React.useEffect(() => {
    setFilteredRows(stock);
  }, [stock]);

  const [filteredRows, setFilteredRows] = React.useState<Stock[]>(stock);

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: keyof Stock
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  return (
    <>
      {loading && <LinearProgress color="inherit" />}
      {error && <p>{error}</p>}

      <Container>
        <Box sx={{ width: "100%" }}>
          <Paper
            sx={{
              width: "100%",
              mb: 2,
              backgroundColor: "transparent",
              boxShadow: "none",
              backdropFilter: "blur(10px)",
            }}
          >
            <TableContainer>
              <Table sx={{ minWidth: 750 }}>
                <EnhancedTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                  modoPapelera={modoPapelera}
                />

                <TableBody>
                  {stock.map((row: Stock) => (
                    <TableRow key={row.id}>
                      {/* 📌 IMPORTANTE: Mismo padding="none" que el header */}
                      <TableCell component="th" scope="row" padding="none">
                        {row.nombre}
                      </TableCell>

                      {/* ✅ Alineadas a la DERECHA (numeric) con la medida */}
                      <TableCell align="right">
                        {row.stock_actual} {row.medida}
                      </TableCell>

                      <TableCell align="right">{row.vencimiento}</TableCell>

                      {/* ✅ Alineada a la IZQUIERDA (texto) */}
                      <TableCell align="left">{row.tipo}</TableCell>

                      {/* ✅ Alineada a la DERECHA (numeric) con la medida */}
                      <TableCell align="right">
                        {row.stock_minimo} {row.medida}
                      </TableCell>

                      {/* ✅ Centrada (acciones) */}
                      <TableCell align="center">
                        <Button size="small" variant="contained">
                          Ver Info
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Container>
    </>
  );
};
