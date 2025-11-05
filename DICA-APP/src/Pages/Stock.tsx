// src/Pages/Stock.tsx
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
import InfoIcon from "@mui/icons-material/Info";
import type { Stock } from "../types";
import { useStock } from "../hooks/Stock/useStock";
import { EnhancedTableHead } from "../Components/Stock/EnhancedTableHead";
import { SearchBar } from "../Components/common/SearchBar";
import { Paginacion } from "../Components/common/Paginacion";
import { ModalBase } from "../Components/common/ModalBase";
import { useFormStock } from "../hooks//Stock/useFormStock";
import { useBorrarStock } from "../hooks//Stock/useBorrarStock";
import { useRestaurarStock } from "../hooks//Stock/useRestaurarStock";
import { ModalStock } from "../Components/Stock/StockModal";
import { ConfirmationModal } from "../Components/common/ConfirmationModal";

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

const initialValues: Stock = {
  id: null,
  nombre: "",
  stock_actual: 0,
  vencimiento: 0,
  tipo: "PERECEDERO",
  stock_minimo: 0,
  medida: "KG",
  visibilidad: true,
};

export const StockPage = () => {
  const { stock, loading, error, modoPapelera, toggleInvisibles, refetch } =
    useStock();

  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof Stock>("stock_actual");
  const [filteredRows, setFilteredRows] = React.useState<Stock[]>(stock);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const rowsPerPageOptions: number[] = [5, 10, 25];

  // Estados para modales
  const [showForm, setShowForm] = React.useState(false);
  const [selectedStock, setSelectedStock] = React.useState<Stock | null>(null);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<"crear" | "borrar" | "restaurar" | null>(null);

  const handleDeleteRequest = () => {
    setConfirmAction("borrar");
    setConfirmOpen(true);
  };

  const handleRestoreRequest = () => {
    setConfirmAction("restaurar");
    setConfirmOpen(true);
  };

  const handleCreateRequest = () => {
    setConfirmAction("crear");
    setConfirmOpen(true);
  };

  const handleConfirmAction = () => {
    if (confirmAction === "borrar") {
      borrarStockHandler(editValues.id!);
    } else if (confirmAction === "restaurar") {
      restaurar(editValues.id!);
    } else if (confirmAction === "crear") {
      handleGuardarCreate(createValues);
    }
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  React.useEffect(() => {
    setFilteredRows(stock);
  }, [stock]);

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: keyof Stock
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Hooks de formulario
  const onSuccessCreate = () => {
    setShowForm(false);
    refetch();
  };

  const onSuccessEdit = () => {
    setOpenEdit(false);
    refetch();
  };

  const {
    editValues: createValues,
    handleChange: handleChangeCreate,
    handleGuardar: handleGuardarCreate,
    formErrors: formErrorsCreate,
    isSaving: isSavingCreate,
    fields: createFields, // 👈 Renombrado para claridad
    setEditValues: setCreateValues,
  } = useFormStock(initialValues, onSuccessCreate, "crear");

  const {
    editValues: editValues,
    handleChange: handleChangeEdit,
    handleGuardar: handleGuardarEdit,
    formErrors: formErrorsEdit,
    isSaving: isSavingEdit,
    fields: editFields, // 👈 Renombrado para claridad
    setEditValues,
  } = useFormStock(selectedStock, onSuccessEdit, "editar");

  // Borrar y restaurar
  const { borrarStockHandler, isDeleting } = useBorrarStock(() => {
    setOpenEdit(false);
    refetch();
  });

  const { restaurar, isRestoring } = useRestaurarStock(() => {
    setOpenEdit(false);
    refetch();
  });

  // Ordenar y paginar
  const visibleRows = React.useMemo(() => {
    const sorted = [...filteredRows].sort(getComparator(order, orderBy));
    return sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [order, orderBy, filteredRows, page, rowsPerPage]);

  const handleAdd = () => {
    setCreateValues(initialValues);
    setShowForm(true);
  };

  const handleEdit = (stockItem: Stock) => {
    setSelectedStock(stockItem);
    setEditValues(stockItem);
    setOpenEdit(true);
  };

  return (
    <>
      {loading && <LinearProgress color="inherit" />}
      {error && <p>{error}</p>}

      <Container>
        {/* Buscador */}
        <SearchBar<Stock>
          baseList={stock}
          getLabel={(item) => item.nombre}
          placeholder={"Buscar stock por nombre..."}
          onResults={setFilteredRows}
          onAdd={handleAdd}
          onShowInvisibles={toggleInvisibles}
          disableAdd={modoPapelera}
          papeleraLabel={modoPapelera ? "Volver" : "Papelera"}
        />

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
                  {visibleRows.map((row: Stock) => (
                    <TableRow key={row.id}>
                      <TableCell component="th" scope="row" padding="none">
                        {row.nombre}
                      </TableCell>

                      <TableCell align="right">
                        {row.stock_actual} {row.medida}
                      </TableCell>

                      <TableCell align="right">{row.vencimiento}</TableCell>

                      <TableCell align="left">{row.tipo}</TableCell>

                      <TableCell align="right">
                        {row.stock_minimo} {row.medida}
                      </TableCell>

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
                </TableBody>
              </Table>
            </TableContainer>

            <Paginacion
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

      {/* Modal Crear */}
      <ModalBase
        open={showForm}
        entityName="Stock"
        modo="crear"
        fields={createFields} // 👈 Usa createFields
        values={createValues}
        formErrors={formErrorsCreate}
        handleChange={handleChangeCreate}
        handleGuardar={handleCreateRequest}
        handleClose={() => setShowForm(false)}
        isSaving={isSavingCreate}
      />

      {/* MODAL EDITAR */}
      {selectedStock && (
        <ModalStock
          open={openEdit}
          handleClose={() => setOpenEdit(false)}
          editValues={editValues}
          editFields={editFields}
          formErrorsEdit={formErrorsEdit}
          handleChangeEdit={handleChangeEdit}
          handleGuardarEdit={handleGuardarEdit}
          isSavingEdit={isSavingEdit}
          modoPapelera={modoPapelera}
          borrar={handleDeleteRequest}
          restaurar={handleRestoreRequest}
          isDeleting={isDeleting}
          isRestoring={isRestoring}
        />
      )}

      <ConfirmationModal
        open={confirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmAction}
        title={
          confirmAction === "crear"
            ? "Confirmar Creación"
            : confirmAction === "borrar"
            ? "Confirmar Eliminación"
            : "Confirmar Restauración"
        }
        message={
          confirmAction === "crear"
            ? `¿Está seguro de que desea crear el item "${createValues.nombre}"?`
            : confirmAction === "borrar"
            ? `¿Está seguro de que desea eliminar el item "${editValues?.nombre}"?`
            : `¿Está seguro de que desea restaurar el item "${editValues?.nombre}"?`
        }
        confirmText={
          confirmAction === "crear"
            ? "Sí, Crear"
            : confirmAction === "borrar"
            ? "Sí, Eliminar"
            : "Sí, Restaurar"
        }
        cancelText="Cancelar"
        confirmButtonColor={
          confirmAction === "crear"
            ? "primary"
            : confirmAction === "borrar"
            ? "error"
            : "success"
        }
      />
    </>
  );
};
