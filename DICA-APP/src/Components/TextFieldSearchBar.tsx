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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from '@mui/icons-material/Add';
import theme from "../services/theme";

interface TextFieldSearchBarProps<T> {
  list: T[];
  getLabel: (item: T) => string;
  onResults?: (results: T[]) => void;
}

function TextFieldSearchBarComponent<T>({
  list,
  getLabel,
  onResults,
}: TextFieldSearchBarProps<T>): React.ReactElement {
  const [input, setInput] = useState("");
  const [filtered, setFiltered] = useState<T[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filtrado dinámico mientras se escribe
  useEffect(() => {
    if (input.trim() === "") {
      setFiltered([]);
      onResults?.([]);
      return;
    }

    const coincidencias = list.filter((item) =>
      getLabel(item).toLowerCase().includes(input.toLowerCase())
    );
    setFiltered(coincidencias);
    onResults?.(coincidencias);
  }, [input, list, getLabel, onResults]);

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
          bgcolor: "primary.main",
          p: 1.5,
          borderRadius: 2,
          m: 2.5,
          position: "relative", // para que la lista se posicione correctamente
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
          <IconButton  sx={{
              ml: 2,
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "grey.200" },
            }}><AddIcon sx={{ color: "primary.main" }}/></IconButton>
          
          <IconButton
            type="submit"
            sx={{
              ml: 2,
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "grey.200" },
            }}
          >
            <SearchIcon sx={{ color: "primary.main" }} />
          </IconButton>
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
