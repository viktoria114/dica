import { useEffect, useState} from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { crearStock, actualizarStock, getStock } from "../../store/slices/stockSlice";
import { useSnackbar } from "../../contexts/SnackbarContext";
import type { Stock } from "../../types";
import type { FieldConfig } from "../../Components/common/FormBase";

const fields: FieldConfig<Stock>[] = [/* ...igual que antes... */];

export const useFormStock = (
  initialValues: Stock | null,
  onSuccess: () => void,
  mode: "crear" | "editar" = "editar"
) => {
  const dispatch = useAppDispatch();
  const { showSnackbar } = useSnackbar();

  const stockList = useAppSelector((state) => state.stock.stock);

  const [editValues, setEditValues] = useState<Stock>(
    initialValues ?? ({} as Stock)
  );
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof Stock, string>>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  // 🧩 Actualiza editValues si cambia el registro en el Redux
  useEffect(() => {
    if (initialValues?.id) {
      const actualizado = stockList.find((s) => s.id === initialValues.id);
      if (actualizado) {
        setEditValues(actualizado);
      }
    }
  }, [stockList, initialValues]);

  // 🧩 Cargar valores iniciales (solo al montar)
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setEditValues(initialValues);
    }
  }, [initialValues]);

  const handleChange = (field: keyof Stock, value: string | number) => {
    setEditValues((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "tipo" && value === "NO PERECEDERO") {
        updated.vencimiento = 0;
      }
      return updated;
    });
  };

  const handleGuardar = async (values: Stock) => {
    setIsSaving(true);

    const errores: Partial<Record<keyof Stock, string>> = {};
    if (!values.nombre?.trim()) errores.nombre = "El nombre es obligatorio";
    if (!values.tipo?.trim()) errores.tipo = "El tipo es obligatorio";
    if (!values.medida?.trim())
      errores.medida = "La unidad de medida es obligatoria";

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

      // 🔄 Refrescar la lista
      await dispatch(getStock());

      // ✅ Recargar valores actualizados del Redux
      if (payload.id) {
        const actualizado = stockList.find((s) => s.id === payload.id);
        if (actualizado) setEditValues(actualizado);
      }

      onSuccess();
    } catch (error: any) {
      const mensaje =
        typeof error === "string"
          ? error
          : error?.message || "Error desconocido";
      showSnackbar(mensaje, "error");
    } finally {
      setIsSaving(false);
    }
  };

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
