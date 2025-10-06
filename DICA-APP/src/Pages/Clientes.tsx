import { Box, Container, LinearProgress } from "@mui/material";
import { useCallback, useState } from "react";
import { SearchBar } from "../Components/common/SearchBar";
import { FichaItem} from "../Components/common/FichaItem";
import { ModalBase } from "../Components/common/ModalBase";
import { Paginacion } from "../Components/common/Paginacion";
import { useClientes } from "../hooks/useClientes";
import type { Cliente } from "../types";
import { useFormClientes } from "../hooks/useFormClientes";
import { useBorrarCliente } from "../hooks/useBorrarCliente";
import { useRestaurarCliente } from "../hooks/useRestaurarCliente";

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
  nombre: "",
  telefono: null,
  dieta: null,
  preferencias: null,
  agentSessionID: null,
  ultimaCompra: new Date(),
};

export const Clientes = () => {
  const { clientes, loading, error, modoPapelera, toggleInvisibles } =
    useClientes();
  const rowsPerPageOptions: number[] = [9, 15, 21];

  const onSuccess = () => {
    // refetchClientes?.();
    setShowForm(false);
  };

  const handleClose = () => setShowForm(false);

  const {
    formErrors,
    editValues,
    handleChange,
    handleGuardar,
    isSaving,
    fields,
  } = useFormClientes(initialValues, onSuccess, "crear");

  // ✅ Estado para búsqueda
  const [clientesMostrados, setClientesMostrados] = useState<Cliente[]>([]);
  const getLabel = useCallback((e: Cliente) => e.nombre, []);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);

  // ✅ Estado para modal de creación
  const [showForm, setShowForm] = useState(false);
  const handleAdd = useCallback(() => setShowForm(true), []);

   const { borrarCliente, isDeleting } = useBorrarCliente(handleClose);
    const { restaurar, isRestoring } = useRestaurarCliente(handleClose ?? (() => {})
  );
  

  // ✅ si hay búsqueda, mostramos resultados; si no, usamos los del hook
  const listaParaRenderizar =
    clientesMostrados.length > 0 ? clientesMostrados : clientes;

  const paginatedClientes = listaParaRenderizar.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  return (
    <>
      {loading && <LinearProgress color="inherit" />}
      {error && <p>Error: {error}</p>}
      <Container>
        <SearchBar<Cliente>
          baseList={clientes}
          getLabel={getLabel}
          placeholder={"Buscar clientes por nombre..."}
          onResults={setClientesMostrados}
          onAdd={handleAdd}
          onShowInvisibles={toggleInvisibles}
          disableAdd={modoPapelera}
          papeleraLabel={modoPapelera ? "Volver" : "Papelera"}
        />

        <Box sx={styleBox1}>
           {paginatedClientes.map((cliente) => (
    <FichaItem<Cliente>
      key={cliente.telefono}
      entityName="Cliente"
      item={cliente}
      idField="telefono"
      modoPapelera={modoPapelera}
      getTitle={(e) => e.nombre}
      getSubtitle={(e) => (e.telefono ? `Tel: ${e.telefono}` : null)}
      useFormHook={useFormClientes}
      borrar={borrarCliente}
      restaurar={restaurar}
      isDeleting={isDeleting}
      isRestoring={isRestoring}
      displayFields={[
        { label: "Nombre", value: cliente.nombre},
 { label: "Teléfono", value: cliente.telefono },
        { label: "Dieta", value: cliente.dieta },
       { label: "Preferencias", value: cliente.preferencias?.join(", ") ?? "—" },
{ label: "Última Compra", value: cliente.ultimaCompra ? new Date(cliente.ultimaCompra).toLocaleDateString() : "—" },
      ]}
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
        entityName="Cliente"
        modo="crear"
        fields={fields}
        values={editValues}  
        formErrors={formErrors}
        handleChange={handleChange}
        handleGuardar={handleGuardar}
        handleClose={handleClose}
        isSaving={isSaving}
        idField="telefono"
        modoPapelera={modoPapelera}
        
      ></ModalBase>
    </>
  );
};

