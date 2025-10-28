import type { FieldConfig } from "../Components/common/FormBase";
import type { ItemsMenu } from "../types";
import { useState } from "react";
import { crearMenu } from "../api/menu";
import { useSnackbar } from "../contexts/SnackbarContext";

const menuFields: FieldConfig<ItemsMenu>[] = [
  {
    name: "nombre",
    label: "Nombre",
    type: "text",
  },
  {
    name: "precio",
    label: "Precio",
    type: "number",
  },
  {
    name: "descripcion",
    label: "Descripción",
    type: "text",
  },
  {
    name: "categoria",
    label: "Categoría",
    type: "select",
    options: [
      { value: "sanguche", label: "Sánguche" },
      { value: "pizza", label: "Pizza" },
      { value: "bebida", label: "Bebida" },
    ],
  },  

];

export const useMenuForm = () => {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showSnackbar } = useSnackbar();
  const [formValues, setFormValues] = useState<ItemsMenu>({
    id: 0,
    nombre: "",
    precio: 0,
    descripcion: "",
    categoria: "sanguche",
    visibilidad: true,
    stocks: [],
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ItemsMenu, string>>
  >({});

  const validate = (values: ItemsMenu) => {
    const errors: Partial<Record<keyof ItemsMenu, string>> = {};
    if (!values.nombre?.trim()) errors.nombre = "El nombre es obligatorio";
    if (!values.descripcion?.trim())
      errors.descripcion = "La descripción es obligatoria";
    if (!values.precio || values.precio <= 0)
      errors.precio = "El precio debe ser mayor a 0";
    return errors;
  };

  const handleChange = (field: keyof ItemsMenu, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (values: ItemsMenu) => {
    const errors = validate(values);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    try {
      await crearMenu({
        nombre: values.nombre,
        precio: values.precio,
        descripcion: values.descripcion,
        categoria: values.categoria,
        stocks: values.stocks || [],
      });
      showSnackbar("Menú creado con éxito!", "success");
      setOpen(false);
    } catch (error) {
      console.error(error);
      showSnackbar("Error al crear el menú", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    open,
    menuFields,
    setOpen,
    isSaving,
    formValues,
    setFormValues,
    formErrors,
    handleChange,
    handleSubmit,
  };
};
