import type { FieldConfig } from "../../Components/common/FormBase";
import { useState } from "react";
import { useSnackbar } from "../../contexts/SnackbarContext";
import type { Pedido } from "../../types";
// Asumo que tienes los endpoints actualizados para recibir fk_empleado
import { crearPedido, actualizarPedido } from "../../api/pedidos"; 
import { useAuth } from "../useAuth";

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
];

export const usePedidoForm = () => {
  const { usuario } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showSnackbar } = useSnackbar();

  const [formValues, setFormValues] = useState<Pedido>({
    pedido_id: null,
    id_fecha: new Date(),
    hora: "",
    fk_estado: 1,
    id_cliente: null,
    ubicacion: "",
    observaciones: "",
    visibilidad: true,
  } as Pedido & { hora: string });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof Pedido, string>>
  >({});

  // ⚠️ Importante: validate ya NO necesita manejar el error del usuario, 
  // solo debe validar los campos del formulario.
  const validate = (values: Pedido) => {
    const errors: Partial<Record<keyof Pedido, string>> = {};

    // ❌ ELIMINADA: La comprobación del usuario no debe estar en 'validate'
    //if (!usuario?.dni) { 
    //  setIsSaving(false);
    //  throw new Error("Usuario no autenticado. No se puede guardar.");
    //}

    if (values.id_cliente === null || isNaN(values.id_cliente))
      errors.id_cliente = "Debe asignarse un cliente válido";
    if (!values.ubicacion?.trim())
      errors.ubicacion = "La ubicación es obligatoria";
    if (values.ubicacion && values.ubicacion.length > 200)
      errors.ubicacion = "La ubicación no puede superar 200 caracteres";
    if (values.observaciones && values.observaciones.length > 500)
      errors.observaciones = "La observación no puede superar 500 caracteres";

    // Validar formato de hora HH:MM
    const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!horaRegex.test(values.hora ?? ""))
      errors.hora = "La hora debe tener formato HH:MM";

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

    // 🎯 CORRECCIÓN CLAVE 1: Comprobación del usuario antes de setIsSaving(true)
    if (!usuario || !usuario.dni) {
      showSnackbar("Error de autenticación. Inicie sesión nuevamente.", "error");
      return; // Sale de la función si no hay usuario/dni
    }

    setIsSaving(true);
    
    try {
      if (values.pedido_id === null) {
        // En crear pedido también debes enviar el DNI
        await crearPedido(values); 
        showSnackbar("Pedido creado con éxito!", "success");
      } else {
        await actualizarPedido(
          values.pedido_id,
          values,
          usuario.dni // <-- ¡Error 18047 solucionado!
        );
        showSnackbar("Pedido actualizado con éxito!", "success");
      }
      setOpen(false);
    } catch (error) {
      console.error(error);
      showSnackbar("Error al guardar el pedido", "error");
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