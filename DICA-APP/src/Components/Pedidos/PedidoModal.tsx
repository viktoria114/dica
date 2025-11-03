import { ModalBase } from "../common/ModalBase";
import { Button, Modal, Box, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { getPagoByPedidoId } from "../../api/pagos";
import type { Pago } from "../../types";
import { obtenerLinkTemporalDropbox } from "../../api/pagos";
import { useDropboxToken } from "../../contexts/DropboxTokenContext";
import { ItemSelector, type ItemSelectorColumn } from "../common/ItemSelector";
import type { Pedido, ItemsMenu, Promocion, ItemsYPromociones } from "../../types";
import type { usePedidoModal } from "../../hooks/Pedidos/usePedidoModal";
import type { useRestaurarPedido } from "../../hooks/Pedidos/useRestaurarPedido";
import { useBorrarPedido } from "../../hooks/Pedidos/useBorrarPedido";
import { getTicketPedido } from "../../api/pedidos";
import { descargarTicketPDF } from "../../services/pdfGenerator";

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
  const { token: dropboxToken } = useDropboxToken();
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [pago, setPago] = useState<Pago | null>(null);

  useEffect(() => {
    if (formValues.pedido_id) {
      getPagoByPedidoId(formValues.pedido_id)
        .then(setPago)
        .catch(() => setPago(null));
    }
  }, [formValues.pedido_id]);

  const handleViewReceipt = async (path: string) => {
    if (!dropboxToken) {
      alert("No se pudo obtener el token de Dropbox. Intente de nuevo más tarde.");
      return;
    }
    setLoadingImage(true);
    setImageModalOpen(true);
    try {
      const url = await obtenerLinkTemporalDropbox(path, dropboxToken);
      setImageUrl(url);
    } catch (error) {
      console.error("Error getting temporary link:", error);
      alert("Error al obtener el comprobante.");
      setImageModalOpen(false);
    } finally {
      setLoadingImage(false);
    }
  };

  const handleImprimirTicket = async () => {
    if (!formValues.pedido_id) return;
    try {
      const ticketBlob = await getTicketPedido(formValues.pedido_id);
      descargarTicketPDF(ticketBlob, formValues.pedido_id);
    } catch (error) {
      console.error("Error al imprimir el ticket:", error);
      alert("Error al imprimir el ticket. Intente de nuevo más tarde.");
    }
  };


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
    <>
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
      detailsChildren={
        formValues.estado !== "en construccion" && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            disabled={!pago?.comprobante_pago}
            onClick={() => handleViewReceipt(pago?.comprobante_pago!)}
            
          >
            Ver Comprobante
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleImprimirTicket}
            disabled={formValues.estado === "en construccion"}
          >
            Imprimir Ticket
          </Button>
          </Box>
        )
      }
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
      <Modal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        aria-labelledby="image-modal-title"
        aria-describedby="image-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          {loadingImage ? (
            <CircularProgress />
          ) : (
            <img
              src={imageUrl || ""}
              alt="Comprobante de pago"
              style={{ maxWidth: "100%", maxHeight: "90vh" }}
            />
          )}
        </Box>
      </Modal>
    </>
  );
};