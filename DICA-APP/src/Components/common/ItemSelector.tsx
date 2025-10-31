import { useState } from "react";
import Grid from "@mui/material/Grid";
import {
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { SearchBar } from "./SearchBar";

interface BaseItem {
  id?: number | string;
  nombre: string;
  [key: string]: unknown;
}

interface ItemSelectorProps<T extends BaseItem> {
  label?: string;
  idField: keyof T;
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

export const ItemSelector = <T extends BaseItem>({
  label = "Elementos",
  idField,
  availableItems,
  selectedItems,
  onChange,
  columns = [{ key: "nombre", label: "Nombre", editable: false }],
}: ItemSelectorProps<T>) => {
  const [open, setOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState<T[]>(availableItems);

  const handleAdd = (item: T) => {
    if (!selectedItems.some((i) => i[idField] === item[idField])) {
      onChange([...selectedItems, item]);
    }
    setOpen(false);
  };

  const handleDelete = (id: T[keyof T]) => {
    onChange(selectedItems.filter((i) => i[idField] !== id));
  };

  const handleUpdate = <K extends keyof T>(
    id: T[keyof T],
    key: K,
    value: T[K]
  ) => {
    const updated = selectedItems.map((i) =>
      i[idField] === id ? { ...i, [key]: value } : i
    );
    onChange(updated);
  };

  return (
    <>
      <Grid container direction="column" spacing={2} sx={{ mt: 2 }}>
        <Typography variant="h6">{label}</Typography>

        {selectedItems.map((item) => (
          <Grid
            key={String(item[idField])}
            container
            spacing={2}
            alignItems="center"
            sx={{ mb: 1 }}
          >
            {columns.map((col) => (
              <Grid key={String(col.key)} size={col.editable ? 4 : 6}>
                {col.editable ? (
                  <TextField
                    type={col.type === "number" ? "number" : "text"}
                    fullWidth
                    label={col.label}
                    value={item[col.key] ?? ""}
                    onChange={(e) =>
                      handleUpdate(
                        item[idField],
                        col.key as keyof T,
                        (col.type === "number"
                          ? Number(e.target.value)
                          : e.target.value) as T[keyof T]
                      )
                    }
                  />
                ) : (
                  <Typography>{String(item[col.key] ?? "")}</Typography>
                )}
              </Grid>
            ))}

            <Grid>
              <IconButton
                onClick={() => handleDelete(item[idField])}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Grid>
          <IconButton onClick={() => setOpen(true)} color="primary">
            <AddIcon />
          </IconButton>
        </Grid>
      </Grid>

      {/* Modal para agregar elementos */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Agregar {label.toLowerCase()}</DialogTitle>
        <DialogContent>
          {/* 🔍 SearchBar integrada solo con búsqueda */}
          <SearchBar<T>
            baseList={availableItems}
            getLabel={(item) => item.nombre}
            onResults={(results) => setFilteredItems(results)}
            placeholder="Buscar..."
          />

          <List>
            {filteredItems.map((item) => (
              <ListItemButton
                key={String(item[idField])}
                onClick={() => handleAdd(item)}
                disabled={selectedItems.some(
                  (i) => i[idField] === item[idField]
                )}
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
