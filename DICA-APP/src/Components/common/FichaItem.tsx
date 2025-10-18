import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import { useState } from "react";
import { ModalBase } from "./ModalBase";
import type { FieldConfig } from "./FormBase";

interface DisplayField {
  label: string;
  value: string | number | null;
}

interface FichaItemProps<T> {
  entityName: string;
  item: T;
  idField: keyof T; // ejemplo: "dni" en Empleado
  modoPapelera?: boolean;
  displayFields: DisplayField[]; // qué campos se muestran en detalle
  getTitle: (item: T) => string; // título principal (ej: nombre)
  getSubtitle?: (item: T) => string | null; // opcional
  useFormHook: (
    initialValues: T,
    onSuccess: () => void,
    modo: "crear" | "editar"
  ) => {
    formErrors: Partial<Record<keyof T, string>>;
    editValues: T;
    handleChange: (field: keyof T, value: string) => void;
    handleGuardar: (values: T) => void;
    isSaving: boolean;
    fields: FieldConfig<T>[];
  };
  borrar?: (id: string) => void;
  restaurar?: (id: string) => void;
  isDeleting?: boolean;
  isRestoring?: boolean;
  children?: React.ReactNode;
}

export function FichaItem<T>({
  entityName,
  item,
  idField,
  modoPapelera,
  displayFields,
  getTitle,
  getSubtitle,
  useFormHook,
  borrar,
  restaurar,
  isDeleting,
  isRestoring,
  children
}: FichaItemProps<T>) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const onSuccess = () => setOpen(false);

  const {
    formErrors,
    editValues,
    handleChange,
    handleGuardar,
    isSaving,
    fields,
  } = useFormHook(item, onSuccess, "editar");


  return (
    <>
      <Card>
        <CardActionArea onClick={handleOpen}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {getTitle(item)}
            </Typography>
            {getSubtitle && (
              <Typography variant="body2" sx={{ color: "primary.main" }}>
                {getSubtitle(item)}
              </Typography>
            )}
          </CardContent>
        </CardActionArea>
      </Card>

      <ModalBase<T>
        open={open}
        entityName={entityName}
        modo="editar"
        fields={fields}
        values={editValues}
        formErrors={formErrors}
        handleChange={handleChange}
        handleGuardar={handleGuardar}
        handleClose={handleClose}
        isSaving={isSaving}
        idField={idField}
        modoPapelera={modoPapelera}
        borrar={borrar}
        restaurar={restaurar}
        isDeleting={isDeleting}
        isRestoring={isRestoring}
        displayFields={displayFields}
      >
        {children}
        </ModalBase>
    </>
  );
}
