import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import type { ItemsMenu, Promocion } from "../../types";

interface MenuSelectorModalProps {
  open: boolean;
  onClose: () => void;
  availableMenus: ItemsMenu[];
  selectedItems: { id: number; cantidad: number; nombre?: string; precio?: number }[];
  onChange: (newSelected: { id: number; cantidad: number }[]) => void;
  formValues: Promocion;
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  maxHeight: "90vh",
  overflowY: "auto",
};

export const MenuSelectorModal: React.FC<MenuSelectorModalProps> = ({
  open,
  onClose,
  availableMenus,
  selectedItems,
  onChange,
  formValues,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleQuantityChange = (menuId: number, cantidad: number) => {
    const existingItem = selectedItems.find((item) => item.id === menuId);

    if (existingItem) {
      if (cantidad > 0) {
        const updatedItems = selectedItems.map((item) =>
          item.id === menuId ? { ...item, cantidad } : item
        );
        onChange(updatedItems);
      } else {
        const updatedItems = selectedItems.filter((item) => item.id !== menuId);
        onChange(updatedItems);
      }
    } else if (cantidad > 0) {
      onChange([...selectedItems, { id: menuId, cantidad }]);
    }
  };

  const calculateTotalPrice = () => {
    const total = selectedItems.reduce((acc, item) => {
      const menuItem = availableMenus.find((menu) => menu.id === item.id);
      return acc + (menuItem ? menuItem.precio * item.cantidad : 0);
    }, 0);

    if (formValues.tipo === "DESCUENTO" && formValues.precio) {
      return total * (1 - formValues.precio / 100);
    }
    return total;
  };

  const filteredMenus = availableMenus.filter((menu) =>
    menu.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6">Seleccionar Menús</Typography>
        <TextField
          label="Buscar Menú"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ my: 2 }}
        />
        <List>
          {filteredMenus.map((menu) => {
            const selectedItem = selectedItems.find((item) => item.id === menu.id);
            return (
              <ListItem key={menu.id}>
                <ListItemText
                  primary={menu.nombre}
                  secondary={`$${menu.precio}`}
                />
                <TextField
                  type="number"
                  label="Cantidad"
                  value={selectedItem?.cantidad || 0}
                  onChange={(e) =>
                    handleQuantityChange(menu.id, parseInt(e.target.value, 10))
                  }
                  inputProps={{ min: 0 }}
                  sx={{ width: "100px" }}
                />
              </ListItem>
            );
          })}
        </List>
        {formValues.tipo === "DESCUENTO" && (
          <Typography variant="h6" sx={{ mt: 2 }}>
            Precio con descuento: ${calculateTotalPrice().toFixed(2)}
          </Typography>
        )}
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onClose}>Cerrar</Button>
        </Box>
      </Box>
    </Modal>
  );
};
