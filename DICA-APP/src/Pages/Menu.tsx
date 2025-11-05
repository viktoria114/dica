/* eslint-disable @typescript-eslint/no-explicit-any */
// Menu.tsx
import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button, Container, LinearProgress } from "@mui/material";
import { SearchBar } from "../Components/common/SearchBar";
import type { ItemsMenu } from "../types";
import { EnhancedTableHead } from "../Components/Menu/EnhancedTableHead";
import { EnhancedTableToolbar } from "../Components/Menu/EnhancedTableToolbar";
import { Paginacion } from "../Components/common/Paginacion";
import { useMenu } from "../hooks/useMenu";
import InfoIcon from "@mui/icons-material/Info";
import { useCallback, useState } from "react";
import { ModalBase } from "../Components/common/ModalBase";
import { useMenuForm } from "../hooks/useFormMenu";
import {
  ItemSelector,
  type BaseAvailableItem,
  type ItemSelectorColumn,
} from "../Components/common/ItemSelector";
import { useStock } from "../hooks/Stock/useStock";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

type Order = "asc" | "desc";

function getComparator<Key extends keyof ItemsMenu>(
  order: Order,
  orderBy: Key
): (a: ItemsMenu, b: ItemsMenu) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export const Menu = () => {
  const { menus, loading, error, modoPapelera, toggleInvisibles } = useMenu();
  const {
    open,
    menuFields,
    setOpen,
    isSaving,
    formValues,
    setFormValues,
    formErrors,
    handleChange,
    handleSubmit,
  } = useMenuForm();

  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof ItemsMenu>("precio");
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const rowsPerPageOptions: number[] = [5, 10, 25];
  const [openEdit, setOpenEdit] = useState(false);
  const { stock } = useStock();

  interface AdaptedStockItem {
    id: number; // Debe ser 'id' para que el ItemSelector lo maneje
    nombre: string;
    cantidad: number;
  }

  const stockColumns: ItemSelectorColumn<AdaptedStockItem>[] = [
    { key: "nombre", label: "Item de Stock", editable: false, width: 6 },
    {
      key: "cantidad", // 👈 Cambiado de "cantidad_necesaria" a "cantidad"
      label: "Cantidad Necesaria",
      editable: true,
      type: "number",
      width: 4,
    },
  ];

  const stockItemFactory = (
    stockItem: BaseAvailableItem
  ): AdaptedStockItem => ({
    id: Number(stockItem.id), // Usa 'id'
    nombre: stockItem.nombre,
    cantidad: 1, // Usa 'cantidad'
  });

  const adaptedStocks = React.useMemo(() => {
    // Si no hay stocks en el form o no han cargado los disponibles, devuelve vacío
    if (!formValues.stocks || !stock) {
      return [];
    }

    return formValues.stocks.map((stockEnForm) => {
      const stockInfo = stock.find((a: any) => a.id === stockEnForm.id_stock);
      return {
        id: stockEnForm.id_stock, // 👈 id del item de stock (mapeado de id_stock)
        nombre: stockInfo?.nombre || "Stock Desconocido",
        cantidad: stockEnForm.cantidad_necesaria, // 👈 cantidad (mapeado de cantidad_necesaria)
      };
    });
  }, [formValues.stocks, stock]);

  // --- 6. ADAPTADOR DE "VUELTA" (Handler) ---
  // Recibe `AdaptedStockItem[]` del ItemSelector y lo transforma
  // de nuevo a `{ id_stock, cantidad_necesaria }[]` antes de guardarlo en el form.
  const handleStockChange = (newAdaptedStocks: AdaptedStockItem[]) => {
    const newStocksForForm = newAdaptedStocks.map((a) => ({
      id_stock: a.id, // 👈 Mapea 'id' de ItemSelector a 'id_stock' del Form
      cantidad_necesaria: a.cantidad, // 👈 Mapea 'cantidad' de ItemSelector a 'cantidad_necesaria' del Form
    })); // Usamos el 'handleChange' del hook useMenuForm

    handleChange("stocks", newStocksForForm);
  };
  React.useEffect(() => {
    setFilteredRows(menus);
  }, [menus]);

  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(
    null
  );

  const [filteredRows, setFilteredRows] = React.useState<ItemsMenu[]>(menus);

  const handleCategoryClick = (cat: string | null) => {
    setCategoryFilter(cat);
    if (!cat) {
      setFilteredRows(menus); // sin filtro = todos
    } else {
      setFilteredRows(menus.filter((row) => row.categoria === cat));
    }
    setPage(0); // reiniciar a la primera página
  };

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: keyof ItemsMenu
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
    setFormValues({} as ItemsMenu);
    setOpen(true);
  }, [setFormValues, setOpen]);

  const handleEdit = (menu: ItemsMenu) => {
    setFormValues(menu);
    setOpenEdit(true);
  };

  console.log(stock, adaptedStocks);

  return (
    <>
      {loading && <LinearProgress color="inherit" />}
      {error && <p>{error}</p>}
      <Container>
        {/* 🔎 Buscador conectado */}
        <SearchBar<ItemsMenu>
          baseList={menus}
          getLabel={(item) => item.nombre}
          placeholder={"Buscar menús por nombre..."}
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
              categoryFilter={categoryFilter}
              onCategoryClick={handleCategoryClick}
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
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        //onClick={(event) => {
                        //  if (!modoPapelera) handleClick(event, row.id);
                        //  }}
                        //role="checkbox"
                        //aria-checked={isItemSelected}
                        //   tabIndex={-1}
                        //   key={row.id}
                        //selected={isItemSelected}
                        // sx={{ cursor: modoPapelera ? "default" : "pointer" }}
                      >
                        <TableCell padding="checkbox"></TableCell>
                        <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          padding="none"
                        >
                          {row.nombre}
                        </TableCell>
                        <TableCell align="left">{row.categoria}</TableCell>
                        <TableCell align="right">${row.precio}</TableCell>
                        <TableCell align="left">{row.descripcion}</TableCell>

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
        entityName="Menú"
        modo="crear"
        fields={menuFields}
        values={formValues}
        formErrors={formErrors}
        handleChange={handleChange}
        handleGuardar={handleSubmit}
        handleClose={() => setOpen(false)}
        isSaving={isSaving}
      >
        <ItemSelector<BaseAvailableItem, AdaptedStockItem>
          label="Items de Stock Requeridos"
          availableItems={stock}
          selectedItems={adaptedStocks}
          onChange={handleStockChange}
          itemFactory={stockItemFactory}
          columns={stockColumns}
          modalTitle="Seleccionar Stock"
          searchPlaceholder="Buscar item de stock..."
        />
      </ModalBase>

      <ModalBase
        open={openEdit}
        entityName="Menú"
        modo="editar"
        fields={menuFields}
        values={formValues}
        formErrors={formErrors}
        handleChange={handleChange}
        handleGuardar={handleSubmit}
        handleClose={() => setOpenEdit(false)}
        isSaving={isSaving}
        displayFields={[
          { label: "Nombre", value: formValues.nombre },
          { label: "ID", value: formValues.id },
          { label: "Categoría", value: formValues.categoria },
          { label: "Precio", value: formValues.precio },
          { label: "Descripción", value: formValues.descripcion },
        ]}
      >
        <ItemSelector<BaseAvailableItem, AdaptedStockItem>
          label="Items de Stock Requeridos"
          availableItems={stock}
          selectedItems={adaptedStocks}
          onChange={handleStockChange}
          itemFactory={stockItemFactory}
          columns={stockColumns}
          modalTitle="Seleccionar Stock"
          searchPlaceholder="Buscar item de stock..."
        />
      </ModalBase>
    </>
  );
};
