import { alpha, Chip, IconButton, Stack, Toolbar, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

type Props = {
  numSelected: number;
  categoryFilter: string | null;
  onCategoryClick: (cat: string | null) => void;
}
export const EnhancedTableToolbar: React.FC<Props> = ({
  numSelected,
  categoryFilter,
  onCategoryClick,
}) => {
    return ( 
        <Toolbar
      sx={[
        { pl: { sm: 2 }, pr: { xs: 1, sm: 1 } },
        numSelected > 0 && {
          bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        },
      ]}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1">
          {numSelected} seleccionados
        </Typography>
      ) : (
        <Typography sx={{ flex: '1 1 100%' }} variant="h6" component="div">
          Selecciona algunos items para crear un pedido!
        </Typography>
      )}

        {numSelected > 0 ? (
        <Tooltip title="Crear Pedido">
          <IconButton>
            <AddIcon />
          </IconButton>
        </Tooltip>
      ) : (
        /* Si no hay seleccionados -> Chips para filtrar */
        <Tooltip title="Filtrar por categoría">
        <Stack direction="row" spacing={1}>
          <Chip
            label="Todos"
            variant={categoryFilter === null ? "filled" : "outlined"}
            onClick={() => onCategoryClick(null)}
          />
          <Chip
            label="Hamburguesa"
            variant={categoryFilter === "Hamburguesa" ? "filled" : "outlined"}
            onClick={() => onCategoryClick("Hamburguesa")}
          />
          <Chip
            label="Snack"
            variant={categoryFilter === "Snack" ? "filled" : "outlined"}
            onClick={() => onCategoryClick("Snack")}
          />
          <Chip
            label="Bebida"
            variant={categoryFilter === "Bebida" ? "filled" : "outlined"}
            onClick={() => onCategoryClick("Bebida")}
          />
        </Stack>
         </Tooltip>
      )}
    </Toolbar>
    );
}