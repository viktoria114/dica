import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import { useNavigate } from "react-router-dom";

export interface Empleado {
  dni: number;
  username: string;
  nombre_completo: string;
  correo: string;
  telefono: number;
  password: string;
  rol: string;
}

interface FichaEmpleadoProps {
  empleado: Empleado;
}

export const FichaEmpleado: React.FC<FichaEmpleadoProps> = ({ empleado }) => {
  const navigate = useNavigate();

  const handleDetalle = () => {
    navigate("/empleados/" + empleado.dni);
  };

  return (
    <Card sx={{ maxWidth: { sm: 345, xs: "100%" } }}>
      <CardActionArea onClick={handleDetalle}>
        <CardContent>
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            sx={{ fontWeight: 700 }}
          >
            {empleado.nombre_completo}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "primary.main", fontWeight: 500 }}
          >
            DNI: {empleado.dni}
          </Typography>
          {empleado.telefono && (
            <Typography
              variant="body2"
              sx={{ color: "primary.main", fontWeight: 500 }}
            >
              Teléfono: {empleado.telefono}
            </Typography>
          )}
          {empleado.correo && (
            <Typography
              variant="body2"
              sx={{ color: "primary.main", fontWeight: 500 }}
            >
              Correo: {empleado.correo}
            </Typography>
          )}

          <Typography
            variant="body2"
            sx={{ color: "primary.main", fontWeight: 500 }}
          >
            Username: {empleado.username}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "primary.main", fontWeight: 500 }}
          >
            Rol: {empleado.rol}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
