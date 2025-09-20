import { useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { ModalBase } from "../common/ModalBase";
import type { Empleado } from "../../types";

import { ActionButtons } from "../common/ActionButtons";
import { useBorrarEmpleado } from "../../hooks/useBorrarEmpleado";
import { useRestaurarEmpleado } from "../../hooks/useRestaurarEmpleado";
import GenericForm from "../common/FormBase";
import { useFormEmpleado } from "../../hooks/useFormEmpleado";

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

  const { borrarEmpleado, isDeleting } = useBorrarEmpleado(handleClose);
  const { restaurar, isRestoring } = useRestaurarEmpleado(handleClose);
  const initialValues = empleado;

  const onSuccess = () => {
    //refetchEmpleados?.();
    setIsEditMode(false);
  };

  const { formErrors, editValues, handleChange, handleGuardar, isSaving, empleadoFields } =
    useFormEmpleado(initialValues, onSuccess, "editar");

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
            <GenericForm<Empleado>
              entityName="Empleado"
               fields={empleadoFields}
              modo="editar"
              formErrors={formErrors}
              values={editValues}
              onCancel={() => setIsEditMode(false)}
              onChange={handleChange}
              onSubmit={handleGuardar}
              isSaving={isSaving}
            />


          ) : (
            <>
              <Typography>
                {" "}
                ● Nombre Completo: {empleado.nombre_completo}{" "}
              </Typography>
              <Typography>● DNI: {empleado.dni}</Typography>
              <Typography>● Usuario: {empleado.username}</Typography>
              <Typography>● Correo: {empleado.correo || "-"}</Typography>
              <Typography>● Teléfono: {empleado.telefono || "-"}</Typography>
              <Typography>● Rol: {empleado.rol}</Typography>
            </>
          )}
        </Box>
      </Grid>

      {!isEditMode && (
        <>
          {modoPapelera ? (
            <ActionButtons
              mode="papelera"
              onRestore={() => restaurar(empleado.dni)}
              onCancel={handleClose}
              loadingRestore={isRestoring}
            />
          ) : (
            <ActionButtons
              mode="edicion"
              onEdit={() => setIsEditMode(true)}
              onDelete={() => borrarEmpleado(empleado.dni)}
              onCancel={handleClose}
              loadingDelete={isDeleting}
            />
          )}
        </>
      )}
    </ModalBase>
  );
};
