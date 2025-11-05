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
  selectedItems: { id_stock: number; cantidad_necesaria: number }[];
  onChange: (newSelected: { id: number; cantidad: number }[]) => void;
}

export const MenuSelector: React.FC<MenuSelectorProps> = ({
  availableMenus,
  selectedItems,
  onChange,
}) => {
  const handleAdd = () => {
    onChange([...selectedItems, { id_stock: 0, cantidad_necesaria: 1 }]);
  };

  type SelectedMenu = { id_stock: number; cantidad_necesaria: number };

 const handleUpdate = (
  index: number, // Usamos el índice para identificar el item
  key: keyof SelectedMenu, // La clave a actualizar: id_stock o cantidad_necesaria
  value: number // El valor a guardar (ya convertido a número)
) => {
  const updated = selectedItems.map((item, i) => {
    if (i === index) {
      const updatedItem = { ...item };
      
      let finalValue: number = value;

      // Validación simple para cantidad_necesaria (asumiendo que es la única clave numérica que se edita)
      if (key === "cantidad_necesaria") {
        finalValue = value < 0 || isNaN(value) ? 0 : value;
      }

      // Si se actualiza el id_stock, la clave es id_stock
      // Si se actualiza la cantidad, la clave es cantidad_necesaria
      (updatedItem as any)[key] = finalValue;

      // Ya no tiene sentido calcular subtotal aquí porque este selector solo maneja stocks o ítems para promociones, no precios
      
      return updatedItem;
    }
    return item;
  });
  // Nota: Debes actualizar el tipo de la prop 'onChange' para que coincida con lo que pasas.
  // Tu prop onChange es `(newSelected: { id: number; cantidad: number }[]) => void;` 
  // Lo correcto sería que aceptara el tipo del backend: SelectedMenu[]
  onChange(updated as any); // Usamos any temporalmente, pero debes corregir la prop `onChange`
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
              value={item.id_stock}
              onChange={(e) =>
                handleUpdate(index, "id_stock", Number(e.target.value))
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
              value={item.cantidad_necesaria}
              onChange={(e) =>
                handleUpdate(index, "cantidad_necesaria", Number(e.target.value))
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
