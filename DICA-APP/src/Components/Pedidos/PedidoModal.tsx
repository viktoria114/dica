/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalBase } from "../common/ModalBase";
import { ItemSelector, type ItemSelectorColumn } from "../common/ItemSelector";
import type { Pedido, ItemsMenu, Promocion, ItemsYPromociones } from "../../types";
import type { usePedidoModal } from "../../hooks/Pedidos/usePedidoModal";
import type { useRestaurarPedido } from "../../hooks/Pedidos/useRestaurarPedido";
import { useBorrarPedido } from "../../hooks/Pedidos/useBorrarPedido";

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
    isSaving 
  } = form;
  
  const handleBorrarSuccess = () => {
        cerrarModal()
    };

  const { restaurarP, isRestoringPedido } = restaurarState;
  const { isDeleting,  handleDelete}= useBorrarPedido(handleBorrarSuccess);

  // Lógica de displayFields (la mantienes aquí)
  const displayFields = [
     { label: "Items", value: formValues.items ? formValues.items.map(i => `${i.nombre} x${i.cantidad}`).join(", ") : "-" },
     { label: "Promociones", value: formValues.promociones ? formValues.promociones.map(pr => `${pr.nombre} x${pr.cantidad}`).join(", ") : "-" },
        { label: "Total", value: formValues.precio_total ? formValues.precio_total : "0" },
        { label: "Teléfono del Cliente", value: formValues.id_cliente },
        { label: "Observaciones", value: formValues.observaciones },
        { label: "Ubicación", value: formValues.ubicacion },
        { label: "Fecha", value: formValues.id_fecha ? formValues.id_fecha.toISOString() : null },
        { label: "Hora", value: formValues.hora },
  ];

  return (
    <ModalBase<Pedido>
      modo={"editar"} // El modal es 'detalle' si está en modo papelera
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
 borrar={(id) => handleDelete(Number(id))}
    isDeleting={isDeleting}

      // Lógica de restauración
      restaurar={() => {if (formValues.pedido_id) { restaurarP(formValues.pedido_id)}}}
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
    item_id: menu.id,
    nombre: menu.nombre,
    precio: menu.precio,
    cantidad: 1, // Cantidad inicial
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
    promocion_id: promo.id,
    nombre: promo.nombre,
    precio: promo.precio, // o promo.precio_descuento, etc.
    cantidad: 1,
  })}
  columns={menuColumns} // Reutilizamos las columnas
  modalTitle="Seleccionar Promoción"
  searchPlaceholder="Buscar promoción..."
/>
        </>
      )}
    </ModalBase>
  );
};