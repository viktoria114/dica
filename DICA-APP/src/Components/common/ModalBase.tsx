import { Modal, Box, ThemeProvider } from "@mui/material";
import type { ReactNode } from "react"; // Importación solo de tipo
import theme from "../../services/theme";

interface ModalBaseProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { sm: 400, xs: "100%" },
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  border: "2px solid #495E57",
  p: 4,
  boxShadow: 1,
  borderRadius: 2,
};

export function ModalBase({ open, onClose, children }: ModalBaseProps) {
  return (
    <ThemeProvider theme={theme}>
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>{children}</Box>
    </Modal>
    </ThemeProvider>
  );
}
