/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Grid,
  TextField,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// --- Definiciones de Tipos Genéricos ---

// T: El tipo de item disponible en la lista de búsqueda (ej: ItemsMenu)
export interface BaseAvailableItem {
  id: number | string;
  nombre: string;
  [key: string]: unknown; // Permite otras props como 'precio'
}

// K: El tipo de item ya seleccionado (ej: { id, cantidad, nombre })
export interface BaseSelectedItem {
  nombre: string;
  id: number | string;
  cantidad: number;
}

// --- Props del Componente ---

/**
 * Configuración de una columna para la lista de items seleccionados.
 */
export interface ItemSelectorColumn<K> {
  key: keyof K;
  label: string;
  /** Tipo de input (si es editable) */
  type?: "text" | "number";
  /** Si el campo se puede editar (ej: cantidad) o es solo lectura (ej: nombre) */
  editable: boolean;
  /** Ancho de la columna (Material UI Grid) */
  width?: number;
}

interface ItemSelectorProps<
  T extends BaseAvailableItem,
  K extends BaseSelectedItem
> {
  /** Título del componente (ej: "Menús del Pedido") */
  label: string;
  /** Lista completa de items que se pueden seleccionar */
  availableItems: T[];
  /** Lista de items actualmente seleccionados */
  selectedItems: K[];
  /** Callback para actualizar la lista de seleccionados */
  onChange: (items: K[]) => void;
  /**
   * Función "fábrica" que crea un item seleccionado (K)
   * a partir de un item disponible (T).
   * Aquí se define la 'cantidad' inicial.
   */
  itemFactory: (item: T) => K;
  /** Definición de las columnas a mostrar para los items seleccionados */
  columns: ItemSelectorColumn<K>[];
  /** Placeholder para la barra de búsqueda en el modal */
  searchPlaceholder?: string;
  /** Título del modal de selección */
  modalTitle?: string;
}

/**
 * Componente genérico para seleccionar una lista de items y editar sus cantidades.
 */
export const ItemSelector = <
  T extends BaseAvailableItem,
  K extends BaseSelectedItem
>({
  label,
  availableItems,
  selectedItems,
  onChange,
  itemFactory,
  columns,
  searchPlaceholder = "Buscar...",
  modalTitle = "Agregar Elemento",
}: ItemSelectorProps<T, K>) => {
  const [open, setOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState<T[]>(availableItems);
  const [searchTerm, setSearchTerm] = useState("");

  // Abrir el modal y resetear la búsqueda
  const handleOpenModal = () => {
    setFilteredItems(availableItems);
    setSearchTerm("");
    setOpen(true);
  };

  // Agregar un item desde el modal
  const handleAdd = (itemToAdd: T) => {
    // Evitar duplicados
    if (!selectedItems.some((i) => i.id === itemToAdd.id)) {
      const newItem = itemFactory(itemToAdd); // Usamos la factory
      onChange([...selectedItems, newItem]);
    }
    setOpen(false); // Cierra el modal al seleccionar
  };

  // Eliminar un item de la lista de seleccionados
  const handleDelete = (id: K["id"]) => {
    onChange(selectedItems.filter((i) => i.id !== id));
  };

  // Actualizar un campo de un item seleccionado (ej. 'cantidad')
  const handleUpdate = (id: K["id"], key: keyof K, value: K[keyof K]) => {
    const updated = selectedItems.map((i) => {
      if (i.id === id) {
        // ✅ Paso 1: Actualizar el ítem con el nuevo valor (ya sea cantidad u otro)
        const updatedItem = { ...i, [key]: value };

        // Aseguramos que los valores a usar para el cálculo sean siempre números
        const currentQuantity = Number(updatedItem.cantidad);
        // Usamos 'i' para obtener el precio_unitario original y forzamos a número
        const unitPrice = Number((i as any).precio_unitario);
        // ✅ Paso 2: Recalcular subtotal si se cambió la cantidad Y el precio unitario es válido
        if (key === "cantidad" && !isNaN(unitPrice)) {
          // Recalculo: Precio Unitario * Nueva Cantidad
          (updatedItem as any).subtotal = unitPrice * currentQuantity;
        }

        return updatedItem;
      }
      return i;
    });
    onChange(updated as K[]);
  };

  // Lógica de búsqueda
  const handleSearch = (query: string) => {
    setSearchTerm(query);
    if (!query) {
      setFilteredItems(availableItems);
      return;
    }
    const lowerQuery = query.toLowerCase();
    setFilteredItems(
      availableItems.filter((item) =>
        item.nombre.toLowerCase().includes(lowerQuery)
      )
    );
  };

  return (
    <>
      {/* Contenedor principal del selector */}
      <Box sx={{ mt: 2, p: 2, border: "1px solid #ddd", borderRadius: "8px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">{label}</Typography>
          <IconButton
            onClick={handleOpenModal}
            color="primary"
            aria-label={`Agregar ${label}`}
          >
            <AddIcon />
          </IconButton>
        </Box>

        {/* Lista de Items Seleccionados */}
        <Grid container direction="column" spacing={1}>
          {selectedItems.length === 0 ? (
            <Typography variant="body2" color="textSecondary" sx={{ p: 1 }}>
              No hay elementos seleccionados.
            </Typography>
          ) : (
            selectedItems.map((item) => (
              <Grid
                key={String((item as any).uniqueKey || item.id)}
                container
                spacing={2}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                {/* Renderizar columnas dinámicamente */}
                {columns.map((col) => (
                  <Grid
                    size={
                      typeof col.width === "number"
                        ? col.width
                        : col.editable
                        ? 4
                        : "auto"
                    }
                    key={String(col.key)}
                  >
                    {col.editable ? (
                      <TextField
                        type={col.type === "number" ? "number" : "text"}
                        fullWidth
                        label={col.label}
                        value={item[col.key] ?? ""}
                        onChange={(e) =>
                          handleUpdate(
                            item.id,
                            col.key,
                            (col.type === "number"
                              ? Number(e.target.value) < 0 // Evitar negativos
                                ? 0
                                : Number(e.target.value)
                              : e.target.value) as K[keyof K]
                          )
                        }
                        InputProps={
                          col.type === "number"
                            ? { inputProps: { min: 0 } }
                            : {}
                        }
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      // Campos no editables
                      <Box>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          component="div"
                        >
                          {col.label}
                        </Typography>
                        <Typography variant="body1">
                          {String(item[col.key] ?? "N/A")}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                ))}

                {/* Botón de Eliminar */}
                <Grid size="auto" key={`delete-${item.id}`}>
                  <IconButton
                    onClick={() => handleDelete(item.id)}
                    color="error"
                    aria-label={`Eliminar ${item.nombre ?? "item"}`}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))
          )}
        </Grid>
      </Box>

      {/* Modal para Agregar Items */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{modalTitle}</DialogTitle>
        <DialogContent>
          {/* Barra de búsqueda */}
          <TextField
            label={searchPlaceholder}
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Lista de items buscados */}
          <List sx={{ maxHeight: "400px", overflowY: "auto" }}>
            {filteredItems.map((item) => (
              <ListItemButton
                key={String(item.id)}
                onClick={() => handleAdd(item)}
                disabled={selectedItems.some((i) => i.id === item.id)}
              >
                <ListItemText
                  primary={item.nombre}
                  secondary={item.precio ? `$${item.precio}` : null} // Muestra precio si existe
                />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
