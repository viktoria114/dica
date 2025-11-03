import { Box, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import RestoreIcon from "@mui/icons-material/Restore";
import SaveIcon from "@mui/icons-material/Save";
import CheckIcon from "@mui/icons-material/Check";

type Mode = "edicion" | "form" | "papelera";

type Props = {
  mode: Mode;

   onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onSave?: () => void;
  onCancel?: () => void;

   loadingDelete?: boolean;
  loadingRestore?: boolean;
  loadingSave?: boolean;
  
   labelSave?: string; 
  labelEdit?: string;
};

export const ActionButtons = ({
  mode,
  labelSave,
  onEdit,
  onDelete,
  onRestore,
  onSave,
  onCancel,
  loadingDelete,
  loadingRestore,
  loadingSave,
  labelEdit,

}: Props) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4, gap: 2 }}>
      {mode === "edicion" && (
        <>
          {onEdit && (
            <Button
              sx={{ height: 50 }}
              variant="contained"
              startIcon={labelEdit === "Confirmar" ? <CheckIcon /> : <EditIcon />}
              onClick={onEdit}
            >
              {labelEdit || "Editar"}
            </Button>
          )}
          <Button
            sx={{ height: 50 }}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onDelete}
            loading={loadingDelete}
          >
            Borrar
          </Button>
        </>
      )}

      {mode === "papelera" && (
        <Button
          sx={{ height: 50 }}
          variant="contained"
          color="success"
          startIcon={<RestoreIcon />}
          onClick={onRestore}
          loading={loadingRestore}
        >
          Restaurar
        </Button>
      )}

      {mode === "form" && (
        <Button
          sx={{ height: 50 }}
          variant="contained"
          color="success"
          startIcon={<SaveIcon />}
          onClick={onSave}
          disabled={loadingSave}
          loading={loadingSave}
        >
         {labelSave ?? "Crear"}
        </Button>
      )}

      {/* Cerrar/Cancelar común a todos */}
      <Button
        sx={{ height: 50 }}
        variant="outlined"
        startIcon={<CloseIcon />}
        onClick={onCancel}
      >
        {mode === "form" ? "Cancelar" : "Cerrar"}
      </Button>
    </Box>
  );
};
