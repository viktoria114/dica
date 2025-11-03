/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalBase } from "../common/ModalBase";
import { ItemSelector, type ItemSelectorColumn } from "../common/ItemSelector";
import type { Pedido, ItemsMenu, Promocion, ItemsYPromociones } from "../../types";
import type { usePedidoModal } from "../../hooks/Pedidos/usePedidoModal";
import type { useRestaurarPedido } from "../../hooks/Pedidos/useRestaurarPedido";
import { useBorrarPedido } from "../../hooks/Pedidos/useBorrarPedido";
import { useState } from "react";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { useConfirmarPedido } from "../../hooks/Pedidos/useConfirmarPedido";

// Props que recibe de los hooks
type PedidoModalProps = {
  // de usePedidoModal
  modalState: ReturnType<typeof usePedidoModal>;
  // de useRestaurarPedido
  restaurarState: ReturnType<typeof useRestaurarPedido>;
  // Datos para los selectores
  allAvailableMenus: ItemsMenu[];
  allAvailablePromos: Promocion[];
  menuColumns: ItemSelectorColumn<ItemsYPromociones & { id: number }>[];
  // Flag de modo (del hook usePedidos)
  modoPapelera: boolean;
};

export const PedidoModal = ({
  modalState,
  restaurarState,
  allAvailableMenus,
  allAvailablePromos,
  menuColumns,
  modoPapelera,
}: PedidoModalProps) => {
  const {
    open,
    form,
    selectedMenus,
    setSelectedMenus,
    selectedPromos,
    setSelectedPromos,
    cerrarModal,
    handleSubmitModal,
  } = modalState;
  
  const { 
    formValues, 
    formErrors, 
    pedidoFields, 
    handleChange, 
    isSaving,
  } = form;
  
  const handleBorrarSuccess = () => {
        cerrarModal()
    };

  const { restaurarP, isRestoringPedido } = restaurarState;
  const { isDeleting,  handleDelete}= useBorrarPedido(handleBorrarSuccess);

  // --- NUEVOS ESTADOS PARA LA CONFIRMACIÓN ---
const [confirmOpen, setConfirmOpen] = useState(false);
// 2. Estado para saber qué acción se está confirmando
const [confirmAction, setConfirmAction] = useState<"borrar" | "restaurar" | null>(null);
// 3. Obtener el ID del pedido actual (para el modal y las acciones)
const pedidoId = formValues.pedido_id;

const handleBorrarRequest = () => {
  if (pedidoId) {
    setConfirmAction("borrar");
    setConfirmOpen(true);
  }
};

// Lo que hace el botón de "Restaurar"
const handleRestaurarRequest = () => {
  if (pedidoId) {
    setConfirmAction("restaurar");
    setConfirmOpen(true);
  }
};

const handleConfirmAction = () => {
  if (!pedidoId) return; // Salir si no hay ID

  if (confirmAction === "borrar") {
    // Si confirmamos borrar
    handleDelete(Number(pedidoId)); // Llama a la lógica de borrado del hook
  } else if (confirmAction === "restaurar") {
    // Si confirmamos restaurar
    restaurarP(pedidoId); // Llama a la lógica de restauración del hook
  }

  // Cerrar el modal y resetear la acción
  setConfirmOpen(false);
  setConfirmAction(null);
};

const handleCloseConfirm = () => {
  setConfirmOpen(false);
  setConfirmAction(null);
};


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { confirmar, isConfirming } = useConfirmarPedido((_updatedPedido) => {
    cerrarModal(); 
});
const isSavingOrConfirming = isSaving || isConfirming;

const pedidoRequiereConfirmacion =
  (formValues as any).origen === "bot" && formValues.fk_estado === 7;

  const handleSaveOrConfirm = () => {
    console.log("ayuda");
    
    // 1. Si requiere confirmación Y el botón GUARDAR fue presionado, ejecutamos la confirmación.
    if (pedidoRequiereConfirmacion && pedidoId) {
        // Enviar el pedido completo (formValues) al hook
        confirmar(formValues as Pedido); // 👈 Pasamos el objeto pedido
    }

    // 2. Ejecutar el guardado del formulario (siempre se guarda, sea confirmación o cambios)
    handleSubmitModal();
};


  // Lógica de displayFields (la mantienes aquí)
  const displayFields = [
     { label: "Items", value: formValues.items ? formValues.items.map(i => `${i.nombre} x${i.cantidad}`).join(", ") : "-" },
     { label: "Promociones", value: formValues.promociones ? formValues.promociones.map(pr => `${pr.nombre} x${pr.cantidad}`).join(", ") : "-" },
        { label: "Total", value: formValues.precio_total ? formValues.precio_total : "0" },
        { label: "Teléfono del Cliente", value: formValues.id_cliente },
        { label: "Observaciones", value: formValues.observaciones },
        { label: "Ubicación", value: formValues.ubicacion },
        { label: "Fecha", value: formValues.fecha 
            ? new Date(formValues.fecha).toLocaleDateString('es-AR', { timeZone: 'UTC' }) 
            : '-'
},
        { label: "Hora", value: formValues.hora },
  ];

  return (
    <>
    <ModalBase<Pedido>
      modo={"editar"}
      modoPapelera={modoPapelera}
      entityName={`Pedido #${formValues.pedido_id}`}
      open={open}
      onClose={cerrarModal}
      handleClose={cerrarModal}
      values={formValues}
      formErrors={formErrors}
      fields={pedidoFields}
      handleChange={handleChange}
      handleGuardar={handleSubmitModal} // Se usa el wrapper
      idField="pedido_id"
      isSaving={isSaving}
      displayFields={displayFields}
borrar={handleBorrarRequest}
      isDeleting={isDeleting}
//handleEditar={handleEditOrConfirmRequest}
      labelEdit={pedidoRequiereConfirmacion ? "Editar y Confirmar" : "Editar"}
  labelsave={
        pedidoRequiereConfirmacion ? "Confirmar" : "Guardar"
      } 
      loadingSave={isSavingOrConfirming}
      // Lógica de restauración
      restaurar={handleRestaurarRequest}
      isRestoring={isRestoringPedido}
    >
      {/* Los selectores solo se muestran si NO estamos en modo papelera */}
      {!modoPapelera && (
        <>
          <ItemSelector<ItemsMenu & Record<string, any>, ItemsYPromociones & { id: number }>
  label="Menús del Pedido"
  availableItems={allAvailableMenus}
  selectedItems={selectedMenus as (ItemsYPromociones & { id: number })[]}
  onChange={setSelectedMenus}
  itemFactory={(menu) => ({
    id: menu.id,
    id_menu: menu.id,
    nombre: menu.nombre,
    precio_unitario: menu.precio,
    cantidad: 1, // Cantidad inicial
    subtotal: menu.precio * 1,
  })}
  columns={menuColumns}
  modalTitle="Seleccionar Menú"
  searchPlaceholder="Buscar menú por nombre..."
/>

<ItemSelector<Promocion & Record<string, any>, ItemsYPromociones & { id: number }>
  label="Promociones del Pedido"
  availableItems={allAvailablePromos}
  selectedItems={selectedPromos as (ItemsYPromociones & { id: number })[]}
  onChange={setSelectedPromos}
  itemFactory={(promo) => ({
    id: promo.id,
    id_promocion: promo.id,
    nombre: promo.nombre,
    precio_unitario: promo.precio, // o promo.precio_descuento, etc.
    cantidad: 1,
    subtotal: promo.precio * 1,
  })}
  columns={menuColumns} // Reutilizamos las columnas
  modalTitle="Seleccionar Promoción"
  searchPlaceholder="Buscar promoción..."
/>
        </>
      )}
    </ModalBase>
    
    <ConfirmationModal
              open={confirmOpen}
      onClose={handleCloseConfirm}
      onConfirm={handleConfirmAction} // Usa el handler unificado
      // **Título y Mensaje Dinámico**
      title={confirmAction === "borrar" ? "Confirmar Eliminación" : "Confirmar Restauración"}
      message={
        confirmAction === "borrar"
          ? `¿Está seguro de que desea el pedido #${pedidoId}?`
          : `¿Está seguro de que desea restaurar el pedido #${pedidoId}?`
      }
      // **Color de Botón Dinámico**
      confirmText={confirmAction === "borrar" ? "Sí, Eliminar" : "Sí, Restaurar"}
      cancelText="Cancelar"
      confirmButtonColor={confirmAction === "borrar" ? "error" : "success"}
    />
            </>
  );
};