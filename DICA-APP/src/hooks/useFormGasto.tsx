import { useState } from 'react';
import type { Gasto } from '../types';
import { useSnackbar } from '../contexts/SnackbarContext';
import type { FieldConfig } from '../Components/common/FormBase';
import { DatePicker } from '@mui/x-date-pickers';
import { useAppDispatch } from '../store/hooks';
import { crearGastos, getGastos } from '../store/slices/gastosSlice';

export const useGastoForm = (onSuccess?: () => void, stock: any[] = []) => {
    const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showSnackbar } = useSnackbar();

  const gastoFields: FieldConfig<Gasto>[] = [
    {
      name: 'monto',
      label: 'Monto',
      type: 'number',
    },
    {
      name: 'categoria',
      label: 'Categoría',
      type: 'select',
      options: [
        { value: 'insumos', label: 'Insumos' },
        { value: 'salarios', label: 'Salarios' },
        { value: 'alquiler', label: 'Alquiler' },
        { value: 'mantenimiento', label: 'Mantenimiento' },
        { value: 'equipamiento', label: 'Equipamiento' },
        { value: 'transporte', label: 'Transporte' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'otros', label: 'Otros' },
      ],
    },
    {
      name: 'metodo_de_pago',
      label: 'Método de Pago',
      type: 'select',
      options: [
        { value: 'Efectivo', label: 'Efectivo' },
        { value: 'Tarjeta', label: 'Tarjeta' },
        { value: 'Transferencia', label: 'Transferencia' },
      ],
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'text',
    },
    {
      name: 'fecha',
      label: 'Fecha',
      render: (value, handleChange) => (
        <DatePicker
          label="Fecha"
          value={value ? new Date(value) : new Date()}
          onChange={(newValue) => handleChange('fecha', newValue)}
        />
      ),
    },
  ];
  const [formValues, setFormValues] = useState<Gasto>({
    id: null,
    monto: 0,
    categoria: '',
    metodo_de_pago: 'Efectivo',
    descripcion: '',
    fecha: new Date(),
    fk_registro_stock: null,
    stockItems: [],
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Gasto, string>>>({});

  const validate = (values: Gasto) => {
    const errors: Partial<Record<keyof Gasto, string>> = {};
    if (!values.monto || values.monto <= 0) errors.monto = 'El monto debe ser mayor a 0';
    if (!values.categoria?.trim()) errors.categoria = 'La categoría es obligatoria';
    return errors;
  };

  const handleChange = (field: keyof Gasto, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (values: Gasto) => {
    const errors = validate(values);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    try {
      await dispatch(crearGastos({
        ...values,
        stockItems: values.stockItems.map(item => ({
          id_stock: item.id_stock,
          cantidad: item.cantidad,
        })),
      }));
      await dispatch(getGastos());
      showSnackbar('Gasto creado con éxito!', 'success');
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error(error);
      showSnackbar('Error al crear el gasto', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    open,
    gastoFields,
    setOpen,
    isSaving,
    formValues,
    setFormValues,
    formErrors,
    handleChange,
    handleSubmit,
  };
};
