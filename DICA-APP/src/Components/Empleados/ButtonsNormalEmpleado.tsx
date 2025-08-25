import { Box, Button } from "@mui/material";
import { useBorrarEmpleado } from "../../hooks/useBorrarEmpleado";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
  setIsEditMode: () => void;
  handleClose: () => void;
  empleadoDni: string;
};

export const ButtonsNormalEmpleado = ({setIsEditMode, handleClose, empleadoDni}: Props) => {
      const { borrarEmpleado, isDeleting } = useBorrarEmpleado(() => {
       // refetchEmpleados?.();
        handleClose();
      });
    
    return ( 
       <>
               <Box sx={{ display: "flex", justifyContent: "center", mt: 4, gap: 2 }}>
          <Button
            sx={{ height: 50 }}
            variant="contained"
            onClick={setIsEditMode}
            startIcon={<EditIcon />}
          >
            Editar
          </Button>
          <Button
            sx={{ height: 50 }}
            variant="contained"
            color="error"
            onClick={() => borrarEmpleado(empleadoDni)}
            startIcon={<DeleteIcon />}
            loading={isDeleting}
          >
            Borrar
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
       </>
    );
}