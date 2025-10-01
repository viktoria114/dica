import { Modal, Box, Grid, Typography } from "@mui/material";
import type { Empleado } from "../../types";
import { useEffect, useState } from "react";
import { useBorrarEmpleado } from "../../hooks/useBorrarEmpleado";
import { useRestaurarEmpleado } from "../../hooks/useRestaurarEmpleado";
import GenericForm, { type FieldConfig } from "./FormBase";
import { ActionButtons } from "./ActionButtons";
interface ModalBaseProps {
  open: boolean;
  entityName?: string;
  onClose?: () => void;
  handleClose?: () => void;
   fields?: FieldConfig<Empleado>[];
    handleChange?: (field: keyof Empleado, value: string) => void;
    handleGuardar?: (values: Empleado) => void;
   isSaving?: boolean;
  empleado?: Empleado;
  modoPapelera?: boolean;
   modo: "crear" | "editar";
   empleadoFields?: FieldConfig<Empleado>[]
   formErrors: Partial<Record<keyof Empleado, string>>;
   editValues?: Empleado;
}

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { sm: 400, xs: "100%" },
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  border: "2px solid #495E57",
  p: 4,
  boxShadow: 1,
  borderRadius: 2,
};

export function ModalBase({
  open,
  entityName,
  handleChange,
  onClose,
  handleClose,
  handleGuardar,
  isSaving,
  empleado,
  modoPapelera,
  modo,
  empleadoFields,
  formErrors,
  editValues,
}: ModalBaseProps) {

   const [isEditMode, setIsEditMode] = useState(modo === "crear");
  
    const { borrarEmpleado, isDeleting } = useBorrarEmpleado(handleClose);
    const { restaurar, isRestoring } = useRestaurarEmpleado(handleClose ?? (() => {}));

     useEffect(() => {
    // Si el modo cambia a "crear", forzamos edición directa
    if (modo === "crear") {
      setIsEditMode(true);
    }
  }, [modo]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Grid container spacing={2} direction="column">
            {modo === "editar" && !isEditMode && (
            <Typography variant="h4" align="center" fontWeight={600}>
              Detalles del Empleado
            </Typography>
          )}

          <Box sx={{ ml: { sm: 0, xs: 2 } }}>
             {(isEditMode || modo === "crear") ? (
              <GenericForm<Empleado>
                entityName={entityName || "Empleado"}
                fields={empleadoFields}
                modo={modo}
                formErrors={formErrors}
                values={editValues!}
                 onCancel={handleClose}
                onChange={handleChange!}
                onSubmit={handleGuardar!}
                isSaving={isSaving}
              />
            ) : (
              <>
                <Typography>
                  {" "}
                  ● Nombre Completo: {empleado?.nombre_completo}{" "}
                </Typography>
                <Typography>● DNI: {empleado?.dni}</Typography>
                <Typography>● Usuario: {empleado?.username}</Typography>
                <Typography>● Correo: {empleado?.correo || "-"}</Typography>
                <Typography>● Teléfono: {empleado?.telefono || "-"}</Typography>
                <Typography>● Rol: {empleado?.rol}</Typography>
              </>
            )}
          </Box>
        </Grid>

        {modo === "editar" && !isEditMode && (
          <>
            {modoPapelera ? (
              <ActionButtons
                mode="papelera"
                onRestore={() => {
                  if (empleado?.dni) restaurar(empleado.dni);
                }}
                onCancel={handleClose}
                loadingRestore={isRestoring}
              />
            ) : (
              <ActionButtons
                mode="edicion"
                onEdit={() => setIsEditMode(true)}
                onDelete={() => empleado?.dni && borrarEmpleado(empleado.dni)}
                onCancel={handleClose}
                loadingDelete={isDeleting}
              />
            )}
          </>
        )}
      </Box>
    </Modal>
  );
}
