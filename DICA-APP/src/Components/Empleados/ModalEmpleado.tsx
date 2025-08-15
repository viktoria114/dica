import { useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { ModalBase } from "../common/ModalBase";
import { useBorrarEmpleado } from "../../hooks/useBorrarEmpleado";
import { useGetEmpleados } from "../../hooks/useGetEmpleados";
import type { Empleado } from "../../types";
import EmpleadoForm from "./FormEmpleado";
import RestoreIcon from '@mui/icons-material/Restore';

interface ModalEmpleadoProps {
  open: boolean;
  handleClose: () => void;
  empleado: Empleado;
   modoPapelera?: boolean;
}



export const ModalEmpleado = ({
  open,
  handleClose,
  empleado,
  modoPapelera,
}: ModalEmpleadoProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { refetchEmpleados } = useGetEmpleados();
  const { borrarEmpleado, isDeleting } = useBorrarEmpleado(() => {
    refetchEmpleados?.();
    handleClose();
  });

const restaurarEmpleado= (dni: string) => {
  console.log("ola", dni);
  
}

  return (
    <ModalBase open={open} onClose={handleClose}>
      <Grid container spacing={2} direction="column">
        {!isEditMode && (
          <Typography variant="h4" align="center" fontWeight={600}>
            Detalles del Empleado
          </Typography>
        )}

        <Box sx={{ ml: { sm: 0, xs: 2 } }}>
          {isEditMode ? (
            <EmpleadoForm
              modo="editar"
              initialValues={empleado}
              onSuccess={() => {
                refetchEmpleados?.();
                setIsEditMode(false);
              }}
              onCancel={() => setIsEditMode(false)}
            />
          ) : (
            <>
              <Typography>● Nombre Completo: {empleado.nombre_completo}</Typography>
              <Typography>● DNI: {empleado.dni}</Typography>
              <Typography>● Usuario: {empleado.username}</Typography>
              <Typography>● Correo: {empleado.correo || "-"}</Typography>
              <Typography>● Teléfono: {empleado.telefono || "-"}</Typography>
              <Typography>● Rol: {empleado.rol}</Typography>
            </>
          )}
        </Box>
      </Grid>

     {!isEditMode && !modoPapelera && (
  <Box sx={{ display: "flex", justifyContent: "center", mt: 4, gap: 2 }}>
    <Button
      sx={{ height: 50 }}
      variant="contained"
      onClick={() => setIsEditMode(true)}
      startIcon={<EditIcon />}
    >
      Editar
    </Button>
    <Button
      sx={{ height: 50 }}
      variant="contained"
      color="error"
      onClick={() => borrarEmpleado(empleado.dni)}
      startIcon={<DeleteIcon />}
      loading={isDeleting}
    >
      Borrar
    </Button>
    <Button
      sx={{ height: 50 }}
      variant="outlined"
      onClick={handleClose}
      startIcon={<CloseIcon />}
    >
      Cerrar
    </Button>
  </Box>
)}

{/* Si está en modo papelera y no en edición */}
{!isEditMode && modoPapelera && (
  <Box sx={{ display: "flex", justifyContent: "center", mt: 4, gap: 2 }}>
    <Button
      sx={{ height: 50 }}
      variant="contained"
      color="success"
      onClick={() => restaurarEmpleado(empleado.dni)}
      startIcon={<RestoreIcon />}
      //loading={isRestoring}
    >
      Restaurar
    </Button>
    <Button
      sx={{ height: 50 }}
      variant="outlined"
      onClick={handleClose}
      startIcon={<CloseIcon />}
    >
      Cerrar
    </Button>
  </Box>
)}

    </ModalBase>
  );
};
