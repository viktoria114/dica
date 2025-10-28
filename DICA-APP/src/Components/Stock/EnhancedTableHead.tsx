// Components/Stock/EnhancedTableHead.tsx
import React from "react";
import {
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  Box,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import type { Stock } from "../../types";

type Props = {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Stock
  ) => void;
  order: "asc" | "desc";
  orderBy: string;
  modoPapelera: boolean;
};

// 📋 Columnas específicas para Stock
const headCells: readonly {
  id: keyof Stock | "Detalles";
  numeric: boolean;
  label: string;
  disablePadding?: boolean; // Para controlar el padding
}[] = [
  { id: "nombre", numeric: false, label: "Producto", disablePadding: true },
  {
    id: "stock_actual",
    numeric: true,
    label: "Stock Actual",
    disablePadding: false,
  },
  {
    id: "vencimiento",
    numeric: true,
    label: "Días para vencimiento",
    disablePadding: false,
  },
  { id: "tipo", numeric: false, label: "Tipo", disablePadding: false },
  {
    id: "stock_minimo",
    numeric: true,
    label: "Stock Mínimo",
    disablePadding: false,
  },
  { id: "Detalles", numeric: false, label: "", disablePadding: false },
];

export const EnhancedTableHead: React.FC<Props> = ({
  order,
  orderBy,
  onRequestSort,
}) => {
  const createSortHandler =
    (property: keyof Stock) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={
              headCell.id === "Detalles"
                ? "center"
                : headCell.numeric
                ? "right"
                : "left"
            }
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id === "Detalles" ? (
              headCell.label
            ) : (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id as keyof Stock)}
                sx={{
                  color: orderBy === headCell.id ? "blue" : "secondary.main",
                  "&:hover": { color: "primary.main" },
                }}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "ordenado descendente"
                      : "ordenado ascendente"}
                  </Box>
                ) : null}
              </TableSortLabel>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
