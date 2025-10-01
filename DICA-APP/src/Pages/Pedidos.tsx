import { Container, Divider, Grid, Typography } from "@mui/material";
import type { Pedido } from "../types";

const pedidosmock: Pedido[] = [
  { id: 1, id_fecha: new Date("2025-05-24"), hora: "12:00", id_cliente: 1, ubicacion: "Centro", visibilidad: true, id_estado: 1, observacion: "vegetariano" },
  { id: 2, id_fecha: new Date("2025-05-02"), hora: "13:00", id_cliente: 2, ubicacion: "Norte", visibilidad: true, id_estado: 2, observacion: "sin gluten" },
  { id: 3, id_fecha: new Date("2025-05-15"), hora: "14:00", id_cliente: 3, ubicacion: "Sur", visibilidad: true, id_estado: 3, observacion: "" },
  { id: 4, id_fecha: new Date("2025-05-20"), hora: "15:00", id_cliente: 4, ubicacion: "Este", visibilidad: true, id_estado: 4, observacion: "sin lactosa" },
  { id: 5, id_fecha: new Date("2025-05-18"), hora: "16:00", id_cliente: 5, ubicacion: "Oeste", visibilidad: true, id_estado: 5, observacion: "" },
];

type Props = {
 
}
export const Pedidos = ({}: Props) => {
    return ( 
<Container sx={{mt: 4, mb: 4}}>
<Grid container spacing={4} direction="row">
  <Grid>
    <Typography variant="h5">Pendiente</Typography>
    
  </Grid>
  <Divider sx={{ height: "500px"}} orientation="vertical"/>
  <Grid>
    <Typography variant="h5">En Preparacion</Typography>
  </Grid>
  <Divider sx={{ height: "500px"}} orientation="vertical"/>
   <Grid>
    <Typography variant="h5">Listo</Typography>
  </Grid>
   <Divider sx={{ height: "500px"}} orientation="vertical"/>
   <Grid>
    <Typography variant="h5">Por Entregar</Typography>
  </Grid>
   <Divider sx={{ height: "500px"}} orientation="vertical"/>
   <Grid>
    <Typography variant="h5">Entregado</Typography>
  </Grid>
</Grid>
</Container>
    );
}