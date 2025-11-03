import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

// --- Definición de Props ---

interface ConfirmationModalProps {
  /** Boolean para controlar si el modal está abierto o cerrado */
  open: boolean;

  /** Título del modal (ej: "Confirmar Eliminación") */
  title: string;

  /** Mensaje de pregunta (ej: "¿Está seguro de que desea eliminar este ítem?") */
  message: React.ReactNode; // ReactNode permite pasar texto o componentes más complejos

  /** Texto del botón de cancelar (default: "No" o "Cancelar") */
  cancelText?: string;

  /** Texto del botón de confirmar (default: "Sí" o "Confirmar") */
  confirmText?: string;

  /**
   * Color del botón de confirmación.
   * Útil para acciones destructivas (ej: "error" para eliminar).
   */
  confirmButtonColor?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";

  /** Función que se ejecuta al hacer clic en "Cancelar" o cerrar el modal */
  onClose: () => void;

  /** Función que se ejecuta al hacer clic en "Confirmar" */
  onConfirm: () => void;
}

/**
 * Componente genérico para mostrar un diálogo de confirmación de "Sí/No".
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  cancelText = "Cancelar",
  confirmText = "Confirmar",
  confirmButtonColor = "primary", // Color por defecto
}) => {
  
  // Manejador para el botón de confirmación
  // Cierra el modal Y ejecuta la acción de confirmación
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      {/* 1. Título */}
      <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>

      {/* 2. Mensaje */}
      <DialogContent>
        <DialogContentText id="confirmation-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>

      {/* 3. Acciones (Botones) */}
      <DialogActions>
        {/* Botón de Cancelar (siempre llama a onClose) */}
        <Button onClick={onClose} color="inherit">
          {cancelText}
        </Button>

        {/* Botón de Confirmar (llama al handler) */}
        <Button
          onClick={handleConfirm}
          color={confirmButtonColor}
          autoFocus // Pone el foco en este botón
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};