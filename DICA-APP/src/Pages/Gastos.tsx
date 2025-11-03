import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button, Container, LinearProgress, List, ListItem, ListItemText } from "@mui/material";
import { SearchBar } from "../Components/common/SearchBar";
import type { Gasto } from "../types";
import { EnhancedTableHead } from "../Components/Gastos/EnhancedTableHead";
import { EnhancedTableToolbar } from "../Components/Gastos/EnhancedTableToolbar";
import { Paginacion } from "../Components/common/Paginacion";
import { useGastos } from "../hooks/Gasto/useGastos";
import InfoIcon from "@mui/icons-material/Info";
import { useCallback, useState } from "react";
import { ModalBase } from "../Components/common/ModalBase";
import { useGastoForm } from "../hooks//Gasto/useFormGasto.tsx";
import { useStock } from "../hooks/Stock/useStock";
import { useActualizarGasto } from "../hooks//Gasto/useActualizarGasto";
import { useBorrarGasto } from "../hooks//Gasto/useBorrarGasto";
import { StockSelectorModal } from "../Components/Gastos/StockSelectorModal";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

type Order = "asc" | "desc";

function getComparator<Key extends keyof Gasto>(
  order: Order,
  orderBy: Key
): (a: Gasto, b: Gasto) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export const Gastos = ({ year, month }: { year: number, month: number }) => {
  const { gastos, loading, error, refreshGastos } = useGastos();
  const { stock } = useStock();
  const { actualizar, isUpdating } = useActualizarGasto(() => {
    refreshGastos(year, month);
    setOpenEdit(false);
  });
  const { borrar, isDeleting } = useBorrarGasto(() => {
    refreshGastos(year, month);
    setOpenEdit(false);
  });
  const {
    open,
    gastoFields,
    setOpen,
    isSaving,
    formValues,
    setFormValues,
    formErrors,
    handleChange,
    handleSubmit,
  } = useGastoForm(() => refreshGastos(year, month), stock);

  const fieldsWithStock = React.useMemo(() => { return gastoFields }, [gastoFields]);

  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof Gasto>("monto");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [openEdit, setOpenEdit] = useState(false);
  const [isStockSelectorOpen, setStockSelectorOpen] = useState(false);

  React.useEffect(() => {
    refreshGastos(year, month);
  }, [year, month, refreshGastos]);

  React.useEffect(() => {
    setFilteredRows(gastos);
  }, [gastos]);

  const [filteredRows, setFilteredRows] = React.useState<Gasto[]>([]);

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: keyof Gasto
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredRows.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      [...filteredRows]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, filteredRows]
  );

  const handleAdd = useCallback(() => {
    setFormValues({
      id: null,
      monto: 0,
      categoria: "",
      metodo_de_pago: "Efectivo",
      descripcion: "",
      fecha: new Date(),
      fk_registro_stock: null,
      stockItems: [],
    });
    setOpen(true);
  }, [setFormValues, setOpen]);

  const handleEdit = (gasto: Gasto) => {
    setFormValues(gasto);
    setOpenEdit(true);
  };

  const displayFields = React.useMemo(() => {
    if (!formValues) return [];
    const fields = gastoFields
      .map(field => {
        let value: string | number | null = formValues[field.name] as any;
        if (field.name === 'fecha' && value) {
          value = new Date(value).toLocaleDateString('es-AR');
        } else if (field.name === 'monto' && value) {
          value = `$${value}`;
        }
        return {
          label: field.label,
          value: value !== null && value !== undefined ? String(value) : '-',
        };
      });

    if (formValues.stockItems && formValues.stockItems.length > 0) {
      fields.push({
        label: "Stock Asociado",
        value: formValues.stockItems.map(item => {
          const stockItem = stock.find(s => s.id === item.id_stock);
          return `${stockItem?.nombre || 'Desconocido'} (x${item.cantidad})`;
        }).join(', '),
      });
    }
    return fields;
  }, [formValues, gastoFields, stock]);

  return (
    <>
      {loading && <LinearProgress color="inherit" />}
      {error && <p>{error}</p>}
      <Container>
        <SearchBar<Gasto>
          baseList={gastos}
          getLabel={(item) => item.descripcion}
          placeholder={"Buscar gastos por descripción..."}
          onResults={setFilteredRows}
          onAdd={handleAdd}
        />

        <Box sx={{ width: "100%" }}>
          <Paper sx={{ width: "100%", mb: 2 }}>
            <EnhancedTableToolbar />
            <TableContainer>
              <Table sx={{ minWidth: 750 }} size="medium">
                <EnhancedTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {visibleRows.map((row) => (
                    <TableRow hover key={row.id}>
                      <TableCell />
                      <TableCell align="right">${row.monto}</TableCell>
                      <TableCell align="left">{row.categoria}</TableCell>
                      <TableCell align="left">{row.metodo_de_pago}</TableCell>
                      <TableCell align="left">{row.descripcion}</TableCell>
                      <TableCell align="left">{new Date(row.fecha).toLocaleDateString('es-AR')}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleEdit(row)}
                          endIcon={<InfoIcon />}
                        >
                          Ver Info
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Paginacion
              page={page}
              setPage={setPage}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
              count={filteredRows.length}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Paper>
        </Box>
      </Container>

      <ModalBase
        open={open}
        entityName="Gasto"
        modo="crear"
        fields={fieldsWithStock}
        values={formValues}
        formErrors={formErrors}
        handleChange={handleChange}
        handleGuardar={handleSubmit}
        handleClose={() => setOpen(false)}
        isSaving={isSaving}
      >
        {formValues.categoria === 'insumos' && <Button onClick={() => setStockSelectorOpen(true)}>Seleccionar Stock</Button>}
        <List>
          {formValues.stockItems?.map((item) => {
            const stockItem = stock.find((s) => s.id === item.id_stock);
            return (
              <ListItem key={item.id_stock}>
                <ListItemText primary={`${stockItem?.nombre || 'Desconocido'} (x${item.cantidad})`} />
              </ListItem>
            );
          })}
        </List>
      </ModalBase>

      <ModalBase
        open={openEdit}
        entityName="Gasto"
        modo="editar"
        fields={fieldsWithStock}
        values={formValues}
        formErrors={formErrors}
        handleChange={handleChange}
        handleGuardar={() => actualizar(formValues.id!, formValues)}
        handleClose={() => setOpenEdit(false)}
        isSaving={isUpdating}
        borrar={(id) => borrar(Number(id))}
        isDeleting={isDeleting}
        displayFields={displayFields}
        idField="id"
      >
        <List>
          {formValues.stockItems?.map((item) => {
            const stockItem = stock.find((s) => s.id === item.id_stock);
            return (
              <ListItem key={item.id_stock}>
                <ListItemText primary={`${stockItem?.nombre || 'Desconocido'} (x${item.cantidad})`} />
              </ListItem>
            );
          })}
        </List>
        {formValues.categoria === 'insumos' && <Button onClick={() => setStockSelectorOpen(true)}>Seleccionar Stock</Button>}
      </ModalBase>

      <StockSelectorModal
        open={isStockSelectorOpen}
        onClose={() => setStockSelectorOpen(false)}
        availableStocks={stock}
        selectedItems={formValues.stockItems ?? []}
        onChange={(newItems) => handleChange("stockItems", newItems)}
      />
    </>
  );
};
