import { ModalItem } from "../common/ModalItem";
import EmpleadoForm from "./FormEmpleado";
import { ButtonsNormalEmpleado } from "./ButtonsNormalEmpleado";
import { ButtonsPapeleraEmpleado } from "./ButtonsPapeleraEmpleado";
import type { Empleado } from "../../types";

export const ModalEmpleado = (props: {
  open: boolean;
  handleClose: () => void;
  item: Empleado;
  modoPapelera?: boolean;
}) => {
  return (
    <ModalItem
      {...props}
      title="Detalles del Empleado"
      campos={[
        { label: "Nombre Completo", value: (e) => e.nombre_completo },
        { label: "DNI", value: (e) => e.dni },
        { label: "Usuario", value: (e) => e.username },
        { label: "Correo", value: (e) => e.correo },
        { label: "Teléfono", value: (e) => e.telefono },
        { label: "Rol", value: (e) => e.rol },
      ]}
      FormComponent={EmpleadoForm}
      renderButtons={({ item, setIsEditMode, handleClose, modoPapelera }) =>
        !modoPapelera ? (
          <ButtonsNormalEmpleado
            setIsEditMode={() => setIsEditMode(true)}
            handleClose={handleClose}
            empleadoDni={item.dni}
          />
        ) : (
          <ButtonsPapeleraEmpleado
            handleClose={handleClose}
            empleadoDni={item.dni}
          />
        )
      }
    />
  );
};
