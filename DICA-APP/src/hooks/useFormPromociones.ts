import type { FieldConfig } from "../Components/common/FormBase";
import type { Promocion } from "../types";
import { useState } from "react";
import { crearPromocion } from "../api/promociones";
import { useSnackbar } from "../contexts/SnackbarContext";

const promocionFields: FieldConfig<Promocion>[] = [
  {
    name: "nombre",
    label: "Nombre",
    type: "text",
  },
  {
    name: "tipo",
    label: "Tipo",
    type: "select",
    options: [
      { value: "2x1", label: "2x1" },
      { value: "DESCUENTO", label: "Descuento" },
      { value: "MONTO_FIJO", label: "Monto Fijo" },
    ],
  },
  {
    name: "precio",
    label: "Precio",
    type: "number",
  },
];

export const usePromocionForm = () => {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showSnackbar } = useSnackbar();
  const [formValues, setFormValues] = useState<Promocion>({
    id: 0,
    nombre: "",
    tipo: "2x1",
    precio: 0,
    menus: [],
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof Promocion, string>>
  >({});

  const validate = (values: Promocion) => {
    const errors: Partial<Record<keyof Promocion, string>> = {};
    if (!values.nombre?.trim()) errors.nombre = "El nombre es obligatorio";
    if (values.tipo === 'DESCUENTO' && (!values.precio || values.precio <= 0 || values.precio > 100))
      errors.precio = "El descuento debe ser entre 1 y 100";
    if (values.tipo === 'MONTO_FIJO' && (!values.precio || values.precio <= 0))
      errors.precio = "El precio debe ser mayor a 0";
    if (values.menus.length === 0) {
        errors.menus = "Debe seleccionar al menos un menú";
    }
    return errors;
  };

  const handleChange = (field: keyof Promocion, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (values: Promocion) => {
    const errors = validate(values);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    try {
      await crearPromocion({
        nombre: values.nombre,
        tipo: values.tipo,
        precio: values.precio,
        menus: values.menus || [],
      });
      showSnackbar("Promoción creada con éxito!", "success");
      setOpen(false);
    } catch (error) {
      console.error(error);
      showSnackbar("Error al crear la promoción", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    open,
    promocionFields,
    setOpen,
    isSaving,
    formValues,
    setFormValues,
    formErrors,
    handleChange,
    handleSubmit,
  };
};
