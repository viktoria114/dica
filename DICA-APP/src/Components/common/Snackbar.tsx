
import React from 'react';
import { Snackbar, Alert } from '@mui/material';

interface Props {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning';
  handleClose: () => void;
  autoHideDuration?: number | null; //milisegundos 
}

const CommonSnackbar: React.FC<Props> = ({ open, message, severity, handleClose, autoHideDuration = 4000 }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }} //lo agrego como prop?
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CommonSnackbar;
