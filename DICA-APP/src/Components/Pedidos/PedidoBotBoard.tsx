import { Grid, Typography, Card, CardContent, Container } from "@mui/material";
import type { Pedido } from "../../types";

// ... (definición de 'estadosdelBot' aquí o importada)
const estadosdelBot = [
  { id: 6, nombre: "En Construcción" },
  { id: 7, nombre: "A Confirmar" },
  { id: 8, nombre: "En Espera a Cancelar" },
];
interface PedidoBotBoardProps {
  pedidos: Pedido[];
  onPedidoClick: (pedido: Pedido) => void;
}

export const PedidoBotBoard = ({ pedidos, onPedidoClick }: PedidoBotBoardProps) => (
  <Container sx={{ mb: 4 }}>
   <Typography variant="h5" sx={{ mt: 6, mb: 2, textAlign: "center" }}>
  Pendientes de Confirmación
</Typography>
    <Grid container spacing={2} justifyContent="center">
      {estadosdelBot.map((estado) => (
        <Grid key={estado.id}>
         <Typography
        variant="h6"
        sx={{ fontWeight: 550, mb: 1, textAlign: "center" }}
      >
        {estado.nombre}
      </Typography>
           <div
        style={{
          background: "#fafafa",
          minHeight: 400,
          minWidth: 180,
          padding: 8,
          borderRadius: 8,
          border: "1px solid #ddd",
        }}
      >
            {pedidos
              .filter((p: Pedido) => p.fk_estado === estado.id)
              .map((pedido: Pedido) => (
                <Card
                  key={pedido.pedido_id}
                   sx={{
                mb: 1,
                backgroundColor: "white",
                boxShadow: 2,
                ":hover": { cursor: "pointer", bgcolor: "#f0f0f0" },
              }}
                  onClick={() => onPedidoClick(pedido)}
                >
                  <CardContent>
                   <Typography variant="subtitle1">
                  Pedido #{pedido.pedido_id}
                </Typography>
                <Typography variant="body2" color="secondary.main">
                   Teléfono: {pedido.id_cliente}
                </Typography>
                  </CardContent>
                </Card>
              ))}
          </div>
        </Grid>
      ))}
    </Grid>
  </Container>
);