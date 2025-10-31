/* eslint-disable @typescript-eslint/no-explicit-any */
import { Container, Grid, Typography, Card, CardContent, CircularProgress, Alert } from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import type { ItemsMenu, ItemsYPromociones, Pedido } from "../types";
import { getPedidos, getPedidosBorrados } from "../api/pedidos";
import { SearchBar } from "../Components/common/SearchBar";
import { ModalBase } from "../Components/common/ModalBase";
import { usePedidoForm } from "../hooks/usePedidoForm";
import { ItemSelector } from "../Components/common/ItemSelector";
import { useMenu } from "../hooks/useMenu";

/*const pedidosmock: Pedido[] = [
  { pedido_id: 1, id_fecha: new Date("2025-05-24"), hora: "12:00", id_cliente: 1, ubicacion: "Centro", visibilidad: true, fk_estado: 1, observaciones: "vegetariano" },
  { pedido_id: 2, id_fecha: new Date("2025-05-02"), hora: "13:00", id_cliente: 2, ubicacion: "Norte", visibilidad: true, fk_estado: 2, observaciones: "sin gluten" },
  { pedido_id: 3, id_fecha: new Date("2025-05-15"), hora: "14:00", id_cliente: 3, ubicacion: "Sur", visibilidad: true, fk_estado: 3, observaciones: "" },
  { pedido_id: 4, id_fecha: new Date("2025-05-20"), hora: "15:00", id_cliente: 4, ubicacion: "Este", visibilidad: true, fk_estado: 4, observaciones: "sin lactosa" },
  { pedido_id: 5, id_fecha: new Date("2025-05-18"), hora: "16:00", id_cliente: 5, ubicacion: "Oeste", visibilidad: true, fk_estado: 5, observaciones: "" },
  { pedido_id: 6, id_fecha: new Date("2025-05-25"), hora: "17:00", id_cliente: 6, ubicacion: "Centro", visibilidad: true, fk_estado: 1, observaciones: "vegetariano" }
];
*/

const estados = [
  { id: 1, nombre: "Pendiente" },
  { id: 2, nombre: "En Preparación" },
  { id: 3, nombre: "Listo" },
  { id: 4, nombre: "Por Entregar" },
  { id: 5, nombre: "Entregado" },

];

const estadosdelBot = [
  { id: 6, nombre: "En Construcción" },
  { id: 7, nombre: "A Confirmar" },
  { id: 8, nombre: "En Espera a Cancelar" },
];

export const Pedidos = () => {
  // 1. Estados para manejar los datos del backend
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([]);
const [modo, setModo] = useState<"normal" | "borrados" | "cancelados">("normal");
const [pedidosBorrados, setPedidosBorrados] = useState<Pedido[]>([]);
const { menus } = useMenu();

const { open,
    setOpen,
    isSaving,
    formValues,
    setFormValues,
    formErrors,
    handleChange,
    handleSubmit,
    pedidoFields }= usePedidoForm();

const abrirDetallePedido = (pedido: Pedido) => {
  setFormValues(pedido);
  setOpen(true);
};

// Función para cerrar modal
const cerrarModalPedido = () => {
  setFormValues({} as Pedido);
  setOpen(false);
};

// Cargar pedidos borrados
useEffect(() => {
  const cargarBorrados = async () => {
    try {
      const data = await getPedidosBorrados(); // otro endpoint
      setPedidosBorrados(data);
    } catch (err) {
      console.error("Error cargando borrados", err);
    }
  };
  cargarBorrados();
}, []);

  // 2. useEffect para cargar los datos al montar el componente
  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPedidos();
        console.log(data);
        
        const pedidosBackend = data.map((p: any) => ({
  pedido_id: p.pedido_id,
  id_fecha: p.id_fecha,
  hora: p.hora,
  id_cliente: p.id_cliente,
  ubicacion: p.ubicacion,
  visibilidad: p.visibilidad,
 fk_estado: p.fk_estado ?? p.id_estado, 
  observaciones: p.observaciones,
  items: p.items,
  promociones: p.promociones,
}));
setPedidos(pedidosBackend);
console.log(pedidosBackend);

      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, []); // El array vacío asegura que solo se ejecute al montar

  // Función para actualizar la lista filtrada desde SearchBar
const actualizarPedidosFiltrados = (filtered: Pedido[]) => {
  setPedidosFiltrados(filtered);
};

// Función para cambiar el modo
const cambiarModo = (nuevoModo: "borrados" | "cancelados" | "normal") => {
  setModo(nuevoModo);
};

