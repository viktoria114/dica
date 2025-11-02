import { useState } from 'react';
<<<<<<< HEAD:DICA-APP/src/hooks/Gasto/useFormGasto.tsx
import type { Gasto } from '../../types';
import { crearGasto } from '../../api/gastos';
import { useSnackbar } from '../../contexts/SnackbarContext';
import type { FieldConfig } from '../../Components/common/FormBase';
=======
import type { Gasto } from '../types';
import { useSnackbar } from '../contexts/SnackbarContext';
import type { FieldConfig } from '../Components/common/FormBase';
>>>>>>> origin/main:DICA-APP/src/hooks/useFormGasto.tsx
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { useAppDispatch } from '../store/hooks';
import { crearGastos, getGastos } from '../store/slices/gastosSlice';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

const formatDateForBackend = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};

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
        { value: 'impuestos', label: "Impuestos"},
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
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <DatePicker
            label="Fecha"
            value={value ? new Date(value) : new Date()}
            onChange={(newValue) => handleChange('fecha', newValue)}
            format="dd/MM/yy"
          />
        </LocalizationProvider>
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
      const payload: any = {
        ...values,
        fecha: formatDateForBackend(new Date(values.fecha)),
      };

      if (values.categoria === 'insumos' && values.stockItems && values.stockItems.length > 0) {
        payload.fk_stock = values.stockItems[0].id_stock;
        payload.cantidad = values.stockItems[0].cantidad;
      }
      delete payload.stockItems; 

      await dispatch(crearGastos(payload));
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
