// Menu.tsx
import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';   // ✅ nuevo
import DeleteIcon from '@mui/icons-material/Delete'; // ✅ nuevo
import {  Container } from '@mui/material';
import { TextFieldSearchBar } from '../Components/TextFieldSearchBar';
import type { ItemsMenu } from '../types';
import { EnhancedTableHead } from '../Components/Menu/EnhancedTableHead';
import { EnhancedTableToolbar } from '../Components/Menu/EnhancedTableToolbar';
import { Pagination } from '../Components/common/Pagination';

function createMenu(
  id: number,
  nombre: string,
  precio: number,
  descripcion: string,
  categoria: string,
  visibilidad: boolean,
): ItemsMenu {
  return { id, nombre, precio, descripcion, categoria, visibilidad };
}

const baseRows: ItemsMenu[] = [
  createMenu(1, 'Cheeseburger 🍔', 1200, 'hamburguesa con queso entre dos panes de papa', 'Hamburguesa', true),
  createMenu(2, 'Papas fritas 🍟', 800, 'papas crocantes', 'Snack', true),
  createMenu(3, 'Nuggets (6u) 🍗', 950, 'pollo rebozado', 'Snack', true),
  createMenu(4, 'Coca-Cola 🥤', 600, 'bebida gaseosa', 'Bebida', true),
  createMenu(5, 'Pizza slice 🍕', 1100, 'pizza con tomate y jamon', 'Snack', false),
  createMenu(6, 'Combo Doble Bacon 🥓', 2200, 'hamburguesa doble con bacon y queso', 'Hamburguesa', true),
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof ItemsMenu>(
  order: Order,
  orderBy: Key,
): (a: ItemsMenu, b: ItemsMenu) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}


export const Menu = () => {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof ItemsMenu>('precio');
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
   const rowsPerPageOptions:number[] = [5, 10, 25]

    const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null);

  const [filteredRows, setFilteredRows] = React.useState<ItemsMenu[]>(baseRows);

   const handleCategoryClick = (cat: string | null) => {
    setCategoryFilter(cat);
    if (!cat) {
      setFilteredRows(baseRows);          // sin filtro = todos
    } else {
      setFilteredRows(baseRows.filter((row) => row.categoria === cat));
    }
    setPage(0); // reiniciar a la primera página
  };

  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: keyof ItemsMenu) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredRows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (_event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedIndex === -1) newSelected = newSelected.concat(selected, id);
    else if (selectedIndex === 0) newSelected = newSelected.concat(selected.slice(1));
    else if (selectedIndex === selected.length - 1) newSelected = newSelected.concat(selected.slice(0, -1));
    else if (selectedIndex > 0) newSelected = newSelected.concat(
      selected.slice(0, selectedIndex),
      selected.slice(selectedIndex + 1),
    );

    setSelected(newSelected);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredRows.length) : 0;

  const visibleRows = React.useMemo(
    () => [...filteredRows].sort(getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, filteredRows],
  );

  return (
    <Container>
      {/* 🔎 Buscador conectado */}
      <TextFieldSearchBar<ItemsMenu>
        baseList={baseRows}
        getLabel={(item) => item.nombre}
        placeholder={"Buscar menús por nombre..."}
        onResults={setFilteredRows}
        onAdd={() => console.log("Nuevo menú")}
        onShowInvisibles={() => console.log("Ver items borrados")}
        disableAdd={false}
        papeleraLabel={"Papelera"}
      />

      <Box sx={{ width: '100%' }}>
        <Paper
          sx={{
            width: '100%',
            mb: 2,
            backgroundColor: 'transparent',
            boxShadow: 'none',
            backdropFilter: 'blur(10px)',
          }}
        >
          <EnhancedTableToolbar numSelected={selected.length}   categoryFilter={categoryFilter}
  onCategoryClick={handleCategoryClick}/>
          <TableContainer>
            <Table sx={{ minWidth: 750 }} size={dense ? 'small' : 'medium'}>
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={filteredRows.length}
              />
              <TableBody>
                {visibleRows.map((row, index) => {
                  const isItemSelected = selected.includes(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox color="primary" checked={isItemSelected} inputProps={{ 'aria-labelledby': labelId }}  sx={{color:"secondary.main"}} />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row" padding="none">
                        {row.nombre}
                      </TableCell>
                      <TableCell align="left">{row.categoria}</TableCell>
                      <TableCell align="right">${row.precio}</TableCell>
                      <TableCell align="left">{row.descripcion}</TableCell>

                      {/* ✅ Nueva columna Acciones */}
                      <TableCell align="center">
                        <IconButton size="small" color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination
  page={page}
  setPage={setPage}
  rowsPerPage={rowsPerPage}
  setRowsPerPage={setRowsPerPage}
  count={filteredRows.length}
  rowsPerPageOptions={rowsPerPageOptions}
/>

        </Paper>
      </Box>
    </Container>
  );
};
