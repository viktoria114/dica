import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { useState } from "react";
import type { Empleado } from "../../types";
import { useFormEmpleado } from "../../hooks/useFormEmpleado";
import type { FieldConfig } from "./FormBase";

interface Campo<T> {
  label: string;
  value: (item: T) => string | undefined;
}

interface FichaItemProps<T> {
  item: T;
  titulo: (item: T) => string;
  campos: Campo<T>[];
  ModalComponent: React.ComponentType<{
    open: boolean;
    handleClose: () => void;
    item: T;
    modoPapelera?: boolean;
  }>;
  modoPapelera?: boolean;
}

const empleadoFields: FieldConfig<Empleado>[] = [
  { name: "nombre_completo", label: "Nombre Completo" },
  { name: "username", label: "Usuario" },
  { name: "correo", label: "Correo" },
  { name: "telefono", label: "Teléfono" },
  { name: "dni", label: "DNI", onlyInCreate: true },
  { name: "password", label: "Contraseña", type: "password", onlyInCreate: true },
  {
    name: "rol",
    label: "Rol",
    type: "select",
    options: [
      { value: "admin", label: "Admin" },
      { value: "cajero", label: "Cajero" },
      { value: "repartidor", label: "Repartidor" },
      { value: "cocinero", label: "Cocinero" },
    ],
  },
];

export function FichaItem<T>({
  item,
  titulo,
  campos,
  ModalComponent,
  modoPapelera,
  initialValues,
  onSuccess,
  modo = "editar",
}: FichaItemProps<T>) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { formErrors, editValues, handleChange, handleGuardar, isSaving } =
    useFormEmpleado(initialValues, onSuccess, modo);

  return (
    <>
      <Card>
        <CardActionArea onClick={handleOpen}>
          <CardContent>
            <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
              {titulo(item)}
            </Typography>
            {campos.map((campo, i) => {
              const value = campo.value(item);
              return value ? (
                <Typography
                  key={i}
                  variant="body2"
                  sx={{ color: "primary.main", fontWeight: 500 }}
                >
                  {campo.label}: {value}
                </Typography>
              ) : null;
            })}
          </CardContent>
        </CardActionArea>
      </Card>

      <ModalComponent
        modo={"editar"}
        open={open}
        handleClose={handleClose}
        item={item}
        modoPapelera={modoPapelera}
      />
    </>
  );
}
