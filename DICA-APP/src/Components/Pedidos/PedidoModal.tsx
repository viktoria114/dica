/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalBase } from "../common/ModalBase";
import { Button, Modal, Box, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { getPagoByPedidoId } from "../../api/pagos";
import type { Pago } from "../../types";
import { obtenerLinkTemporalDropbox } from "../../api/pagos";
import { useDropboxToken } from "../../contexts/DropboxTokenContext";
import { ItemSelector, type ItemSelectorColumn } from "../common/ItemSelector";
import type {
  Pedido,
  ItemsMenu,
  Promocion,
  ItemsYPromociones,
} from "../../types";
import type { usePedidoModal } from "../../hooks/Pedidos/usePedidoModal";
import type { useRestaurarPedido } from "../../hooks/Pedidos/useRestaurarPedido";
import { useBorrarPedido } from "../../hooks/Pedidos/useBorrarPedido";
import { getTicketPedido } from "../../api/pedidos";
import { descargarTicketPDF } from "../../services/pdfGenerator";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { useConfirmarPedido } from "../../hooks/Pedidos/useConfirmarPedido";

type PedidoModalProps = {
  modalState: ReturnType<typeof usePedidoModal>;
  restaurarState: ReturnType<typeof useRestaurarPedido>;
  allAvailableMenus: ItemsMenu[];
  allAvailablePromos: Promocion[];
  menuColumns: ItemSelectorColumn<ItemsYPromociones & { id: number }>[];
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
    mode,
    selectedMenus,
    setSelectedMenus,
    selectedPromos,
    setSelectedPromos,
    cerrarModal,
    handleSubmitModal,
  } = modalState;

  const { formValues, formErrors, pedidoFields, handleChange, isSaving } = form;

  const handleBorrarSuccess = () => {
    cerrarModal();
  };

  const { restaurarP, isRestoringPedido } = restaurarState;
  const { isDeleting,  handleDelete}= useBorrarPedido(handleBorrarSuccess);
  // --- ESTADOS PARA LA CONFIRMACIÓN ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "borrar" | "restaurar" | null
  >(null);
  const pedidoId = formValues.pedido_id;


  const { token: dropboxToken } = useDropboxToken();
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [pago, setPago] = useState<Pago | null>(null);


  const handleBorrarRequest = () => {
    if (pedidoId) {
      setConfirmAction("borrar");
      setConfirmOpen(true);
    }
  };

  const handleRestaurarRequest = () => {
    if (pedidoId) {
      setConfirmAction("restaurar");
      setConfirmOpen(true);
    }
  };

  const handleConfirmAction = () => {
    if (!pedidoId) return;

    if (confirmAction === "borrar") {
      handleDelete(Number(pedidoId)); // Llama a la lógica de borrado del hook
    } else if (confirmAction === "restaurar") {
      restaurarP(pedidoId); // Llama a la lógica de restauración del hook
    }

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

  const pedidoRequiereConfirmacion = formValues.fk_estado === 7;

  const handleEditOrConfirm = () => {
    if (pedidoRequiereConfirmacion) {
      confirmar(formValues as Pedido);
    } else {
      // Al pasar 'undefined' o no pasar el prop, ModalBase usa el default (setIsEditMode(true))
      return undefined;
    }
  };

  const handleSaveOrConfirm = (values: Pedido) => {
    if (pedidoRequiereConfirmacion) {
      confirmar(values);
    } else {
      handleSubmitModal();
    }
  };


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
    {
      label: "Items",
      value: formValues.items
        ? formValues.items.map((i) => `${i.nombre} x${i.cantidad}`).join(", ")
        : "-",
    },
    {
      label: "Promociones",
      value: formValues.promociones
        ? formValues.promociones
            .map((pr) => `${pr.nombre} x${pr.cantidad}`)
            .join(", ")
        : "-",
    },
    {
      label: "Total",
      value: formValues.precio_total ? formValues.precio_total : "0",
    },
    { label: "Teléfono del Cliente", value: formValues.id_cliente },
    { label: "Observaciones", value: formValues.observaciones },
    { label: "Ubicación", value: formValues.ubicacion },
    {
      label: "Fecha",
      value: formValues.fecha
        ? new Date(formValues.fecha).toLocaleDateString("es-AR", {
            timeZone: "UTC",
          })
        : "-",
    },
    { label: "Hora", value: formValues.hora },
  ];

  return (
    <>
    <ModalBase<Pedido>
        modo={mode}
        modoPapelera={modoPapelera}
        entityName={`Pedido #${formValues.pedido_id}`}
        open={open}
        onClose={cerrarModal}
        handleClose={cerrarModal}
        values={formValues}
        formErrors={formErrors}
        fields={pedidoFields}
        handleChange={handleChange}
        handleGuardar={handleSaveOrConfirm} //handleGuardar={handleSubmitModal} // Se usa el wrapper
        handleEditar={
          pedidoRequiereConfirmacion ? handleEditOrConfirm : undefined
        }
        labelEdit={pedidoRequiereConfirmacion ? "Confirmar" : "Editar"}
        labelsave={pedidoRequiereConfirmacion ? "Confirmar" : "Guardar"}
        isSaving={isSavingOrConfirming}
        
        idField="pedido_id"
        displayFields={displayFields}
        borrar={handleBorrarRequest}
        isDeleting={isDeleting}
        // Lógica de restauración
        restaurar={handleRestaurarRequest}
        isRestoring={isRestoringPedido}
detailsChildren={
        formValues.fk_estado !== 6 && (
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
            disabled={formValues.fk_estado === 6}
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
            <ItemSelector<
              ItemsMenu & Record<string, any>,
              ItemsYPromociones & { id: number }
            >
              label="Menús del Pedido"
              availableItems={allAvailableMenus}
              selectedItems={
                selectedMenus as (ItemsYPromociones & { id: number })[]
              }
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

            <ItemSelector<
              Promocion & Record<string, any>,
              ItemsYPromociones & { id: number }
            >
              label="Promociones del Pedido"
              availableItems={allAvailablePromos}
              selectedItems={
                selectedPromos as (ItemsYPromociones & { id: number })[]
              }
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

<ConfirmationModal
        open={confirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmAction} // Usa el handler unificado
        // **Título y Mensaje Dinámico**
        title={
          confirmAction === "borrar"
            ? "Confirmar Eliminación"
            : "Confirmar Restauración"
        }
        message={
          confirmAction === "borrar"
            ? `¿Está seguro de que desea el pedido #${pedidoId}?`
            : `¿Está seguro de que desea restaurar el pedido #${pedidoId}?`
        }
        // **Color de Botón Dinámico**
        confirmText={
          confirmAction === "borrar" ? "Sí, Eliminar" : "Sí, Restaurar"
        }
        cancelText="Cancelar"
        confirmButtonColor={confirmAction === "borrar" ? "error" : "success"}
      />
      </>
  );
};
