import { useState, useMemo } from "react";
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
import SearchIcon from "@mui/icons-material/Search";

interface BaseItem {
  id: number | string;
  nombre: string;
  [key: string]: unknown;
}

interface ItemSelectorProps<T extends BaseItem> {
  label?: string; // ejemplo: "Ingredientes", "Items del menú"
  availableItems: T[];
  selectedItems: T[];
  onChange: (items: T[]) => void;
  columns?: {
    key: keyof T;
    label: string;
    type?: "text" | "number";
    editable?: boolean;
  }[];
}

/**
 * Componente generalizado para seleccionar ítems en formularios
 */
export const ItemSelector = <T extends BaseItem>({
  label = "Elementos",
  availableItems,
  selectedItems,
  onChange,
  columns = [{ key: "nombre", label: "Nombre", editable: false }],
}: ItemSelectorProps<T>) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Filtro de búsqueda
  const filteredItems = useMemo(() => {
    return availableItems.filter((item) =>
      item.nombre.toLowerCase().includes(search.toLowerCase())
    );
  }, [availableItems, search]);

  const handleAdd = (item: T) => {
    if (!selectedItems.some((i) => i.id === item.id)) {
      onChange([...selectedItems, item]);
    }
    setOpen(false);
  };

  const handleDelete = (id: T["id"]) => {
    onChange(selectedItems.filter((i) => i.id !== id));
  };

  const handleUpdate = (
    id: T["id"],
    key: keyof T,
    value: string | number
  ) => {
    const updated = selectedItems.map((i) =>
      i.id === id ? { ...i, [key]: value } : i
    );
    onChange(updated);
  };

  return (
    <>
      <Grid container direction="column" spacing={2} sx={{ mt: 2 }}>
        <Typography variant="h6">{label}</Typography>

        {selectedItems.map((item) => (
          <Grid
            key={item.id}
            container
            spacing={2}
            alignItems="center"
            sx={{ mb: 1 }}
          >
            {columns.map((col) => (
              <Grid key={String(col.key)}>
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
                        col.type === "number"
                          ? Number(e.target.value)
                          : e.target.value
                      )
                    }
                  />
                ) : (
                  <Typography>{String(item[col.key] ?? "")}</Typography>
                )}
              </Grid>
            ))}

            <Grid>
              <IconButton onClick={() => handleDelete(item.id)} color="error">
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        {/* Botón + */}
        <Grid>
          <IconButton onClick={() => setOpen(true)} color="primary">
            <AddIcon />
          </IconButton>
        </Grid>
      </Grid>

      {/* Modal de selección */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Agregar {label.toLowerCase()}</DialogTitle>
        <DialogContent>
          <Box display="flex" alignItems="center" mb={2}>
            <SearchIcon sx={{ mr: 1 }} />
            <TextField
              fullWidth
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>

          <List>
            {filteredItems.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => handleAdd(item)}
                disabled={selectedItems.some((i) => i.id === item.id)}
              >
                <ListItemText primary={item.nombre} />
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
