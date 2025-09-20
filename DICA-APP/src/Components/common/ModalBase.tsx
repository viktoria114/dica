import { useState, type ReactNode } from "react";
import { Box, Grid, Modal, Typography } from "@mui/material";
import FormBase, { type FieldConfig } from "./FormBase";


interface Campo<T> {
  label: string;
  value: (item: T) => string | undefined;
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

interface ModalBaseProps<T> {
  open: boolean;
  handleClose: () => void;
  item: T;
  modo?: "crear" | "editar";
  modoPapelera?: boolean;
  title: string;
  campos: Campo<T>[];

  // 👇 Props necesarios para FormBase
  fields: FieldConfig<T>[];
  formErrors: Partial<Record<keyof T, string>>;
  values: T;
  onChange: (field: keyof T, value: unknown) => void;
  onSubmit: (values: T) => void;
  onCancel?: () => void;
  isSaving?: boolean;
  disabledFields?: (keyof T)[];

  renderButtons?: (args: {
    item: T;
    setIsEditMode: (val: boolean) => void;
    handleClose: () => void;
    isEditMode: boolean;
    modoPapelera?: boolean;
  }) => ReactNode;
}

export function ModalBase<T>({
  open,
  modo,
  handleClose,
  item,
  modoPapelera,
  title,
  campos,

  // Props de FormBase
  fields,
  formErrors,
  values,
  onChange,
  onSubmit,
  onCancel,
  isSaving,
  disabledFields = [],

  renderButtons,
}: ModalBaseProps<T>) {
  const [isEditMode, setIsEditMode] = useState(modo === "crear");

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Grid container spacing={2} direction="column">
          {!isEditMode && (
            <Typography variant="h4" align="center" fontWeight={600}>
              {title}
            </Typography>
          )}

          <Box sx={{ ml: { sm: 0, xs: 2 } }}>
            {isEditMode ? (
              <FormBase<T>
                entityName={title}
                modo={modo || "editar"}
                fields={fields}
                formErrors={formErrors}
                values={values}
                onChange={onChange}
                onSubmit={onSubmit}
                onCancel={onCancel}
                isSaving={isSaving}
                disabledFields={disabledFields}
              />
            ) : (
              <>
                {campos.map((campo, i) => (
                  <Typography key={i}>
                    ● {campo.label}: {campo.value(item) ?? "-"}
                  </Typography>
                ))}
              </>
            )}
          </Box>
        </Grid>

        {renderButtons &&
          renderButtons({
            item,
            setIsEditMode,
            handleClose,
            isEditMode,
            modoPapelera,
          })}
      </Box>
    </Modal>
  );
}
