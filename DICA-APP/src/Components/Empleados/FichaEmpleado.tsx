import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import { ModalDetalles } from "./ModalEmpleado";
import { useState } from "react";
import type { Empleado } from "../../types";

interface FichaEmpleadoProps {
  empleado: Empleado;
}

export const FichaEmpleado: React.FC<FichaEmpleadoProps> = ({ empleado }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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

      <ModalDetalles
        open={open}
        handleClose={handleClose}
        empleado={empleado}
      />
    </>
  );
};
