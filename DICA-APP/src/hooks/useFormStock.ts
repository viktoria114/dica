// src/hooks/useFormStock.ts
import { useEffect, useState } from "react";
import type { Stock } from "../types";
import type { FieldConfig } from "../Components/common/FormBase";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useAppDispatch } from "../store/hooks";
import {
  crearStock,
  actualizarStock,
  getStock,
} from "../store/slices/stockSlice";

// 📋 Campos del formulario
const fields: FieldConfig<Stock>[] = [
  { name: "nombre", label: "Nombre del producto" },
  {
    name: "tipo",
    label: "Tipo",
    type: "select",
    options: [
      { value: "PERECEDERO", label: "Perecedero" },
      { value: "NO PERECEDERO", label: "No perecedero" },
    ],
  },
  {
    name: "stock_actual",
    label: "Stock actual",
    type: "number",
    disabled: true,
  } as FieldConfig<Stock>,
  {
    name: "vencimiento",
    label: "Días para vencimiento",
    type: "number",
  },
  {
    name: "stock_minimo",
    label: "Stock mínimo",
    type: "number",
  },
  {
    name: "medida",
    label: "Unidad de medida",
    type: "select",
    options: [
      { value: "KG", label: "Kilogramos (KG)" },
      { value: "G", label: "Gramos (G)" },
      { value: "L", label: "Litros (L)" },
      { value: "ML", label: "Mililitros (ML)" },
      { value: "U", label: "Unidades (U)" },
    ],
  },
];

export const useFormStock = (
  initialValues: Stock | null,
  onSuccess: () => void,
  mode: "crear" | "editar" = "editar"
) => {
  const dispatch = useAppDispatch();
  const [editValues, setEditValues] = useState<Stock>(
    initialValues ?? ({} as Stock)
  );
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof Stock, string>>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const { showSnackbar } = useSnackbar();

  // 🧩 Cargar valores iniciales
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setEditValues(initialValues);
    }
  }, [initialValues]);

  // ✏️ Manejar cambios
  const handleChange = (field: keyof Stock, value: string | number) => {
    setEditValues((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "tipo" && value === "NO PERECEDERO") {
        updated.vencimiento = 0;
      }
      return updated;
    });
  };

  // 💾 Guardar (crear o actualizar)
  const handleGuardar = async (values: Stock) => {
    setIsSaving(true);

    const errores: Partial<Record<keyof Stock, string>> = {};

    // 🔎 Validaciones básicas
    if (!values.nombre?.trim()) errores.nombre = "El nombre es obligatorio";
    if (!values.tipo?.trim()) errores.tipo = "El tipo es obligatorio";
    if (!values.medida?.trim()) errores.medida = "La unidad de medida es obligatoria";

    const stockActual = Number(values.stock_actual ?? 0);
    const stockMinimo = Number(values.stock_minimo ?? 0);
    const vencimiento = Number(values.vencimiento ?? 0);

    if (stockActual < 0) errores.stock_actual = "El stock actual debe ser >= 0";
    if (stockMinimo < 0) errores.stock_minimo = "El stock mínimo debe ser >= 0";
    if (values.tipo === "PERECEDERO" && vencimiento < 0)
      errores.vencimiento = "Los días de vencimiento deben ser >= 0";

    setFormErrors(errores);
    if (Object.keys(errores).length > 0) {
      setIsSaving(false);
      return;
    }

    // 🧱 Crear payload limpio
    const payload: Stock = {
      ...values,
      stock_actual: stockActual,
      stock_minimo: stockMinimo,
      vencimiento: values.tipo === "NO PERECEDERO" ? 0 : vencimiento,
      visibilidad: true,
    };

    try {
      if (mode === "crear") {
        await dispatch(crearStock(payload)).unwrap();
        showSnackbar("Stock creado correctamente", "success");
      } else {
        await dispatch(actualizarStock(payload)).unwrap();
        showSnackbar("Stock actualizado correctamente", "success");
      }

      // 🔄 Refrescar lista
      dispatch(getStock());
      onSuccess();
    } catch (error) {
      if (error instanceof Error) showSnackbar(error.message, "error");
      else showSnackbar("Error desconocido", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // 🧮 Filtrar campos según tipo
  const filteredFields = fields.filter((field) => {
    if (field.name === "vencimiento" && editValues.tipo === "NO PERECEDERO") {
      return false;
    }
    return true;
  });

  return {
    editValues,
    handleChange,
    handleGuardar,
    formErrors,
    isSaving,
    setEditValues,
    fields: filteredFields,
  };
};
