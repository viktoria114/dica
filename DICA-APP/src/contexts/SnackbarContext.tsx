import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";
import {
  useSnackbar as useNotistackSnackbar,
  type VariantType,
  closeSnackbar,
} from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import { Alert, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import theme from "../services/theme";

interface SnackbarContextType {
  showSnackbar: (
    message: string,
    severity: "success" | "error" | "warning",
    autoHideDuration?: number | null
  ) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};

interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({
  children,
}) => {
  const { enqueueSnackbar } = useNotistackSnackbar();

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning",
    autoHideDuration?: number | null
  ) => {
    const variant: VariantType = severity;

    enqueueSnackbar(message, {
      variant,
      autoHideDuration: autoHideDuration ?? 6000,
      preventDuplicate: true,
      content: (key, msg) => (
        <Alert
          severity={severity}
          variant="filled"
          sx={{
            borderRadius: 2,
            fontFamily: "Roboto, sans-serif",
            boxShadow: 3,
            minWidth: "280px",
            display: "flex",
            alignItems: "center",
          }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => closeSnackbar(key)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {msg}
        </Alert>
      ),
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <SnackbarContext.Provider value={{ showSnackbar }}>
        {children}
      </SnackbarContext.Provider>
    </ThemeProvider>
  );
};
