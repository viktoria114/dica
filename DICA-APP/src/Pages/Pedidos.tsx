/* eslint-disable @typescript-eslint/no-explicit-any */
import { Container, Grid, Typography, Card, CardContent, CircularProgress, Alert } from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import type { Pedido } from "../types";
import { getPedidos } from "../api/pedidos";

const pedidosmock: Pedido[] = [
  { id: 1, id_fecha: new Date("2025-05-24"), hora: "12:00", id_cliente: 1, ubicacion: "Centro", visibilidad: true, id_estado: 1, observacion: "vegetariano" },
  { id: 2, id_fecha: new Date("2025-05-02"), hora: "13:00", id_cliente: 2, ubicacion: "Norte", visibilidad: true, id_estado: 2, observacion: "sin gluten" },
  { id: 3, id_fecha: new Date("2025-05-15"), hora: "14:00", id_cliente: 3, ubicacion: "Sur", visibilidad: true, id_estado: 3, observacion: "" },
  { id: 4, id_fecha: new Date("2025-05-20"), hora: "15:00", id_cliente: 4, ubicacion: "Este", visibilidad: true, id_estado: 4, observacion: "sin lactosa" },
  { id: 5, id_fecha: new Date("2025-05-18"), hora: "16:00", id_cliente: 5, ubicacion: "Oeste", visibilidad: true, id_estado: 5, observacion: "" },
  { id: 6, id_fecha: new Date("2025-05-25"), hora: "17:00", id_cliente: 6, ubicacion: "Centro", visibilidad: true, id_estado: 1, observacion: "vegetariano" }
];


const estados = [
  { id: 1, nombre: "Pendiente" },
  { id: 2, nombre: "En Preparación" },
  { id: 3, nombre: "Listo" },
  { id: 4, nombre: "Por Entregar" },
  { id: 5, nombre: "Entregado" },
];

export const Pedidos = () => {
  // 1. Estados para manejar los datos del backend
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. useEffect para cargar los datos al montar el componente
  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPedidos();
        console.log(data);
        
        // El backend usa fk_estado, pero tu mock y el componente usan id_estado.
        // Mapeamos los datos para estandarizar (O idealmente, usar el nombre del backend: fk_estado)
        const pedidosAdaptados: Pedido[] = data.map(p => ({
            ...p,
            id_estado: p.id_estado, // Adaptamos el nombre de la propiedad del backend
            // El mock usaba id_fecha: Date, el backend usa fk_fecha: string. Esto se arregla en la interface, pero no requiere cambio en la lógica de mapeo si la interface está bien.
        }));

        setPedidos(pedidosAdaptados);
      } catch (err) {
        // El error ya es un objeto Error gracias a la función fetchPedidos
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, []); // El array vacío asegura que solo se ejecute al montar

  // 3. Modificamos la lógica de arrastrar para usar el campo correcto si es necesario
  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newEstadoId = Number(destination.droppableId);
    
    setPedidos((prev) =>
      prev.map((p) =>
        p.id === Number(draggableId)
          ? { ...p, fk_estado: newEstadoId, id_estado: newEstadoId } // Usamos fk_estado (backend) y id_estado (frontend)
          : p
      )
    );
    
    // NOTA: Aquí DEBES hacer una llamada a la API para persistir el cambio de estado en el backend.
    // Ej: updatePedidoEstado(Number(draggableId), newEstadoId);
  };
  
  // 4. Mostrar estados de carga y error en el JSX
  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography>Cargando pedidos...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Error al cargar los pedidos: {error}
        </Alert>
      </Container>
    );
  }

  // 5. Renderizado principal (usa los pedidos cargados del estado)
  return (
    <Container sx={{ mt: 4, mb: 4, display: "flex", justifyContent: "center" }}>
      <DragDropContext onDragEnd={handleDragEnd}>
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
                   

                    {pedidosmock
                      .filter(p => p.id_estado === estado.id)
                      .map((pedido, index) => (
                        <Draggable
                          key={pedido.id}
                          draggableId={String(pedido.id)}
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
                              }}
                            >
                              <CardContent>
                                <Typography variant="subtitle1">
                                  Pedido #{pedido.id}
                                </Typography>
                                <Typography variant="body2" color="secondary.main">
                                  {pedido.ubicacion} – {pedido.hora}
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
    </Container>
  );
};
