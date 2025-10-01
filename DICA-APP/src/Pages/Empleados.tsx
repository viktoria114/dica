import { Box, Container, LinearProgress } from "@mui/material";
import { useCallback, useState } from "react";
import { useEmpleados } from "../hooks/useEmpleados";
import type { Empleado } from "../types";
import { SearchBar } from "../Components/common/SearchBar";
import { FichaEmpleado } from "../Components/Empleados/FichaEmpleado";
import { ModalBase } from "../Components/common/ModalBase";
import { Paginacion } from "../Components/common/Paginacion";
import { useFormEmpleado } from "../hooks/useFormEmpleado";

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

const initialValues = {
  nombre_completo: "",
  username: "",
  password: "",
  correo: "",
  telefono: "",
  rol: "cajero", // valor por defecto
  dni: "", // si es requerido por el tipo Empleado
};

export const Empleados = () => {
  const { empleados, loading, error, modoPapelera, toggleInvisibles } =
    useEmpleados();
  const rowsPerPageOptions: number[] = [9, 15, 21];

  const onSuccess = () => {
    // refetchEmpleados?.();
    setShowForm(false);
  };

  const handleClose = () => setShowForm(false);

  const {
    formErrors,
    editValues,
    handleChange,
    handleGuardar,
    isSaving,
    empleadoFields,
  } = useFormEmpleado(initialValues, onSuccess, "crear");

  // ✅ Estado para búsqueda
  const [empleadosMostrados, setEmpleadosMostrados] = useState<Empleado[]>([]);
  const getLabel = useCallback((e: Empleado) => e.nombre_completo, []);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);

  // ✅ Estado para modal de creación
  const [showForm, setShowForm] = useState(false);
  const handleAdd = useCallback(() => setShowForm(true), []);

  // ✅ si hay búsqueda, mostramos resultados; si no, usamos los del hook
  const listaParaRenderizar =
    empleadosMostrados.length > 0 ? empleadosMostrados : empleados;

  const paginatedEmpleados = listaParaRenderizar.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  return (
    <>
      {loading && <LinearProgress color="inherit" />}
      {error && <p>Error: {error}</p>}
      <Container>
        <SearchBar<Empleado>
          baseList={empleados}
          getLabel={getLabel}
          placeholder={"Buscar empleados por nombre..."}
          onResults={setEmpleadosMostrados}
          onAdd={handleAdd}
          onShowInvisibles={toggleInvisibles}
          disableAdd={modoPapelera}
          papeleraLabel={modoPapelera ? "Volver" : "Papelera"}
        />

        <Box sx={styleBox1}>
          {paginatedEmpleados.map((empleado) => (
            <FichaEmpleado
              key={empleado.dni}
              empleado={empleado}
              modoPapelera={modoPapelera}
            />
          ))}
        </Box>
        <Paginacion
          page={page}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          count={listaParaRenderizar.length}
          rowsPerPageOptions={rowsPerPageOptions}
        />
      </Container>

      <ModalBase
        open={showForm}
        handleClose={handleClose}
        modo="crear"
        entityName="Empleado"
         editValues={editValues} 
        empleadoFields={empleadoFields}   
        formErrors={formErrors}
        handleChange={handleChange}
       handleGuardar={handleGuardar}
        isSaving={isSaving}
      ></ModalBase>
    </>
  );
};
