import { useState } from "react";
import type { FieldConfig } from "../Components/common/FormBase";
import type { ItemsMenu } from "../types";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useAppDispatch } from "../store/hooks";
import { actualizarMenuThunk, crearMenuThunk, getMenus } from "../store/slices/menuSlice";

const menuFields: FieldConfig<ItemsMenu>[] = [
  { name: "nombre", label: "Nombre", type: "text" },
  { name: "precio", label: "Precio", type: "number" },
  { name: "descripcion", label: "Descripción", type: "text" },
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

export const useMenuForm = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
  const { showSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  // ✅ Validaciones
  const validate = (values: ItemsMenu) => {
    const errors: Partial<Record<keyof ItemsMenu, string>> = {};
    if (!values.nombre?.trim()) errors.nombre = "El nombre es obligatorio";
    if (!values.descripcion?.trim()) errors.descripcion = "La descripción es obligatoria";
    if (!values.precio || values.precio <= 0) errors.precio = "El precio debe ser mayor a 0";
    return errors;
  };

  const handleChange = (field: keyof ItemsMenu, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Guardar menú usando Redux
  const handleSubmit = async (values: ItemsMenu) => {
    const errors = validate(values);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);

    const apiPayload = {
      nombre: values.nombre,
      precio: values.precio,
      descripcion: values.descripcion,
      categoria: values.categoria,
      stocks: values.stocks || [],
    };

    const isEditing = values.id && values.id !== 0; 
    
    try {
        let action;
        let successMessage;

        if (isEditing) {
            // 💡 EDICIÓN: Usamos actualizarMenuThunk y le pasamos el objeto completo (incluyendo el ID)
            action = actualizarMenuThunk({ ...values, ...apiPayload });
            successMessage = "Menú actualizado con éxito!";
        } else {
            // 💡 CREACIÓN: Usamos crearMenuThunk
            action = crearMenuThunk(apiPayload);
            successMessage = "Menú creado con éxito!";
        }

        await dispatch(action).unwrap();

        // Refrescar lista global
        await dispatch(getMenus());

        showSnackbar(successMessage, "success");
        setOpen(false);
        onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Error desconocido al procesar el menú";
      showSnackbar(errorMessage, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    open,
    setOpen,
    isSaving,
    menuFields,
    formValues,
    setFormValues,
    formErrors,
    handleChange,
    handleSubmit,
  };
};
