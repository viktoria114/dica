import { alpha, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

type Props = {
  numSelected: number;
  modoPapelera: boolean
}
export const EnhancedTableToolbar: React.FC<Props> = ({
  numSelected,
  modoPapelera,
}) => {

    return ( 
<Toolbar
  sx={[
    { pl: { sm: 2 }, pr: { xs: 1, sm: 1 } },
    numSelected > 0 && !modoPapelera && {
      bgcolor: (theme) =>
        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
    },
  ]}
>
  {modoPapelera ? (
    // 👉 Caso Papelera: solo texto
    <>
      <Typography sx={{ flex: "1 1 100%" }} variant="h6" component="div">
        Las promociones borradas no pueden seleccionarse para un pedido
      </Typography>
    </>
  ) : (
    // 👉 Caso Normal
    <>
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
        >
          {numSelected} seleccionados
        </Typography>
      ) : (
        <Typography sx={{ flex: "1 1 100%" }} variant="h6" component="div">
          Selecciona algunas promociones para crear un pedido!
        </Typography>
      )}

      {numSelected > 0 && (
        <Tooltip title="Crear Pedido">
          <IconButton>
            <AddIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  )}
</Toolbar>

    );
}