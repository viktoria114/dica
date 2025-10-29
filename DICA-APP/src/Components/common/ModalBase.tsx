import { Modal, Box, Grid, Typography } from "@mui/material";

import { useEffect, useState } from "react";

import GenericForm, { type FieldConfig } from "./FormBase";
import { ActionButtons } from "./ActionButtons";

interface DisplayField {
  label: string;
  value: string | number | null;
}
interface ModalBaseProps<T> {
  open: boolean;
  entityName?: string;
  onClose?: () => void;
  handleClose?: () => void;
  fields?: FieldConfig<T>[];
  handleChange?: (field: keyof T, value: string) => void;
  handleGuardar?: (values: T) => void;
  isSaving?: boolean;
  values?: T;
  modoPapelera?: boolean;
  modo: "crear" | "editar";
  formErrors: Partial<Record<keyof T, string>>;
  borrar?: (id: string) => void; // 👈 genérico
  restaurar?: (id: string) => void; // 👈 genérico
  idField?: keyof T;
  isRestoring?: boolean; // 👈 nuevo prop
  isDeleting?: boolean; // 👈 nuevo prop
  displayFields?: DisplayField[];
  children?: React.ReactNode;
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

export function ModalBase<T>({
  open,
  entityName,
  handleChange,
  onClose,
  handleClose,
  handleGuardar,
  isSaving,
  modoPapelera,
  modo,
  fields,
  formErrors,
  values,
  borrar,
  restaurar,
  idField,
  isRestoring,
  isDeleting,
  displayFields,
  children,
}: ModalBaseProps<T>) {
  const [isEditMode, setIsEditMode] = useState(modo === "crear");

  useEffect(() => {
    if (open) {
      setIsEditMode(modo === "crear");
    }
  }, [open, modo]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Grid container spacing={2} direction="column">
          {modo === "editar" && !isEditMode && (
            <Typography variant="h4" align="center" fontWeight={600}>
              Detalles del {entityName}
            </Typography>
          )}

          <Box sx={{ ml: { sm: 0, xs: 2 } }}>
            {isEditMode || modo === "crear" ? (
              <GenericForm
                entityName={entityName || "Entidad"}
                fields={fields}
                modo={modo}
                formErrors={formErrors}
                values={values!}
                onCancel={handleClose}
                onChange={handleChange!}
                onSubmit={handleGuardar!}
                isSaving={isSaving}
              >
                {children}
              </GenericForm>
            ) : (
              <>
                {displayFields &&
                  displayFields.map((field, i) => (
                    <Typography key={i}>
                      ● {field.label}: {field.value ?? "-"}
                    </Typography>
                  ))}
              </>
            )}
          </Box>
        </Grid>

        {modo === "editar" && !isEditMode && (
          <>
            {modoPapelera ? (
              <ActionButtons
                mode="papelera"
                onRestore={() =>
                  idField &&
                  values?.[idField] &&
                  restaurar?.(String(values[idField]))
                }
                onCancel={handleClose}
                loadingRestore={isRestoring}
              />
            ) : (
              <ActionButtons
                mode="edicion"
                onEdit={!modoPapelera ? () => setIsEditMode(true) : undefined}
                onDelete={() =>
                  idField &&
                  values?.[idField] &&
                  borrar?.(String(values[idField]))
                }
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
