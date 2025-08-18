import { useState } from "react";
import { TextField, Box, Button, MenuItem, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface SearchBarProps<T> {
  baseList: T[]; // lista completa
  getLabel: (item: T) => string; // función para mostrar texto en el input / sugerencias
  onResults: (results: T[]) => void; // devuelve los resultados filtrados al padre
  placeholder?: string; // placeholder del input
  // --- Opcionales ---
  onAdd?: () => void; // botón "+"
  onShowInvisibles?: () => void; // botón "papelera"
  disableAdd?: boolean; // 👈 ahora sí está definida
  papeleraLabel?: string;
  filterFn?: (item: T, input: string) => boolean; // filtro personalizado (si no se pasa, usa includes por defecto)
}

export function TextFieldSearchBar<T>({
  baseList,
  getLabel,
  onResults,
  placeholder = "Buscar...",
  onAdd,
  onShowInvisibles,
  papeleraLabel,
  disableAdd,
  filterFn,
}: SearchBarProps<T>) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<T[]>([]);

  const handleInputChange = (value: string) => {
    setInput(value);

    if (value.trim() === "") {
      setSuggestions([]);
      onResults(baseList); // <<-- siempre devuelve la lista base si está vacío
      return;
    }

    const filtered = baseList.filter((item) =>
      filterFn
        ? filterFn(item, value)
        : getLabel(item).toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(filtered);
    onResults(filtered);
  };

  return (
    <Box
      sx={{
        minWidth: 300,
        margin: "0 auto",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 1,
        bgcolor: "secondary.main",
        p: 1.5,
        borderRadius: 2,
        m: 2.5,
        position: "relative",
      }}
    >
      <Box sx={{ flex: 1, position: "relative" }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder={placeholder}
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          sx={{ width: "100%", bgcolor: "background.paper", borderRadius: 1 }}
        />
        {suggestions.length > 0 && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            bgcolor="background.paper"
            border="1px solid"
            borderColor="divider"
            borderRadius={1}
            boxShadow={2}
            zIndex={1}
          >
            {suggestions.map((item, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  setInput(getLabel(item));
                  setSuggestions([]);
                  onResults([item]);
                }}
              >
                {getLabel(item)}
              </MenuItem>
            ))}
          </Box>
        )}
      </Box>

      {/* Botón "+" (opcional) */}
      {onAdd && (
        <IconButton
          onClick={onAdd}
          disabled={disableAdd}
          sx={{
            ml: 2,
            bgcolor: "background.paper",
            "&.Mui-disabled": {
              bgcolor: "#969696ff", // Fondo gris
            },
            "&:hover": disableAdd ? {} : { bgcolor: "grey.200" },
          }}
        >
          {" "}
          <AddIcon
            sx={{ color: disableAdd ? "#e6e6e6ff" : "secondary.main" }}
          />{" "}
        </IconButton>
      )}

      {/* Botón papelera (opcional) */}
      {onShowInvisibles && (
        <Button
          sx={{
            ml: 2,
            gap: 1,
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "grey.200" },
          }}
          onClick={onShowInvisibles}
        >
          {papeleraLabel}
        </Button>
      )}
    </Box>
  );
}
