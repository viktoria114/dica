import { Container, Alert, LinearProgress } from "@mui/material";
import type { ItemsYPromociones } from "../types";
import { SearchBar } from "../Components/common/SearchBar";
import { type ItemSelectorColumn } from "../Components/common/ItemSelector";

// 1. Hooks de lógica
import { usePedidoModal } from "../hooks/Pedidos/usePedidoModal";
import { useRestaurarPedido } from "../hooks/Pedidos/useRestaurarPedido";

// 2. Hooks de datos para el modal
import { useMenu } from "../hooks/useMenu";
import { usePromociones } from "../hooks/Promocion/usePromociones";

// 3. Componentes de UI
import { PedidoKanbanBoard } from "../Components/Pedidos/PedidoKanbanBoard";
import { PedidoBotBoard } from "../Components/Pedidos/PedidoBotBoard";
import { PedidoListView } from "../Components/Pedidos/PedidoListView";
import { PedidoModal } from "../Components/Pedidos/PedidoModal";
import { usePedidos } from "../hooks/Pedidos/usePedido";

export const Pedidos = () => {
  // 1. Hook de datos principal
  const {
    loading,
    error,
    modo,
    pedidosAMostrar,
    allPedidos,
    cambiarModo,
    actualizarPedidosFiltrados,
    handleDragEnd,
    actualizarPedidoLocal,
  } = usePedidos();

  // 2. Hook del Modal (le pasamos el callback de actualización)
  const modalState = usePedidoModal(actualizarPedidoLocal);
  const { abrirModalDetalle, abrirModalNuevo } = modalState;

  // 3. Hooks de Acciones
  const restaurarState = useRestaurarPedido(() => {
    modalState.cerrarModal();
    // Aquí podrías llamar a 'refetch' de usePedidos
  });

  // 4. Hooks de datos para los ItemSelector
  const { menus } = useMenu();
  const { promociones } = usePromociones();

  // 5. Configuración del ItemSelector (se pasa al modal)
  const menuColumns: ItemSelectorColumn<ItemsYPromociones & { id: number }>[] =
    [
      { key: "nombre", label: "Nombre", editable: false, width: 5 },
      { key: "subtotal", label: "Subtotal", editable: false, width: 3 },
      {
        key: "cantidad",
        label: "Cantidad",
        editable: true,
        type: "number",
        width: 3,
      },
    ];

  // --- Renderizado de Carga y Error ---
  if (loading) {
    return <LinearProgress color="inherit" />;
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Error al cargar los pedidos: {error}</Alert>
      </Container>
    );
  }

  // --- Renderizado Principal ---
  return (
    <>
      <Container sx={{ mt: 4, mb: 2 }}>
        <SearchBar
          baseList={modo === "normal" ? allPedidos : pedidosAMostrar}
          getLabel={(p) => `Pedido #${p.pedido_id} de ${p.id_cliente ?? ""}`}
          onResults={actualizarPedidosFiltrados}
          onAdd={modo === "normal" ? abrirModalNuevo : undefined}
          disableAdd={modo !== "normal"}
          onShowCancelados={
            modo === "normal" ? () => cambiarModo("cancelados") : undefined
          }
          onShowInvisibles={
            modo !== "normal"
              ? () => cambiarModo("normal")
              : () => cambiarModo("borrados")
          }
          // Lógica para el botón de "Volver"
          papeleraLabel={modo !== "normal" ? "Volver" : "Papelera"}
        />
      </Container>

      {/* --- Renderizado condicional del contenido --- */}
      <Container sx={{ mt: 4, mb: 4 }}>
        {modo === "normal" ? (
          <>
            <PedidoKanbanBoard
              pedidos={pedidosAMostrar}
              onDragEnd={handleDragEnd}
              onPedidoClick={abrirModalDetalle}
            />
            <PedidoBotBoard
              pedidos={pedidosAMostrar}
              onPedidoClick={abrirModalDetalle}
            />
          </>
        ) : (
          <PedidoListView
            pedidos={pedidosAMostrar}
            onPedidoClick={(pedido) => abrirModalDetalle(pedido)}
          />
        )}
      </Container>

      {/* --- El Modal (ahora un solo componente) --- */}
      <PedidoModal
        modalState={modalState}
        restaurarState={restaurarState}
        allAvailableMenus={menus}
        allAvailablePromos={promociones}
        menuColumns={menuColumns}
        modoPapelera={modo !== "normal"}
      />
    </>
  );
};
