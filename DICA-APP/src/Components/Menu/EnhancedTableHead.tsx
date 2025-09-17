import React from "react";
import {
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  Checkbox,
  Box,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import type { ItemsMenu } from "../../types";

// Si tienes el tipo Order en otro archivo, impórtalo.
// Por ejemplo:
// import type { Order } from "./types";

type Props = {
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof ItemsMenu
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: "asc" | "desc";
  orderBy: string;
  rowCount: number;
  modoPapelera: boolean;
};

// Ejemplo de tus columnas, puedes importarlo si lo tienes en otro archivo
const headCells: readonly {
  id: keyof ItemsMenu | "acciones";
  numeric: boolean;
  label: string;
}[] = [
  { id: "nombre", numeric: false, label: "Producto" },
  { id: "categoria", numeric: false, label: "Categoría" },
  { id: "precio", numeric: true, label: "Precio ($)" },
  { id: "descripcion", numeric: false, label: "Descripción" },
  { id: "acciones", numeric: false, label: "Acciones" },
];

export const EnhancedTableHead: React.FC<Props> = ({
  onSelectAllClick,
  order,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
  modoPapelera,
}) => {
  const createSortHandler =
    (property: keyof ItemsMenu) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };
    

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
           disabled={modoPapelera}
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ "aria-label": "select all items" }}
             sx={{color:"secondary.main"}}
          />
        </TableCell>

        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={
              headCell.id === "acciones"
                ? "center"
                : headCell.numeric
                ? "right"
                : "left"
            }
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id === "acciones" ? (
              headCell.label
            ) : (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id as keyof ItemsMenu)}
                 sx={{
    color: orderBy === headCell.id ? 'blue' : 'secondary.main',
    '&:hover': { color: 'primary.main' }
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