const abrirModalNuevoPedido = () => {
  setFormValues({ /* inicializa con valores por defecto */ } as Pedido);
  
  console.log("nuevooo");
  
};


// Pedidos a mostrar según el modo y el filtro
const pedidosAMostrar = () => {
  const base = pedidosFiltrados.length > 0 ? pedidosFiltrados : pedidos;
  switch (modo) {
    case "normal":
      return base; // visibles
    case "borrados":
      return pedidosBorrados;
    case "cancelados":
      return pedidos.filter(p => p.fk_estado === 9);
    default:
      return base;
  }
};

  // 3. Modificamos la lógica de arrastrar para usar el campo correcto si es necesario
  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const newEstadoId = Number(destination.droppableId);
    
setPedidos((prev) =>
  prev.map((p) =>
    p.pedido_id === Number(draggableId)
      ? { ...p, fk_estado: newEstadoId }
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
  if (modo === "cancelados") {
  return (
    <Container sx={{ mt: 4 }}>
      <SearchBar
  baseList={pedidosAMostrar()}
  getLabel={(p) => `Pedido #${p.pedido_id} de ${p.id_cliente ?? ""}`}
  onResults={actualizarPedidosFiltrados} // usa la función de filtrado
 disableAdd
  onShowCancelados={() => cambiarModo("normal")} // cambia a modo cancelados
  canceladosLabel="VOLVER"
/>
      <Typography variant="h6">Pedidos Cancelados</Typography>
      {pedidosAMostrar().map(p => (
        <Card key={p.pedido_id} sx={{ mb: 1, ":hover": { cursor: "pointer", bgcolor: "#f0f0f0" } }}>
          <CardContent>
            <Typography>Pedido #{p.pedido_id}</Typography>
            <Typography color="secondary.main">{p.ubicacion} – {p.hora}</Typography>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}
  // 5. Renderizado principal (usa los pedidos cargados del estado)
  return (
    <>
    <Container sx={{ mt: 4, mb: 2 }}>
     <SearchBar
  baseList={pedidosAMostrar()}
  getLabel={(p) => `Pedido #${p.pedido_id} de ${p.id_cliente ?? ""}`}
  onResults={actualizarPedidosFiltrados} // usa la función de filtrado
  onAdd={() => abrirModalNuevoPedido()}
  onShowInvisibles={() => cambiarModo("borrados")} // cambia a modo borrados
  onShowCancelados={() => cambiarModo("cancelados")} // cambia a modo cancelados
/>
    </Container>
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
                   

                    {pedidosAMostrar()
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
                              onClick={() => abrirDetallePedido(pedido)}
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
    </Container>

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
        {pedidosAMostrar()
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
    <ModalBase<Pedido>
  modo="editar"
  entityName="Pedido"
  open={open}
  onClose={cerrarModalPedido}
  values={formValues}
  formErrors={formErrors}
  fields={pedidoFields}
  handleChange={handleChange}
  handleGuardar={async () => {
    await handleSubmit(formValues); // guarda en backend
    setPedidos((prev) =>
      prev.map((p) =>
        p.pedido_id === formValues.pedido_id ? formValues : p
      )
    );
    cerrarModalPedido();
  }}
  idField="pedido_id"
   isSaving={isSaving}
         displayFields={[
        { label: "Teléfono del Cliente", value: formValues.id_cliente },
        { label: "Observaciones", value: formValues.observaciones },
        { label: "Ubicación", value: formValues.ubicacion },
        { label: "Fecha", value: formValues.id_fecha ? formValues.id_fecha.toISOString() : null },
        { label: "Hora", value: formValues.hora },
      ]}
      >
              <ItemSelector<ItemsMenu>
  label="Items del menú"
  idField="item_id"
  availableItems={menus} // lista general de ítems del backend
  selectedItems={formValues.items || []}
  onChange={(newItems) =>
    setFormValues((prev) => ({ ...prev, items: newItems }))
  }
  columns={[
    { key: "nombre", label: "Item" },
    { key: "cantidad", label: "Cantidad", type: "number", editable: true },
  ]}
/>

<ItemSelector<ItemsYPromociones>
  label="Promociones"
  idField="promocion_id"
  availableItems={availablePromos} // lista general de promociones
  selectedItems={formValues.promociones || []}
  onChange={(newPromos) =>
    setFormValues((prev) => ({ ...prev, promociones: newPromos }))
  }
  columns={[
    { key: "nombre", label: "Promoción" },
    { key: "cantidad", label: "Cantidad", type: "number", editable: true },
  ]}
/>

    </ModalBase>
    </>
  );
};
