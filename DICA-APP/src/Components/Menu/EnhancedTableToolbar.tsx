import { alpha, Chip, IconButton, Stack, Toolbar, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

type Props = {
  numSelected: number;
  categoryFilter: string | null;
  onCategoryClick: (cat: string | null) => void;
  modoPapelera: boolean
}
export const EnhancedTableToolbar: React.FC<Props> = ({
  numSelected,
  categoryFilter,
  onCategoryClick,
  modoPapelera,
}) => {

    const categorias = ["Todos", "sanguche", "pizza", "bebida"];

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
    // 👉 Caso Papelera: solo texto + chips
    <>
      <Typography sx={{ flex: "1 1 100%" }} variant="h6" component="div">
        Los items borrados no pueden seleccionarse para un pedido
      </Typography>
      <Tooltip title="Filtrar por categoría">
        <Stack direction="row" spacing={1}>
    {categorias.map((cat) => (
      <Chip
        key={cat}
        label={cat}
        variant={
          categoryFilter === (cat === "Todos" ? null : cat)
            ? "filled"
            : "outlined"
        }
        onClick={() =>
          onCategoryClick(cat === "Todos" ? null : cat)
        }
      />
    ))}
  </Stack>
      </Tooltip>
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
        <Tooltip title="Filtrar por categoría">
            <Stack direction="row" spacing={1}>
    {categorias.map((cat) => (
      <Chip
        key={cat}
        label={cat}
        variant={
          categoryFilter === (cat === "Todos" ? null : cat)
            ? "filled"
            : "outlined"
        }
        onClick={() =>
          onCategoryClick(cat === "Todos" ? null : cat)
        }
      />
    ))}
  </Stack>
        </Tooltip>
      )}
    </>
  )}
</Toolbar>

    );
}