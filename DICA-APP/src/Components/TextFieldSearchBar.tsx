import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import {
  Box,
  IconButton,
  TextField,
  ThemeProvider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import theme from "../services/theme";

interface TextFieldSearchBarProps<T> {
  list: T[];
  getLabel: (item: T) => string;
  onResults?: (results: T[]) => void;
  onAdd?: () => void; 
    onShowInvisibles?: () => void; 
    disableAdd?: boolean; // 🔹 Nuevo
  papeleraLabel?: string; // 🔹 Nuevo
}

function TextFieldSearchBarComponent<T>({
  list,
  getLabel,
  onResults,
  onAdd, 
   onShowInvisibles,
   disableAdd,
   papeleraLabel
}: TextFieldSearchBarProps<T>): React.ReactElement {
  const [input, setInput] = useState("");
  const [filtered, setFiltered] = useState<T[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
  if (input.trim() === "") {
    setFiltered([]);
    onResults?.([]); // sin búsqueda => que el padre muestre baseList
    return;
  }

  const coincidencias = list.filter((item) =>
    getLabel(item).toLowerCase().includes(input.toLowerCase())
  );
  setFiltered(coincidencias);
  onResults?.(coincidencias);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [input, list, getLabel]); // 👈 sacamos onResults para evitar re-disparos innecesarios

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (valor: string) => {
    setInput(valor);
    setShowSuggestions(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minWidth: 300,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          bgcolor: "secondary.main",
          p: 1.5,
          borderRadius: 2,
          m: 2.5,
          position: "relative",
        }}
      >
        <form
          style={{ display: "flex", alignItems: "center" }}
          onSubmit={handleSubmit}
        >
          <TextField
            placeholder="Buscar..."
            size="small"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            sx={{
              flex: 1,
              bgcolor: "background.paper",
              borderRadius: 1,
            }}
          />

          {/* Botón búsqueda */}
          <IconButton
            type="submit"
            sx={{
              ml: 2,
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "grey.200" },
            }}
          >
            <SearchIcon sx={{ color: "secondary.main" }} />
          </IconButton>

          {/* Botón + */}
<IconButton
  onClick={onAdd}
  disabled={disableAdd}
  sx={{
    ml: 2,
    bgcolor: "background.paper",
    "&.Mui-disabled": {
      bgcolor: "#969696ff", // Fondo gris
    },
    "&:hover": disableAdd ? {} : { bgcolor: "grey.200" }
  }}
>
<AddIcon
  sx={{
    color: disableAdd ? "#e6e6e6ff" : "secondary.main"
  }}
/>

          </IconButton>

          <Button
            sx={{
              ml: 2,
              gap: 1,
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "grey.200" },
            }}
             onClick={onShowInvisibles}

          >
            {papeleraLabel || "Papelera"} {/* 👈 Cambia según modo */}
          </Button>
        </form>

        {/* Lista de sugerencias */}
        {showSuggestions && input.trim() !== "" && (
          <Box
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              bgcolor: "background.paper",
              boxShadow: 2,
              borderRadius: 1,
              zIndex: 10,
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            {filtered.length > 0 ? (
              <List dense>
                {filtered.map((item, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton
                      onClick={() => handleSuggestionClick(getLabel(item))}
                    >
                      <ListItemText primary={getLabel(item)} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" sx={{ p: 1.5, color: "black" }}>
                No se encontraron resultados
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}

export const TextFieldSearchBar = TextFieldSearchBarComponent as <T>(
  props: TextFieldSearchBarProps<T>
) => React.ReactElement;
