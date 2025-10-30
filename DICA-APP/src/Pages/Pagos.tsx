import {
  Button,
  Container,
  LinearProgress,
  Checkbox,
  Modal,
  CircularProgress,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import { SearchBar } from "../Components/common/SearchBar";
import type { Pago } from "../types";
import { EnhancedTableHead } from "../Components/Pagos/EnhancedTableHead";

import { Paginacion } from "../Components/common/Paginacion";
import { usePagos } from "../hooks/usePagos";
import InfoIcon from "@mui/icons-material/Info";
import React, { useCallback, useState, useMemo, useEffect } from "react";
import { ModalBase } from "../Components/common/ModalBase";
import { usePagoForm } from "../hooks/useFormPago.tsx";
import { useActualizarPago } from "../hooks/useActualizarPago";
import { useBorrarPago } from "../hooks/useBorrarPago";
import { obtenerLinkTemporalDropbox } from "../api/pagos";
import { useDropboxToken } from "../contexts/DropboxTokenContext";

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
  const { token: dropboxToken } = useDropboxToken();

  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Pago>("monto");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openEdit, setOpenEdit] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    setFilteredRows(pagos);
  }, [pagos]);

  const [filteredRows, setFilteredRows] = useState<Pago[]>([]);

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: keyof Pago
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleViewReceipt = async (path: string) => {
    if (!dropboxToken) {
      alert("No se pudo obtener el token de Dropbox. Intente de nuevo más tarde.");
      return;
    }
    setLoadingImage(true);
    setImageModalOpen(true);
    try {
      const url = await obtenerLinkTemporalDropbox(path, dropboxToken);
      setImageUrl(url);
    } catch (error) {
      console.error("Error getting temporary link:", error);
      alert("Error al obtener el comprobante.");
      setImageModalOpen(false);
    } finally {
      setLoadingImage(false);
    }
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredRows.length) : 0;

  const visibleRows = useMemo(
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


const displayFields = useMemo(() => {
  if (!formValues) return [];
  return pagoFields.map((field) => {
    let value: string | number | boolean | null =
      formValues[field.name] as any;

    if (field.name === "fk_fecha" && value) {
      value = new Date(value as string | number | Date).toLocaleDateString('es-AR');
    } else if (field.name === "monto" && value) {
      value = `$${value}`;
    } else if (field.name === "validado") {
      value = value ? "Sí" : "No";
    } else if (field.name === "hora" && typeof value === 'string' && value.length > 5) {
      value = value.slice(0, 5);
    }

    return {
      label: field.label,
      value:
        value !== null && value !== undefined ? String(value) : "-",
    };
  });
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
                      <TableCell align="left">
                        <Checkbox checked={row.validado} disabled />
                      </TableCell>
                      <TableCell align="right">{row.fk_pedido}</TableCell>
                      <TableCell align="left">
                        {new Date(row.fk_fecha).toLocaleDateString('es-AR')}
                      </TableCell>
                      <TableCell align="left">{row.hora ? row.hora.slice(0, 5) : ''}</TableCell>
                      <TableCell
                        align="center"
                        style={{ display: "flex", gap: "8px" }}
                      >
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
        idField="id"
        detailsChildren={
          <Button
            size="small"
            variant="outlined"
            disabled={!formValues.comprobante_pago}
            onClick={() => handleViewReceipt(formValues.comprobante_pago)}
            sx={{ mt: 2 }}
          >
            Ver Comprobante
          </Button>
        }
      />
      <Modal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        aria-labelledby="image-modal-title"
        aria-describedby="image-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          {loadingImage ? (
            <CircularProgress />
          ) : (
            <img
              src={imageUrl || ""}
              alt="Comprobante de pago"
              style={{ maxWidth: "100%", maxHeight: "90vh" }}
            />
          )}
        </Box>
      </Modal>
    </>
  );
};
