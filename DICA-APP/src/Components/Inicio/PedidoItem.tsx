import { Divider, Typography } from "@mui/material";

type Props = {
 id: number,
 nombre: string,
 lugar: string,
 precio: number
}
export const PedidoItem = ({ id, nombre, lugar, precio }: Props) => {
  return ( 
   <>
    <Typography variant="h5" mt={2}>
      #{id}
    </Typography>
    <Typography>Nombre: {nombre}</Typography>
    <Typography>Lugar: {lugar}</Typography>
    <Typography>Precio: ${precio}</Typography>
    <Divider sx={{ p: 0.5, borderColor: "primary.main", borderBottomWidth: 1 }} />
  </>
  );
}