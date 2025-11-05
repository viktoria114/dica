import type { FieldConfig } from "../../Components/common/FormBase";
import { useState } from "react";
import { useSnackbar } from "../../contexts/SnackbarContext";
import type { Pedido } from "../../types";
// Asumo que tienes los endpoints actualizados para recibir fk_empleado
import { crearPedido, actualizarPedido } from "../../api/pedidos"; 
import { useAuth } from "../useAuth";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

export const pedidoFields: FieldConfig<Pedido>[] = [
  {
    name: "id_cliente",
    label: "Télefono del Cliente",
    type: "number",
  },
  {
    name: "hora",
    label: "Hora",
    type: "text",
  },
  { name: "fecha",
    label: "Fecha",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render: (value: string | null | undefined, handleChange: (field: keyof Pedido, value: any) => void, error) => (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Fecha"
          value={value ? dayjs(value) : null}
         onChange={(newValue) => { 
          const parsed = newValue ? dayjs(newValue) : null;
          handleChange(
            "fecha",
            parsed && parsed.isValid() ? parsed.toISOString() : null
          );
        }}
          // ... slotProps para manejar el error/estilo (como en tu ejemplo)
          slotProps={{
            textField: {
              color: "primary",
              focused: true,
              fullWidth: true,
              error: !!error,
              helperText: error,
            },
          }}
        />
      </LocalizationProvider>
    ),
  },
  {
    name: "fk_estado",
    label: "Estado",
    type: "select",
    options: [
      { value: "1", label: "Pendiente" },
      { value: "2", label: "En Preparación" },
      { value: "3", label: "Listo" },
      { value: "4", label: "Por Entregar" },
      { value: "5", label: "Entregado" },
      { value: "6", label: "En Construcción" },
      { value: "7", label: "A Confirmar" },
      { value: "8", label: "En Espera a Cancelar" },
      { value: "9", label: "Cancelado" },
    ],
  },
  {
    name: "ubicacion",
    label: "Ubicación",
    type: "text",
  },
  {
    name: "observaciones",
    label: "Observaciones",
    type: "text",
  },
  {
    name: "precio_total",
    label: "Precio Total",
    type: "number",
  }
];

export const usePedidoForm = () => {
  const { usuario } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showSnackbar } = useSnackbar();

  const [formValues, setFormValues] = useState<Pedido>({
    pedido_id: null,
    fecha: null,
    hora: "",
    fk_estado: 1,
    id_cliente: null,
    ubicacion: "",
    observaciones: "",
    visibilidad: true,
    precio_por_items: null,
    precio_por_promociones: null,
    precio_total: null,
  } as Pedido & { hora: string });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof Pedido, string>>
  >({});

  // ⚠️ Importante: validate ya NO necesita manejar el error del usuario, 
  // solo debe validar los campos del formulario.
  const validate = (values: Pedido) => {
    const errors: Partial<Record<keyof Pedido, string>> = {};

    if (values.id_cliente === null || isNaN(values.id_cliente))
      errors.id_cliente = "Debe asignarse un cliente válido";
    if (!values.ubicacion?.trim())
      errors.ubicacion = "La ubicación es obligatoria";
    if (values.ubicacion && values.ubicacion.length > 200)
      errors.ubicacion = "La ubicación no puede superar 200 caracteres";
    if (values.observaciones && values.observaciones.length > 500)
      errors.observaciones = "La observación no puede superar 500 caracteres";

    // Validar formato de hora HH:MM
const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;
if (!horaRegex.test(values.hora ?? ""))
  errors.hora = "La hora debe tener formato HH:MM o HH:MM:SS";
  ;

    return errors;
  };

  const handleChange = (field: keyof Pedido, value: unknown) => {
    if (field === "fk_estado") {
      setFormValues((prev) => ({ ...prev, [field]: Number(value) }));
    } else {
      setFormValues((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (values: Pedido) => {
    const errors = validate(values);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!usuario || !usuario.dni) {
      showSnackbar("Error de autenticación. Inicie sesión nuevamente.", "error");
      return; 
    }

    setIsSaving(true);
    
    try {
     if (!values.pedido_id) {
        // En crear pedido también debes enviar el DNI
        await crearPedido(values); 
        showSnackbar("Pedido creado con éxito!", "success");
        window.location.reload();

      } else {
        await actualizarPedido(
          values.pedido_id,
          values,
          usuario.dni 
        );
        showSnackbar("Pedido actualizado con éxito!", "success");
        window.location.reload();
      }
      setOpen(false);
    } catch (error) {
      console.error(error);
      showSnackbar("Error al guardar el pedido" , "error");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    open,
    setOpen,
    isSaving,
    formValues,
    setFormValues,
    formErrors,
    handleChange,
    handleSubmit,
    pedidoFields,
  };
};