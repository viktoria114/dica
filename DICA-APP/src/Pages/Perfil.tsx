import { Box, Container, Typography } from "@mui/material";
import Tab from "@mui/material/Tab";
import React from "react";
import { TabPanel } from "@mui/lab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { usePerfil } from "../hooks/usePerfil";
import { useFormEmpleado } from "../hooks/useFormEmpleado";
import GenericForm from "../Components/common/FormBase";
import type { Empleado } from "../types";
import { useFormPassword } from "../hooks/useFormPassword";

interface PasswordValues {
  password: string;
  confirmPassword: string;
}

export const Perfil = () => {
  const { empleado, usuario, loading, error, setEmpleado } = usePerfil();
  const [value, setValue] = React.useState("1");

  // Solo crear hook si empleado existe
  const Empform = useFormEmpleado(
    empleado ?? ({} as Empleado),
    () => setEmpleado(Empform.editValues),
    "editar"
  );

  const passwordForm = useFormPassword(empleado, () =>
    console.log("Password cambiado")
  );

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const fields: { name: keyof Empleado; label: string }[] = [
    { name: "nombre_completo", label: "Nombre Completo" },
    { name: "username", label: "Usuario" },
    { name: "correo", label: "Correo" },
    { name: "telefono", label: "Teléfono" },
    { name: "dni", label: "DNI" },
    { name: "rol", label: "Rol" },
  ];

  if (loading) return <p>Cargando perfil...</p>;
  if (error) return <p>{error}</p>;
  if (!empleado) return <p>No se encontró información del empleado</p>;

  return (
    <Container>
      <Typography variant="h3" m={4}>
        Mi Perfil
      </Typography>
      <Box
        borderRadius={16}
        bgcolor={"white"}
        minHeight={360}
        minWidth={360}
        p={4}
      >
        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label="perfil tabs">
            <Tab label="Información Personal" value="1" sx={{color:"#808080ff"}}/>
            <Tab label="Cambiar Contraseña" value="2" sx={{color:"#808080ff"}}   />
          </TabList>

          <TabPanel value="1">
            
            {Empform && (
              <GenericForm<Empleado>
                entityName="Información Personal"
                modo="editar"
                fields={fields}
                values={Empform.editValues}
                formErrors={Empform.formErrors}
                onChange={Empform.handleChange}
                onSubmit={Empform.handleGuardar}
                isSaving={Empform.isSaving}
                disabledFields={usuario?.rol === "admin" ? [] : ["dni", "rol"]}
              />
            )}
  {usuario?.rol !== "admin" && (
              <Typography
                variant="body2"
                
                sx={{ mt: 2, textAlign: "center" }}
              >
              Para cambiar DNI o rol, consulta a un administrador
              </Typography>
            )}
          
          </TabPanel>

         <TabPanel value="2">
  <GenericForm<PasswordValues>
    entityName="Contraseña"
    modo="editar"
    fields={[
      { name: "password", label: "Nueva contraseña", type: "password" },
      { name: "confirmPassword", label: "Confirmar contraseña", type: "password" },
    ]}
    values={passwordForm.values}
    formErrors={passwordForm.formErrors}
    onChange={passwordForm.handleChange}
    onSubmit={passwordForm.handleGuardar} // ahora funciona sin wrapper <form>
    isSaving={passwordForm.isSaving}
  />
</TabPanel>
        </TabContext>
      </Box>
    </Container>
  );
};
