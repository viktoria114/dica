import React, { useState } from "react";
import type { ItemsMenu } from "../../types";
import GenericForm, { type FieldConfig } from "../common/FormBase";
import { StockSelector } from "./StockSelector";

interface MenuFormProps {
  modo: "crear" | "editar";
  values: ItemsMenu;
  formErrors: Partial<Record<keyof ItemsMenu, string>>;
  onChange: (field: keyof ItemsMenu, value: unknown) => void;
  onSubmit: (values: ItemsMenu) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

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

export const MenuForm: React.FC<MenuFormProps> = ({
  modo,
  values,
  formErrors,
  onChange,
  onSubmit,
  onCancel,
  isSaving,
}) => {

     const [errors, setErrors] = useState<typeof formErrors>({});

  const validate = (vals: ItemsMenu) => {
    const newErrors: Partial<Record<keyof ItemsMenu, string>> = {};

    if (!vals.nombre?.trim()) {
      newErrors.nombre = "El nombre no puede estar vacío";
    }
    if (!vals.descripcion?.trim()) {
      newErrors.descripcion = "La descripción no puede estar vacía";
    }
    if (!vals.precio || vals.precio <= 0) {
      newErrors.precio = "El precio debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (vals: ItemsMenu) => {
    if (!validate(vals)) return;
    onSubmit(vals);
  };

  return (
    <>
    <GenericForm<ItemsMenu>
      entityName="Menú"
      modo={modo}
      fields={menuFields}
      values={values}
       formErrors={{ ...formErrors, ...errors }}
      onChange={(field, value) => {
        // 🔹 Normalizamos tipos para evitar que "precio" o "visibilidad" queden como string
        if (field === "precio") {
          onChange(field, Number(value));
        } else {
          onChange(field, value);
        }
      }}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSaving={isSaving}
      
>
    <StockSelector
        availableStocks={[
          { id_stock: 1, nombre: "Harina" },
          { id_stock: 2, nombre: "Queso" },
          { id_stock: 3, nombre: "Jamón" },
        ]}
         selectedStocks={values.stocks ?? []}
        onChange={(newStocks) => onChange("stocks", newStocks)}
      />
    </GenericForm>
</>
  );
};
