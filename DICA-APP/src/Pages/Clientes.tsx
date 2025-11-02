import { Box, Container, LinearProgress } from "@mui/material";
import { useCallback, useState } from "react";
import { SearchBar } from "../Components/common/SearchBar";
import { FichaItem } from "../Components/common/FichaItem";
import { ModalBase } from "../Components/common/ModalBase";
import { Paginacion } from "../Components/common/Paginacion";
import { useClientes } from "../hooks/Clientes/useClientes";
import type { Cliente } from "../types";
import { useFormClientes } from "../hooks/Clientes/useFormClientes";
import { useBorrarCliente } from "../hooks/Clientes/useBorrarCliente";
import { useRestaurarCliente } from "../hooks/Clientes/useRestaurarCliente";
import dayjs from "dayjs";

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
  agent_session_id: null,
  ultima_compra: null,
};

export const Clientes = () => {
  const { clientes, loading, error, modoPapelera, toggleInvisibles } =
    useClientes();
  const rowsPerPageOptions: number[] = [9, 15, 21];

  const onSuccess = () => setShowForm(false);
  const handleClose = () => setShowForm(false);

  const {
    formErrors,
    editValues,
    handleChange,
    handleGuardar,
    isSaving,
    fields,
  } = useFormClientes(initialValues, onSuccess, "crear");

  const [clientesMostrados, setClientesMostrados] = useState<Cliente[]>([]);
  const getLabel = useCallback((e: Cliente) => e.nombre, []);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [showForm, setShowForm] = useState(false);
  const handleAdd = useCallback(() => setShowForm(true), []);

  const { borrarClienteHandler, isDeleting } = useBorrarCliente(handleClose);
  const { restaurar, isRestoring } = useRestaurarCliente(
    handleClose ?? (() => {})
  );

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
              borrar={borrarClienteHandler}
              restaurar={restaurar}
              isDeleting={isDeleting}
              isRestoring={isRestoring}
              displayFields={[
                { label: "Nombre", value: cliente.nombre },
                { label: "Teléfono", value: cliente.telefono },
                { label: "Dieta", value: cliente.dieta },
                {
                  label: "Preferencias",
                  value: cliente.preferencias?.join(", ") ?? "—",
                },
                {
                  label: "Última Compra",
                  value: cliente.ultima_compra
                    ? dayjs(cliente.ultima_compra).format("DD/MM/YYYY HH:mm")
                    : "—",
                },
              ]}
            >
             
            </FichaItem>
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

      {/* 🧭 Modal para crear cliente con calendario */}
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
      />
    </>
  );
};
