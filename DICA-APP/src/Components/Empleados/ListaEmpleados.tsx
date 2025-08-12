import { Box, Container } from "@mui/material";
import { FichaEmpleado } from "./FichaEmpleado";
import type { Empleado } from "../../types";
import { useGetEmpleados } from "../../hooks/useGetEmpleados";
import { TextFieldSearchBar } from "../TextFieldSearchBar";
import { useState } from "react";

const styleBox1 = {
  bgcolor: "secondary.main",
  boxShadow: 1,
  borderRadius: 2,
  p: 2,
  minWidth: 300,
  display: "grid",
  gridTemplateColumns: { sm: "repeat(3, 1fr)", xs: "repeat(1,1fr)" },
  gap: 2,
  justifyContent: "center",
  mb: 2,
};

export const ListaEmpleados = () => {
  const { empleados, loading, error } = useGetEmpleados();

  // Estado para manejar si hay búsqueda
  const [empleadosMostrados, setEmpleadosMostrados] = useState<Empleado[]>([]);

  // Determinar lista a mostrar (si no hay búsqueda, mostrar todos)
  const listaParaRenderizar =
    empleadosMostrados.length > 0 ? empleadosMostrados : empleados;

  return (
    <Container>
      {loading && <p>Cargando empleados...</p>}
      {error && <p>Error: {error}</p>}

      <TextFieldSearchBar
        list={empleados}
        getLabel={(empleado) => empleado.nombre_completo}
        onResults={(filtrados) => {
          // Si hay texto en el search, guardar resultados filtrados
          setEmpleadosMostrados(filtrados);
        }}
      />

      <Box sx={styleBox1}>
        {listaParaRenderizar.map((empleado: Empleado) => (
          <FichaEmpleado key={empleado.dni} empleado={empleado} />
        ))}
      </Box>
    </Container>
  );
};
