// src/Components/Stock/RegistroStockManager.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  fetchRegistrosStock,
  fetchCrearRegistroStock,
  fetchActualizarRegistroStock,
  fetchEliminarRegistroStock,
} from "../../api/registroStock";
import type { RegistroStock } from "../../types";
import { useSnackbar } from "../../contexts/SnackbarContext";
import axios from "axios";

interface RegistroStockManagerProps {
  stockId: number;
  stockNombre: string;
}

export const RegistroStockManager: React.FC<RegistroStockManagerProps> = ({
  stockId,
  stockNombre,
}) => {
  const [registros, setRegistros] = useState<RegistroStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState<RegistroStock | null>(
    null
  );
  const { showSnackbar } = useSnackbar();

  const [formValues, setFormValues] = useState({
    cantidad_inicial: 0,
    cantidad_actual: 0,
    estado: "disponible",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Cargar registros al montar
  const cargarRegistros = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRegistrosStock(stockId);
      setRegistros(data);
    } catch (error) {
      // Detecta si es un error HTTP 404 (no hay registros)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setRegistros([]); // Simplemente lista vacía
      } else if (error instanceof Error) {
        showSnackbar(error.message, "warning");
      }
    } finally {
      setLoading(false);
    }
  }, [stockId, showSnackbar]);

  useEffect(() => {
    cargarRegistros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockId]);

  const handleOpenModal = (registro?: RegistroStock) => {
    if (registro) {
      setEditingRegistro(registro);
      setFormValues({
        cantidad_inicial: registro.cantidad_inicial,
        cantidad_actual: registro.cantidad_actual,
        estado: registro.estado,
      });
    } else {
      setEditingRegistro(null);
      setFormValues({
        cantidad_inicial: 0,
        cantidad_actual: 0,
        estado: "disponible",
      });
    }
    setFormErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingRegistro(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (formValues.cantidad_inicial <= 0) {
      errors.cantidad_inicial =
        "La cantidad inicial debe ser un número positivo";
    }
    if (formValues.cantidad_actual < 0) {
      errors.cantidad_actual = "La cantidad actual no puede ser negativa";
    }
    if (formValues.cantidad_actual > formValues.cantidad_inicial) {
      errors.cantidad_actual =
        "La cantidad actual no puede ser mayor que la inicial";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingRegistro) {
        // Actualizar
        await fetchActualizarRegistroStock(editingRegistro.id!, {
          ...formValues,
          fk_stock: stockId,
        });
        showSnackbar("Registro actualizado correctamente", "success");
      } else {
        // Crear
        await fetchCrearRegistroStock({
          ...formValues,
          cantidad: formValues.cantidad_inicial,
          fk_stock: stockId,
        });
        showSnackbar("Registro creado correctamente", "success");
      }
      await cargarRegistros();
      handleCloseModal();
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar(error.message, "error");
      }
    }
  };

  const handleDelete = async (registroId: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de eliminar este registro? Esto reducirá el stock actual."
    );
    if (!confirmar) return;

    try {
      await fetchEliminarRegistroStock(registroId);
      showSnackbar("Registro eliminado correctamente", "success");
      await cargarRegistros();
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar(error.message, "error");
      }
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-AR");
  };

  return (
    <Box sx={{ mt: 3, borderTop: "2px solid #ddd", pt: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" color="primary">
          Registros de Stock - {stockNombre}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          size="small"
        >
          Agregar Registro
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : registros.length === 0 ? (
        <Typography color="text.primary" align="center" sx={{ py: 3 }}>
          No hay registros de stock para este producto.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Cantidad Inicial</TableCell>
                <TableCell align="right">Cantidad Actual</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registros.map((registro) => (
                <TableRow key={registro.id}>
                  <TableCell>{formatDate(registro.fk_fecha)}</TableCell>
                  <TableCell align="right">
                    {registro.cantidad_inicial}
                  </TableCell>
                  <TableCell align="right">
                    {registro.cantidad_actual}
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color:
                          registro.estado === "disponible"
                            ? "success.main"
                            : registro.estado === "vencido"
                            ? "error.main"
                            : "warning.main",
                        fontWeight: 500,
                      }}
                    >
                      {registro.estado.toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenModal(registro)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(registro.id!)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal de Crear/Editar */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingRegistro ? "Editar Registro" : "Nuevo Registro de Stock"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Cantidad Inicial"
              type="number"
              value={
                formValues.cantidad_inicial === 0
                  ? ""
                  : formValues.cantidad_inicial
              }
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  cantidad_inicial:
                    e.target.value === "" ? 0 : Number(e.target.value),
                })
              }
              error={!!formErrors.cantidad_inicial}
              helperText={formErrors.cantidad_inicial}
              InputProps={{ inputProps: { min: 0 } }}
              disabled={!!editingRegistro}
              focused
            />

            <TextField
              label="Cantidad Actual"
              type="number"
              value={
                formValues.cantidad_actual === 0
                  ? ""
                  : formValues.cantidad_actual
              }
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  cantidad_actual:
                    e.target.value === "" ? 0 : Number(e.target.value),
                })
              }
              error={!!formErrors.cantidad_actual}
              helperText={formErrors.cantidad_actual}
              InputProps={{ inputProps: { min: 0 } }}
              disabled={!editingRegistro}
              focused
            />

            <TextField
              select
              label="Estado"
              value={formValues.estado}
              onChange={(e) =>
                setFormValues({ ...formValues, estado: e.target.value })
              }
              disabled={!editingRegistro}
              focused
            >
              <MenuItem value="disponible">Disponible</MenuItem>
              <MenuItem value="agotado">Agotado</MenuItem>
              <MenuItem value="vencido">Vencido</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingRegistro ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
