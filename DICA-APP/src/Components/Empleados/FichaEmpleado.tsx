import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import { useState } from "react";
import type { Empleado } from "../../types";
import { ModalBase } from "../common/ModalBase";
import { useFormEmpleado } from "../../hooks/useFormEmpleado";

interface FichaEmpleadoProps {
  empleado: Empleado;
  modoPapelera?: boolean;
}

export const FichaEmpleado: React.FC<FichaEmpleadoProps> = ({
  empleado,
  modoPapelera,
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);

  const initialValues = empleado;
  const onSuccess = () => {
    setOpen(false);
  };
  const {
    formErrors,
    editValues,
    empleadoFields,
    handleChange,
    handleGuardar,
    isSaving,
  } = useFormEmpleado(initialValues, onSuccess, "editar");

  return (
    <>
      <Card>
        <CardActionArea onClick={handleOpen}>
          <CardContent>
            <Typography
              gutterBottom
              variant="h5"
              component="div"
              sx={{ fontWeight: 700 }}
            >
              {empleado.nombre_completo}
            </Typography>
            {empleado.telefono && (
              <Typography
                variant="body2"
                sx={{ color: "primary.main", fontWeight: 500 }}
              >
                Teléfono: {empleado.telefono}
              </Typography>
            )}
            <Typography
              variant="body2"
              sx={{ color: "primary.main", fontWeight: 500 }}
            >
              Rol: {empleado.rol}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>

      <ModalBase
        open={open}
        empleado={empleado}
        modoPapelera={modoPapelera}
        modo="editar"
        empleadoFields={empleadoFields}
        formErrors={formErrors}
        editValues={editValues}
        handleChange={handleChange}
        handleGuardar={handleGuardar}
        handleClose={() => setOpen(false)}
        isSaving={isSaving}
      />
    </>
  );
};
