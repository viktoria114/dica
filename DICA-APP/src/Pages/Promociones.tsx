// Promociones.tsx
import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import { Button, Container, LinearProgress } from "@mui/material";
import { SearchBar } from "../Components/common/SearchBar";
import type { Promocion } from "../types";
import { EnhancedTableHead } from "../Components/Promociones/EnhancedTableHead";
import { EnhancedTableToolbar } from "../Components/Promociones/EnhancedTableToolbar";
import { Paginacion } from "../Components/common/Paginacion";
import { usePromociones } from "../hooks/usePromociones";
import InfoIcon from "@mui/icons-material/Info";
import { useCallback, useState } from "react";
import { ModalBase } from "../Components/common/ModalBase";
import { usePromocionForm } from "../hooks/useFormPromociones";
import { MenuSelector } from "../Components/Promociones/MenuSelector";
import { useMenu } from "../hooks/useMenu";

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
  const { promociones, loading, error, modoPapelera, toggleInvisibles } = usePromociones();
  const { menus } = useMenu();
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
    setFormValues({} as Promocion);
    setOpen(true);
  }, [setFormValues, setOpen]);

  const handleEdit = (promocion: Promocion) => {
    setFormValues(promocion);
    setOpenEdit(true);
  };


  return (
    <>
      {loading && <LinearProgress color="inherit" />}
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
            <EnhancedTableToolbar
              numSelected={selected.length}
              modoPapelera={modoPapelera}
            />
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
                          <Checkbox
                            color="primary"
                            disabled={modoPapelera}
                            checked={isItemSelected}
                            inputProps={{ "aria-labelledby": labelId }}
                            sx={{ color: "secondary.main" }}
                          />
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
  handleGuardar={handleSubmit}
  handleClose={() => setOpen(false)}
  isSaving={isSaving}
>
   <MenuSelector
    availableMenus={menus}
    selectedMenus={formValues.menus ?? []}
    onChange={(newMenus) =>
      handleChange("menus", newMenus)
    }
  />
</ModalBase>

 <ModalBase
        open={openEdit}
        entityName="Promoción"
        modo="editar"
        fields={promocionFields}
        values={formValues}
        formErrors={formErrors}
        handleChange={handleChange}
        handleGuardar={handleSubmit}
        handleClose={() => setOpenEdit(false)}
        isSaving={isSaving}
         displayFields={[
        { label: "Nombre", value: formValues.nombre },
        { label: "ID", value: formValues.id },
        { label: "Tipo", value: formValues.tipo },
        { label: "Precio", value: formValues.precio },
      ]}
      >
        <MenuSelector
          availableMenus={menus}
          selectedMenus={formValues.menus ?? []}
          onChange={(newMenus) => handleChange("menus", newMenus)}
        />
      </ModalBase>
    </>
  );
};
