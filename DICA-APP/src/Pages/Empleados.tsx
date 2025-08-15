import { ThemeProvider } from "@emotion/react";
import { ListaEmpleados } from "../Components/Empleados/ListaEmpleados";
import theme from "../services/theme";

export const Empleados = () => {
  return (
    <ThemeProvider theme={theme}>
      <div
      /*style={{
    backgroundImage: 'url("Frame 1.png")',
    backgroundRepeat: 'repeat', 
    width: '100%',
    height: '300px',
  }}
    */
      >
        <ListaEmpleados></ListaEmpleados>
       
      </div>
    </ThemeProvider>
  );
};
