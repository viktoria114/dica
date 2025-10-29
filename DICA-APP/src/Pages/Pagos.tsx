import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button, Container, LinearProgress, Checkbox } from "@mui/material";
import { SearchBar } from "../Components/common/SearchBar";
import type { Pago } from "../types";
import { EnhancedTableHead } from "../Components/Pagos/EnhancedTableHead";
import { EnhancedTableToolbar } from "../Components/Pagos/EnhancedTableToolbar";
import { Paginacion } from "../Components/common/Paginacion";
import { usePagos } from "../hooks/usePagos";
import InfoIcon from "@mui/icons-material/Info";
import { useCallback, useState } from "react";
import { ModalBase } from "../Components/common/ModalBase";
import { usePagoForm } from "../hooks/useFormPago.tsx";
import { useActualizarPago } from "../hooks/useActualizarPago";
import { useBorrarPago } from "../hooks/useBorrarPago";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

type Order = "asc" | "desc";

function getComparator<Key extends keyof Pago>(
  order: Order,
  orderBy: Key
): (a: Pago, b: Pago) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export const Pagos = () => {
  const { pagos, loading, error, refreshPagos } = usePagos();
  const { actualizar, isUpdating } = useActualizarPago(() => {
    refreshPagos();
    setOpenEdit(false);
  });
  const { borrar, isDeleting } = useBorrarPago(() => {
    refreshPagos();
    setOpenEdit(false);
  });
  const {
    open,
    pagoFields,
    setOpen,
    isSaving,
    formValues,
    setFormValues,
    formErrors,
    handleChange,
    handleSubmit,
  } = usePagoForm(refreshPagos);

  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof Pago>("monto");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [openEdit, setOpenEdit] = useState(false);

  React.useEffect(() => {
    setFilteredRows(pagos);
  }, [pagos]);

  const [filteredRows, setFilteredRows] = React.useState<Pago[]>([]);

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: keyof Pago
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
      metodo_pago: "Efectivo",
      comprobante_pago: "",
      validado: false,
      fk_pedido: null,
      fk_fecha: new Date(),
      hora: "",
    });
    setOpen(true);
  }, [setFormValues, setOpen]);

  const handleEdit = (pago: Pago) => {
    setFormValues(pago);
    setOpenEdit(true);
  };

  const displayFields = React.useMemo(() => {
    if (!formValues) return [];
    const fields = pagoFields
      .map(field => {
        let value: string | number | boolean | null = formValues[field.name] as any;
        if (field.name === 'fk_fecha' && value) {
          value = new Date(value).toLocaleDateString();
        } else if (field.name === 'monto' && value) {
          value = `$${value}`;
        } else if (field.name === 'validado') {
            value = value ? 'Sí' : 'No';
        }
        return {
          label: field.label,
          value: value !== null && value !== undefined ? String(value) : '-',
        };
      });

    fields.push({
        label: "Comprobante de Pago",
        value: formValues.comprobante_pago || '-',
    });

    return fields;
  }, [formValues, pagoFields]);

  return (
    <>
      {loading && <LinearProgress color="inherit" />}
      {error && <p>{error}</p>}
      <Container>
        <SearchBar<Pago>
          baseList={pagos}
          getLabel={(item) => String(item.fk_pedido)}
          placeholder={"Buscar pagos por ID de pedido..."}
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
                      <TableCell align="left">{row.metodo_pago}</TableCell>
                      <TableCell align="left"><Checkbox checked={row.validado} disabled /></TableCell>
                      <TableCell align="right">{row.fk_pedido}</TableCell>
                      <TableCell align="left">{new Date(row.fk_fecha).toLocaleDateString()}</TableCell>
                      <TableCell align="left">{row.hora}</TableCell>
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
        entityName="Pago"
        modo="crear"
        fields={pagoFields}
        values={formValues}
        formErrors={formErrors}
        handleChange={handleChange}
        handleGuardar={handleSubmit}
        handleClose={() => setOpen(false)}
        isSaving={isSaving}
      />

      <ModalBase
        open={openEdit}
        entityName="Pago"
        modo="editar"
        fields={pagoFields}
        values={formValues}
        formErrors={formErrors}
        handleChange={handleChange}
        handleGuardar={() => actualizar(formValues.id!, formValues)}
        handleClose={() => setOpenEdit(false)}
        isSaving={isUpdating}
        borrar={() => borrar(formValues.id!)}
        isDeleting={isDeleting}
        displayFields={displayFields}
      />
    </>
  );
};
