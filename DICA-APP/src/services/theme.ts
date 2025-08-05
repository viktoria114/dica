import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: `'Jost', sans-serif`,
  },
  palette: {
    primary: {
      main: "#495E57", // para la box
    },
    secondary: {
      main: "#45474B", // para inputs
    },
    background: {
      default: "#F5F7F8", // para el fondo de página
    },
    text: {
      primary: "#000",
      secondary: "#F5F7F8",
    },
  },
});

export default theme;
