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

interface StockItem {
  id_stock: number;
  nombre: string;
}

interface StockSelectorProps {
  availableStocks: StockItem[];
  selectedStocks: { id_stock: number; cantidad_necesaria: number }[];
  onChange: (
    newSelected: { id_stock: number; cantidad_necesaria: number }[]
  ) => void;
}

export const StockSelector: React.FC<StockSelectorProps> = ({
  availableStocks,
  selectedStocks,
  onChange,
}) => {
  const handleAdd = () => {
  //  onChange([...selectedStocks, { id_stock: 0, cantidad_necesaria: 1 }]);
    setOpen(true);
  };

  const [open, setOpen] = React.useState(false);
  const handleUpdate = (
    index: number,
    field: "id_stock" | "cantidad_necesaria",
    value: number
  ) => {
    const updated = [...selectedStocks];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    const updated = selectedStocks.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <>
    <Grid container spacing={2} direction="column" sx={{ mt: 2 }}>
      <Typography variant="h6">Ingredientes</Typography>

      {selectedStocks.map((item, index) => (
        <Grid key={index} container spacing={2} alignItems="center">
          {/* Dropdown de stocks */}
          <Grid spacing={6}>
            <TextField
              select
              fullWidth
              label="Ingrediente"
              value={item.id_stock}
              onChange={(e) =>
                handleUpdate(index, "id_stock", Number(e.target.value))
              }
            >
              {availableStocks.map((stock) => (
                <MenuItem key={stock.id_stock} value={stock.id_stock}>
                  {stock.nombre}
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

      {/* Botón para agregar ingrediente */}
      <Grid>
        <IconButton onClick={handleAdd} color="primary">
          <AddIcon />
        </IconButton>
      </Grid>
    </Grid>
    </>
  );
};
