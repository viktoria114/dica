import { Box, Container, LinearProgress } from "@mui/material";
import { FichaEmpleado } from "./FichaEmpleado";
import type { Empleado } from "../../types";
import { useGetEmpleados } from "../../hooks/useGetEmpleados";
import { TextFieldSearchBar } from "../TextFieldSearchBar";
import { useState, useCallback } from "react";
import { ModalBase } from "../common/ModalBase";
import EmpleadoForm from "./FormEmpleado";
import { fetchEmpleadosInvisibles } from "../../api/empleados";

const styleBox1 = {
  bgcolor: "primary.main",
  boxShadow: 1,
  borderRadius: 2,
  p: 2,
  minWidth: 300,
  display: "grid",
  gridTemplateColumns: { sm: "repeat(3, 1fr)", xs: "repeat(1, 1fr)" },
  gap: 2,
  justifyContent: "center",
  mb: 2,
};

export const ListaEmpleados = () => {
  const { empleados, loading, error /*, refetch: refetchEmpleados*/ } =
    useGetEmpleados();
  const [showForm, setShowForm] = useState(false);
  const [empleadosInvisibles, setEmpleadosInvisibles] = useState<Empleado[]>(
    []
  );

  // ✅ Resultados de búsqueda (sobre la lista base del modo actual)
  const [empleadosMostrados, setEmpleadosMostrados] = useState<Empleado[]>([]);
  const getLabel = useCallback((e: Empleado) => e.nombre_completo, []);
  const [modoPapelera, setModoPapelera] = useState(false);

  const handleShowInvisibles = useCallback(async () => {
    try {
      if (!modoPapelera) {
        const data = await fetchEmpleadosInvisibles();
        setEmpleadosInvisibles(data);
        setEmpleadosMostrados([]); // limpiar búsqueda al entrar
        setModoPapelera(true);
      } else {
        setModoPapelera(false);
        setEmpleadosMostrados([]); // limpiar búsqueda al volver
      }
    } catch (err) {
      console.error(err);
    }
  }, [modoPapelera]);

  const handleAdd = useCallback(() => {
    setShowForm(true);
  }, []);

  const baseList = modoPapelera ? empleadosInvisibles : empleados;

  // ✅ si hay búsqueda, mostramos resultados; si no, la base
  const listaParaRenderizar =
    empleadosMostrados.length > 0 ? empleadosMostrados : baseList;

  return (
    <>
      {loading && <LinearProgress color="inherit" />}
      {error && <p>Error: {error}</p>}
      <Container>
        <TextFieldSearchBar<Empleado>
          baseList={baseList}
          getLabel={getLabel}
          placeholder={"Buscar empleados por nombre..."}
          onResults={setEmpleadosMostrados}
          onAdd={handleAdd}
          onShowInvisibles={handleShowInvisibles}
          disableAdd={modoPapelera}
          papeleraLabel={modoPapelera ? "Volver" : "Papelera"}
        />

        <Box sx={styleBox1}>
          {listaParaRenderizar.map((empleado) => (
            <FichaEmpleado
              key={empleado.dni}
              empleado={empleado}
              modoPapelera={modoPapelera}
            />
          ))}
        </Box>
      </Container>

      <ModalBase open={showForm} onClose={() => setShowForm(false)}>
        <EmpleadoForm
          modo="crear"
          initialValues={{
            nombre_completo: "",
            username: "",
            password: "",
            correo: "",
            telefono: "",
            rol: "cajero", // valor por defecto
            dni: "", // si es requerido por el tipo Empleado
          }}
          onSuccess={() => {
            // refetchEmpleados?.();
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      </ModalBase>
    </>
  );
};
