import * as React from "react";
import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "@mui/utils";
import type { Pago } from "../../types";

type Order = "asc" | "desc";

interface HeadCell {
  disablePadding: boolean;
  id: keyof Pago;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: "monto",
    numeric: true,
    disablePadding: false,
    label: "Monto",
  },
  {
    id: "metodo_pago",
    numeric: false,
    disablePadding: false,
    label: "Método de Pago",
  },
  {
    id: "validado",
    numeric: false,
    disablePadding: false,
    label: "Validado",
  },
  {
    id: "fk_pedido",
    numeric: true,
    disablePadding: false,
    label: "ID Pedido",
  },
  {
    id: "fk_fecha",
    numeric: false,
    disablePadding: false,
    label: "Fecha",
  },
  {
    id: "hora",
    numeric: false,
    disablePadding: false,
    label: "Hora",
  },
];

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Pago) => void;
  order: Order;
  orderBy: string;
}

export const EnhancedTableHead = (props: EnhancedTableProps) => {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: keyof Pago) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell />
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell align="center">Acciones</TableCell>
      </TableRow>
    </TableHead>
  );
};
