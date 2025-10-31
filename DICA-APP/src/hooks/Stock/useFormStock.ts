// src/hooks/useFormStock.ts
import { useEffect, useState } from "react";
import { fetchActualizarStock, fetchCrearStock } from "../../api/stock";
import type { Stock } from "../../types";
import type { FieldConfig } from "../../Components/common/FormBase";
import { useSnackbar } from "../../contexts/SnackbarContext";

// 📋 Campos en el orden solicitado
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
    disabled: true, //  Campo deshabilitado
  } as unknown as FieldConfig<Stock>,
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
  const [editValues, setEditValues] = useState<Stock>(
    initialValues ?? ({} as Stock)
  );
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof Stock, string>>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setEditValues((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(initialValues)) {
          return initialValues;
        }
        return prev;
      });
    }
  }, [initialValues]);

  const handleChange = (field: keyof Stock, value: string | number) => {
    setEditValues((prev) => {
      const newValues = { ...prev, [field]: value };

      // 🔄 Si cambia el tipo a NO PERECEDERO, resetear vencimiento a 0
      if (field === "tipo" && value === "NO PERECEDERO") {
        newValues.vencimiento = 0;
      }

      return newValues;
    });
  };

  const handleGuardar = async (values: Stock) => {
    setIsSaving(true);
    const nuevosErrores: Partial<Record<keyof Stock, string>> = {};

    // Validaciones
    if (!values.nombre?.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }

    // 🔢 Convertir a número si viene como string
    const stockActual =
      typeof values.stock_actual === "string"
        ? Number(values.stock_actual)
        : values.stock_actual;

    if (stockActual === undefined || stockActual < 0) {
      nuevosErrores.stock_actual = "El stock actual debe ser mayor o igual a 0";
    }

    // Solo validar vencimiento si es PERECEDERO
    if (values.tipo === "PERECEDERO") {
      const vencimiento =
        typeof values.vencimiento === "string"
          ? Number(values.vencimiento)
          : values.vencimiento;

      if (vencimiento === undefined || vencimiento < 0) {
        nuevosErrores.vencimiento =
          "Los días de vencimiento deben ser mayor o igual a 0";
      }
    }

    if (!values.tipo?.trim()) {
      nuevosErrores.tipo = "El tipo es obligatorio";
    }

    const stockMinimo =
      typeof values.stock_minimo === "string"
        ? Number(values.stock_minimo)
        : values.stock_minimo;

    if (stockMinimo === undefined || stockMinimo < 0) {
      nuevosErrores.stock_minimo = "El stock mínimo debe ser mayor o igual a 0";
    }

    if (!values.medida?.trim()) {
      nuevosErrores.medida = "La unidad de medida es obligatoria";
    }

    setFormErrors(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      setIsSaving(false);
      return;
    }

    try {
      const payload: Stock = {
        ...values,
        stock_actual: stockActual,
        stock_minimo: stockMinimo,
        vencimiento:
          values.tipo === "NO PERECEDERO"
            ? 0
            : typeof values.vencimiento === "string"
            ? Number(values.vencimiento)
            : values.vencimiento,
        visibilidad: true,
      };

      if (mode === "crear") {
        await fetchCrearStock(payload);
        showSnackbar("Stock creado correctamente", "success");
      } else {
        await fetchActualizarStock(payload);
        showSnackbar("Stock actualizado correctamente", "success");
      }

      onSuccess();
    } catch (error) {
      if (error instanceof Error) showSnackbar(error.message, "error");
      else showSnackbar("Error desconocido", "error");
    } finally {
      setIsSaving(false);
    }
  };

  //  Filtrar campos según el tipo
  const filteredFields = fields
    .map((field) => {
      if (field.name === "vencimiento" && editValues.tipo === "NO PERECEDERO") {
        // Si es NO PERECEDERO, deshabilitar el campo de vencimiento
        return {
          ...field,
          type: "number" as const,
          render: () => null, // No mostrar el campo
        };
      }
      return field;
    })
    .filter((field) => {
      // Ocultar completamente el campo vencimiento si es NO PERECEDERO
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
