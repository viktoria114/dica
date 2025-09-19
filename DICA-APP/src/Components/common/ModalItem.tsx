import { useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { ModalBase } from "../common/ModalBase";

interface Campo<T> {
  label: string;
  value: (item: T) => string | undefined;
}

interface ModalItemProps<T> {
  open: boolean;
  handleClose: () => void;
  item: T;
  modoPapelera?: boolean;
  title: string;
  campos: Campo<T>[];
  FormComponent?: React.ComponentType<{
    modo: "crear" | "editar";
    initialValues: T;
    onSuccess: () => void;
    onCancel: () => void;
  }>;
  renderButtons?: (args: {
    item: T;
    setIsEditMode: (val: boolean) => void;
    handleClose: () => void;
    isEditMode: boolean;
    modoPapelera?: boolean;
  }) => React.ReactNode;
}

export function ModalItem<T>({
  open,
  handleClose,
  item,
  modoPapelera,
  title,
  campos,
  FormComponent,
  renderButtons,
}: ModalItemProps<T>) {
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <ModalBase open={open} onClose={handleClose}>
      <Grid container spacing={2} direction="column">
        {!isEditMode && (
          <Typography variant="h4" align="center" fontWeight={600}>
            {title}
          </Typography>
        )}

        <Box sx={{ ml: { sm: 0, xs: 2 } }}>
          {isEditMode && FormComponent ? (
            <FormComponent
              modo="editar"
              initialValues={item}
              onSuccess={() => setIsEditMode(false)}
              onCancel={() => setIsEditMode(false)}
            />
          ) : (
            campos.map((campo, i) => (
              <Typography key={i}>● {campo.label}: {campo.value(item) || "-"}</Typography>
            ))
          )}
        </Box>
      </Grid>

      {renderButtons &&
        renderButtons({ item, setIsEditMode, handleClose, isEditMode, modoPapelera })}
    </ModalBase>
  );
}
