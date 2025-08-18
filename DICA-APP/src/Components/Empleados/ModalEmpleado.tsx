import { useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { ModalBase } from "../common/ModalBase";
import type { Empleado } from "../../types";
import EmpleadoForm from "./FormEmpleado";
import { ButtonsNormalEmpleado } from "./ButtonsNormalEmpleado";
import { ButtonsPapeleraEmpleado } from "./ButtonsPapeleraEmpleado";

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
                //refetchEmpleados?.();
                setIsEditMode(false);
              }}
              onCancel={() => setIsEditMode(false)}
            />
          ) : (
            <>
              <Typography>  ● Nombre Completo: {empleado.nombre_completo} </Typography>
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
        <ButtonsNormalEmpleado
          setIsEditMode={() => setIsEditMode(true)}
          handleClose={handleClose}
          empleadoDni={empleado.dni}
        />
      )}

      {/* Si está en modo papelera y no en edición */}
      {!isEditMode && modoPapelera && (
        <ButtonsPapeleraEmpleado
          handleClose={handleClose}
          empleadoDni={empleado.dni}
        />
      )}
    </ModalBase>
  );
};
