import React from 'react';
import { TableHead, TableRow, TableCell, TableSortLabel } from '@mui/material';
import type { Gasto } from '../../types';

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Gasto;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  { id: 'monto', numeric: true, label: 'Monto' },
  { id: 'categoria', numeric: false, label: 'Categoría' },
  { id: 'metodo_de_pago', numeric: false, label: 'Método de Pago' },
  { id: 'descripcion', numeric: false, label: 'Descripción' },
  { id: 'fecha', numeric: false, label: 'Fecha' },
];

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Gasto) => void;
  order: Order;
  orderBy: string;
}

export const EnhancedTableHead = (props: EnhancedTableProps) => {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: keyof Gasto) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell />
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell />
      </TableRow>
    </TableHead>
  );
};
