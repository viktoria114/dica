import { useEffect, useState } from "react";
import { Box, Container } from "@mui/material";
import { FichaEmpleado } from "./FichaEmpleado";
import type { Empleado } from "./FichaEmpleado";


const styleBox1 = {
  bgcolor: "#a7a7a7ff",
  boxShadow: 1,
  borderRadius: 2,
  p: 2,
  minWidth: 300,
  display: "grid",
  gridTemplateColumns: { sm: "repeat(3, 1fr)", xs: "repeat(1,1fr)" },
  gap: 2,
  justifyContent: "center",
  mb: 2
};

export const ListaEmpleados: React.FC = () => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

useEffect(() => {
  const token = localStorage.getItem("token");
  console.log("TOKEN ENVIADO:", token); // 👈 agregá este console.log

  fetch("http://localhost:3000/api/empleados", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 👈 asegurate de enviar así
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error en la autenticación");
      return res.json();
    })
    .then((data) => {
      console.log("Empleados recibidos:", data);
      setEmpleados(data);
    })
    .catch((err) => {
      console.error("ERROR FETCH:", err);
    });
}, []);


  return (
    <Container>
      <Box sx={styleBox1}>
        {empleados.map((empleado) => (
          <FichaEmpleado key={empleado.dni} empleado={empleado} />
        ))}
      </Box>
    </Container>
  );
};
