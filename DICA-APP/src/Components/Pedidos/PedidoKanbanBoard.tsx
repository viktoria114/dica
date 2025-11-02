import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Grid, Typography, Card, CardContent } from "@mui/material";
import type { Pedido } from "../../types";

// ... (definición de 'estados' aquí o importada)
const estados = [
  { id: 1, nombre: "Pendiente" },
  { id: 2, nombre: "En Preparación" },
  { id: 3, nombre: "Listo" },
  { id: 4, nombre: "Por Entregar" },
  { id: 5, nombre: "Entregado" },

];

interface PedidoKanbanBoardProps {
  pedidos: Pedido[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDragEnd: (result: any) => void;
  onPedidoClick: (pedido: Pedido) => void;
}

export const PedidoKanbanBoard = ({ pedidos, onDragEnd, onPedidoClick }: PedidoKanbanBoardProps) => (
  <DragDropContext onDragEnd={onDragEnd}>
    <Grid container spacing={2} justifyContent="center">
      {estados.map(estado => (
        <Grid key={estado.id}>
         <Typography variant="h6" sx={{ fontWeight: 550, mb: 1, textAlign: "center" }}>
                      {estado.nombre}
                    </Typography>
          <Droppable droppableId={String(estado.id)}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                      background: snapshot.isDraggingOver ? "#f0f0f0" : "#fafafa",
                      minHeight: 400,
                      minWidth: 180,
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
              >
                {pedidos
                  .filter(p => p.fk_estado === estado.id)
                  .map((pedido, index) => (
                    <Draggable
                      key={pedido.pedido_id}
                      draggableId={String(pedido.pedido_id)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{
                                mb: 1,
                                backgroundColor: snapshot.isDragging
                                  ? "#d0f0ff"
                                  : "white",
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
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </Grid>
      ))}
    </Grid>
  </DragDropContext>
);