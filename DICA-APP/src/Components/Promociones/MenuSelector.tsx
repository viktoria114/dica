import React from "react";
import {
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import type { ItemsMenu } from "../../types";

interface MenuSelectorProps {
  availableMenus: ItemsMenu[];
  selectedItems: { id: number; cantidad: number }[];
  onChange: (
    newSelected: { id: number; cantidad: number }[]
  ) => void;
}

export const MenuSelector: React.FC<MenuSelectorProps> = ({
  availableMenus,
  selectedItems,
  onChange,
}) => {
  const handleAdd = () => {
    onChange([...selectedItems, { id: 0, cantidad: 1 }]);
  };

  const handleUpdate = (
    index: number,
    field: "id" | "cantidad",
    value: number
  ) => {
    const updated = [...selectedItems];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    const updated = selectedItems.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <Grid container spacing={2} direction="column" sx={{ mt: 2 }}>
      <Typography variant="h6">Menús</Typography>

      {selectedItems.map((item, index) => (
        <Grid key={index} container spacing={2} alignItems="center">
          {/* Dropdown de menus */}
          <Grid spacing={6}>
            <TextField
              select
              fullWidth
              label="Menú"
              value={item.id}
              onChange={(e) =>
                handleUpdate(index, "id", Number(e.target.value))
              }
            >
              {availableMenus.map((menu) => (
                <MenuItem key={menu.id} value={menu.id}>
                  {menu.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Cantidad necesaria */}
          <Grid spacing={4}>
            <TextField
              type="number"
              fullWidth
              label="Cantidad"
              value={item.cantidad}
              onChange={(e) =>
                handleUpdate(index, "cantidad", Number(e.target.value))
              }
            />
          </Grid>

          {/* Eliminar */}
          <Grid spacing={2}>
            <IconButton onClick={() => handleDelete(index)} color="error">
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      {/* Botón para agregar menu */}
      <Grid>
        <IconButton onClick={handleAdd} color="primary">
          <AddIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};
