// Promociones.tsx
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
import type { Promocion } from "../types";
import { EnhancedTableHead } from "../Components/Promociones/EnhancedTableHead";
import { Paginacion } from "../Components/common/Paginacion";
import { usePromociones } from "../hooks/Promocion/usePromociones";
import InfoIcon from "@mui/icons-material/Info";
import { useCallback, useState } from "react";
import { ConfirmationModal } from "../Components/common/ConfirmationModal";
import { ModalBase } from "../Components/common/ModalBase";
import { usePromocionForm } from "../hooks/Promocion/useFormPromociones";
import { MenuSelectorModal } from "../Components/Promociones/MenuSelectorModal";
import { useMenu } from "../hooks/useMenu";
import { useBorrarPromocion } from "../hooks//Promocion/useBorrarPromocion";
import { useActualizarPromocion } from "../hooks/Promocion/useActualizarPromocion";
import { useRestaurarPromocion } from "../hooks/Promocion/useRestaurarPromocion";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

type Order = "asc" | "desc";

function getComparator<Key extends keyof Promocion>(
  order: Order,
  orderBy: Key
): (a: Promocion, b: Promocion) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export const Promociones = () => {
  const { promociones, loading, error, modoPapelera, toggleInvisibles, refreshPromociones } = usePromociones();
  const { menus } = useMenu();
  const { borrarPromocionHandler, isDeleting } = useBorrarPromocion(() => {
    refreshPromociones();
    setOpenEdit(false);
  });
  const { actualizar, isUpdating } = useActualizarPromocion(() => {
    refreshPromociones();
    setOpenEdit(false);
  });
  const { restaurar, isRestoring } = useRestaurarPromocion(() => {
    refreshPromociones();
    setOpenEdit(false);
  });
  const {
  open,
  promocionFields,
  setOpen,
  isSaving,
  formValues,
  setFormValues,
  formErrors,
  handleChange,
  handleSubmit,
} = usePromocionForm();

  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof Promocion>("precio");
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const rowsPerPageOptions: number[] = [5, 10, 25];
  const [openEdit, setOpenEdit] = useState(false);
  const [originalPromocion, setOriginalPromocion] = useState<Promocion | null>(null);
  const [isMenuSelectorOpen, setMenuSelectorOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"crear" | "borrar" | "restaurar" | null>(null);

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
      borrarPromocionHandler(formValues.id);
    } else if (confirmAction === "restaurar") {
      restaurar(formValues.id);
    } else if (confirmAction === "crear") {
      handleSubmit(formValues);
    }
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setConfirmAction(null);
  };



  React.useEffect(() => {
    setFilteredRows(promociones);
  }, [promociones]);

  const [filteredRows, setFilteredRows] = React.useState<Promocion[]>(promociones);

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: keyof Promocion
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
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
    else if (selectedIndex === 0)
      newSelected = newSelected.concat(selected.slice(1));
    else if (selectedIndex === selected.length - 1)
      newSelected = newSelected.concat(selected.slice(0, -1));
    else if (selectedIndex > 0)
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );

    setSelected(newSelected);
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
      id: 0,
      nombre: "",
      tipo: "DESCUENTO",
      precio: 0,
      visibilidad: true,
      items: [],
    });
    setOpen(true);
  }, [setFormValues, setOpen]);

  const handleEdit = (promocion: Promocion) => {
    setOriginalPromocion(promocion);
    setFormValues(promocion);
    setOpenEdit(true);
  };


  return (
    <>
      {loading && <LinearProgress color="inherit" />
}
      {error && <p>{error}</p>}
      <Container>
        <SearchBar<Promocion>
          baseList={promociones}
          getLabel={(item) => item.nombre}
          placeholder={"Buscar promociones por nombre..."}
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
              <Table sx={{ minWidth: 750 }} size={dense ? "small" : "medium"}>
                <EnhancedTableHead
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={handleSelectAllClick}
                  onRequestSort={handleRequestSort}
                  rowCount={filteredRows.length}
                  modoPapelera={modoPapelera}
                />
                <TableBody>
                  {visibleRows.map((row, index) => {
                    const isItemSelected = selected.includes(row.id);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        onClick={(event) => {
                          if (!modoPapelera) handleClick(event, row.id);
                        }}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.id}
                        selected={isItemSelected}
                        sx={{ cursor: modoPapelera ? "default" : "pointer" }}
                      >
                        <TableCell padding="checkbox">
                          
                        </TableCell>
                        <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          padding="none"
                        >
                          {row.nombre}
                        </TableCell>
                        <TableCell align="left">{row.tipo}</TableCell>
                        <TableCell align="right">${row.precio}</TableCell>

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

      <ModalBase
        open={open}
        entityName="Promoción"
        modo="crear"
        fields={promocionFields}
        values={formValues}
        formErrors={formErrors}
        handleChange={handleChange}
        handleGuardar={handleCreateRequest}
        handleClose={() => setOpen(false)}
        isSaving={isSaving}
      >
        <Button onClick={() => setMenuSelectorOpen(true)}>Seleccionar Menús</Button>
        <List>
          {formValues.items?.map((item) => {
            const menu = menus.find((m) => m.id === item.id);
            return (
              <ListItem key={item.id}>
                <ListItemText primary={`${menu?.nombre} (x${item.cantidad})`} />
              </ListItem>
            );
          })}
        </List>
      </ModalBase>

      <ModalBase
        open={openEdit}
        entityName="Promoción"
        modo="editar"
        fields={promocionFields}
        values={formValues}
        formErrors={formErrors}
        handleChange={handleChange}
        handleGuardar={() => actualizar(formValues.id, originalPromocion!, formValues)}
        handleClose={() => setOpenEdit(false)}
        isSaving={isUpdating}
        borrar={handleDeleteRequest}
        isDeleting={isDeleting}
        restaurar={handleRestoreRequest}
        isRestoring={isRestoring}
        modoPapelera={modoPapelera}
        idField="id"
        displayFields={[
          { label: "Nombre", value: formValues.nombre },
          { label: "ID", value: formValues.id },
          { label: "Tipo", value: formValues.tipo },
          {
            label: formValues.tipo === "DESCUENTO" ? "Porcentaje de descuento" : "Precio",
            value: formValues.precio,
          },
        ]}
      >
        <List>
          {formValues.items?.map((item) => {
            const menu = menus.find((m) => m.id === item.id);
            return (
              <ListItem key={item.id}>
                <ListItemText primary={`${menu?.nombre} (x${item.cantidad})`} />
              </ListItem>
            );
          })}
        </List>
        <Button onClick={() => setMenuSelectorOpen(true)}>Seleccionar Menús</Button>
      </ModalBase>

      <MenuSelectorModal
        open={isMenuSelectorOpen}
        onClose={() => setMenuSelectorOpen(false)}
        availableMenus={menus}
        selectedItems={formValues.items ?? []}
        onChange={(newItems) => handleChange("items", newItems)}
        formValues={formValues}
      />

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
            ? "¿Está seguro de que desea crear esta promoción?"
            : confirmAction === "borrar"
            ? `¿Está seguro de que desea eliminar la promoción "${formValues.nombre}"?`
            : `¿Está seguro de que desea restaurar la promoción "${formValues.nombre}"?`
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