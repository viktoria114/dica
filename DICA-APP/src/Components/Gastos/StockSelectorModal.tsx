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
import type { Stock } from "../../types";

interface StockSelectorModalProps {
  open: boolean;
  onClose: () => void;
  availableStocks: Stock[];
  selectedItems: { id_stock: number; cantidad: number }[];
  onChange: (newSelected: { id_stock: number; cantidad: number }[]) => void;
}

const style = {
  position: "absolute" as "absolute",
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

export const StockSelectorModal: React.FC<StockSelectorModalProps> = ({
  open,
  onClose,
  availableStocks,
  selectedItems,
  onChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleQuantityChange = (stockId: number, cantidad: number) => {
    const existingItem = selectedItems.find((item) => item.id_stock === stockId);

    if (existingItem) {
      if (cantidad > 0) {
        const updatedItems = selectedItems.map((item) =>
          item.id_stock === stockId ? { ...item, cantidad } : item
        );
        onChange(updatedItems);
      } else {
        const updatedItems = selectedItems.filter((item) => item.id_stock !== stockId);
        onChange(updatedItems);
      }
    } else if (cantidad > 0) {
      onChange([...selectedItems, { id_stock: stockId, cantidad }]);
    }
  };

  const filteredStocks = availableStocks.filter((stock) =>
    stock.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6">Seleccionar Stock</Typography>
                <TextField
                  label="Buscar Stock"
                  variant="outlined"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ my: 2 }}
                />
                <List>
                  {filteredStocks.map((stock) => {
                    const selectedItem = selectedItems.find((item) => item.id_stock === stock.id);
                    return (
                      <ListItem key={stock.id}>
                        <ListItemText
                          primary={stock.nombre}
                          secondary={`Stock actual: ${stock.stock_actual}`}
                        />
                        <TextField
                          type="number"
                          label="Cantidad"
                          value={selectedItem?.cantidad || 0}
                          onChange={(e) =>
                            handleQuantityChange(stock.id, parseInt(e.target.value, 10))
                          }
                          inputProps={{ min: 0 }}
                          sx={{ width: "100px" }}
                        />
                      </ListItem>
                    );
                  })}
                </List>        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onClose}>Cerrar</Button>
        </Box>
      </Box>
    </Modal>
  );
};
