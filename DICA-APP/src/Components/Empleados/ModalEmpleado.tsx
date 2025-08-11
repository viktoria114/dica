import React, { useState } from "react";
import { Box, Button, Grid, Modal, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import type { Empleado } from "../../types";
import EmpleadoForm from "./FormEmpleado";
import { useBorrarEmpleado } from "../../hooks/useBorrarEmpleado";
import { useGetEmpleados } from "../../hooks/useGetEmpleados";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { sm: 400, xs: "100%" },
  height: { xs: "100%", sm: "auto" },
  bgcolor: "background.paper",
  border: "2px solid #495E57",
  p: 4,
  boxShadow: 1,
  borderRadius: 2,
};

interface ModalDetallesProps {
  open: boolean;
  handleClose: () => void;
  empleado: Empleado;
}

export const ModalDetalles: React.FC<ModalDetallesProps> = ({
  open,
  handleClose,
  empleado,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const { refetchEmpleados } = useGetEmpleados();

  const handleEditar = () => {
    setIsEditMode(true);
  };

  const handleCancelarEdicion = () => {
    setIsEditMode(false);
  };

  const { borrarEmpleado, isDeleting } = useBorrarEmpleado(() => {
    refetchEmpleados?.();
    handleClose();
  });

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Grid container spacing={2} direction="column">
          <Grid>
            <Typography
              variant="h4"
              align="center"
              sx={{ fontWeight: 600, mt: { xs: 5, sm: 0 } }}
            >
              {isEditMode ? "" : "Detalles del Empleado"}
            </Typography>
          </Grid>

          <Grid sx={{ ml: { sm: 0, xs: 7 } }}>
            {isEditMode ? (
              <EmpleadoForm
                modo="editar"
                initialValues={empleado}
                onSuccess={() => {
                  refetchEmpleados?.();
                  setIsEditMode(false);
                }}
                onCancel={handleCancelarEdicion}
              />
            ) : (
              <>
                <Typography variant="h6">
                  ● Nombre Completo: {empleado.nombre_completo}
                </Typography>
                <Typography variant="h6">● DNI: {empleado.dni}</Typography>
                <Typography variant="h6">
                  ● Usuario: {empleado.username}
                </Typography>
                <Typography variant="h6">
                  ● Correo: {empleado.correo || "-"}
                </Typography>
                <Typography variant="h6">
                  ● Teléfono: {empleado.telefono || "-"}
                </Typography>
                <Typography variant="h6">● Rol: {empleado.rol}</Typography>
              </>
            )}
          </Grid>
        </Grid>

        {!isEditMode && (
          <Box
            sx={{ display: "flex", justifyContent: "center", mt: 4, gap: 2 }}
          >
            <Button
              variant="contained"
              sx={{ bgcolor: "primary.main", height: 50 }}
              onClick={handleEditar}
              startIcon={<EditIcon />}
            >
              Editar
            </Button>
            <Button
              variant="contained"
              color="error"
              sx={{ height: 50 }}
              onClick={() => borrarEmpleado(empleado.dni)}
              startIcon={<DeleteIcon />}
              loading={isDeleting}
            >
              Borrar
            </Button>

            <Button
              variant="outlined"
              sx={{ height: 50 }}
              onClick={handleClose}
              startIcon={<CloseIcon />}
            >
              Cerrar
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};
