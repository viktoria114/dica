import { Box, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import RestoreIcon from "@mui/icons-material/Restore";
import SaveIcon from "@mui/icons-material/Save";

type Mode = "edicion" | "form" | "papelera";

type Props = {
  mode: Mode;
   labelSave?: string; 
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  loadingDelete?: boolean;
  loadingRestore?: boolean;
  loadingSave?: boolean;
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
}: Props) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4, gap: 2 }}>
      {mode === "edicion" && (
        <>
          {onEdit && (
            <Button
              sx={{ height: 50 }}
              variant="contained"
              startIcon={<EditIcon />}
              onClick={onEdit}
            >
              Editar
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
