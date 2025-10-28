
import React, { createContext, useState, useContext} from 'react';
import type { ReactNode } from 'react';
import CommonSnackbar from '../Components/common/Snackbar';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning';
  autoHideDuration?: number | null;
}

interface SnackbarContextType {
  showSnackbar: (message: string, severity: 'success' | 'error' | 'warning', autoHideDuration?: number | null) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning', autoHideDuration?: number | null) => {
    setSnackbar({ open: true, message, severity, autoHideDuration });
  };

  const handleClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <CommonSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        handleClose={handleClose}
        autoHideDuration={snackbar.autoHideDuration}
      />
    </SnackbarContext.Provider>
  );
};
