import { useFormEmpleado } from "../../hooks/useFormEmpleado";
import type { Empleado } from "../../types";
import type { FieldConfig } from "../common/FormBase";
import FormBase from "../common/FormBase";

const empleadoFields: FieldConfig<Empleado>[] = [
  { name: "nombre_completo", label: "Nombre Completo" },
  { name: "username", label: "Usuario" },
  { name: "correo", label: "Correo" },
  { name: "telefono", label: "Teléfono" },
  { name: "dni", label: "DNI", onlyInCreate: true },
  { name: "password", label: "Contraseña", type: "password", onlyInCreate: true },
  {
    name: "rol",
    label: "Rol",
    type: "select",
    options: [
      { value: "admin", label: "Admin" },
      { value: "cajero", label: "Cajero" },
      { value: "repartidor", label: "Repartidor" },
      { value: "cocinero", label: "Cocinero" },
    ],
  },
];

type EmpleadoFormProps = {
  modo: "crear" | "editar";
  initialValues: Empleado;
  onSuccess: () => void;
  onCancel?: () => void;
};

const EmpleadoForm: React.FC<EmpleadoFormProps> = ({
  modo,
  initialValues,
  onSuccess,
  onCancel,
}) => {

  const { formErrors, editValues, handleChange, handleGuardar, isSaving } =
    useFormEmpleado(initialValues, onSuccess, modo);

  return (
    <FormBase<Empleado>
      entityName="Empleado"
      modo={modo}
      fields={empleadoFields}
      formErrors={formErrors}
      values={editValues}
      onChange={handleChange}
      onSubmit={handleGuardar}
      onCancel={onCancel}
      isSaving={isSaving}
    />
  );
};

export default EmpleadoForm;
