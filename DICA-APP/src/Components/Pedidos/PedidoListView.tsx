import { Card, CardContent, Typography } from "@mui/material";
import type { Pedido } from "../../types";

interface PedidoListViewProps {
  pedidos: Pedido[];
  onPedidoClick: (pedido: Pedido) => void;
}

export const PedidoListView = ({ pedidos, onPedidoClick }: PedidoListViewProps) => (
  <>
    {pedidos.map(p => (
      <Card 
        onClick={() => onPedidoClick(p)} 
        key={p.pedido_id} 
        sx={{ mb: 1, ":hover": { cursor: "pointer", bgcolor: "#f0f0f0" } }}
      >
        <CardContent>
          <Typography>Pedido #{p.pedido_id}</Typography>
          <Typography color="secondary.main"> {p.id_cliente} – {p.observaciones}</Typography> {//ACA TENDRIA Q PONER PORQUE CARAJO SE CANCELO O SE BORRO
          }
        </CardContent>
      </Card>
    ))}
  </>
);