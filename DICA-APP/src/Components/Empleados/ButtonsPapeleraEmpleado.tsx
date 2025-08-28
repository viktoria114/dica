import { Box, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RestoreIcon from "@mui/icons-material/Restore";
import { useRestaurarEmpleado } from "../../hooks/useRestaurarEmpleado";

type Props = {
      handleClose: () => void;
   empleadoDni: string;
}
export const ButtonsPapeleraEmpleado = ({handleClose, empleadoDni}: Props) => {
      const { restaurar, isRestoring } = useRestaurarEmpleado(() => {
    //refetchEmpleados?.();
    handleClose();
  });
    return ( 
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4, gap: 2 }}>
          <Button
            sx={{ height: 50 }}
            variant="contained"
            color="success"
            onClick={() => restaurar(empleadoDni)}
            startIcon={<RestoreIcon />}
            loading={isRestoring}
          >
            Restaurar
          </Button>
          <Button
            sx={{ height: 50 }}
            variant="outlined"
            onClick={handleClose}
            startIcon={<CloseIcon />}
          >
            Cerrar
          </Button>
        </Box>
    );
}