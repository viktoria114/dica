import { useState } from 'react';
import type { Pago } from '../types';
import { crearPago } from '../api/pagos';
import { useSnackbar } from '../contexts/SnackbarContext';
import type { FieldConfig } from '../Components/common/FormBase';
import { DatePicker } from '@mui/x-date-pickers';

export const usePagoForm = (onSuccess?: () => void) => {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showSnackbar } = useSnackbar();

  const pagoFields: FieldConfig<Pago>[] = [
    {
      name: 'monto',
      label: 'Monto',
      type: 'number',
    },
    {
      name: 'metodo_pago',
      label: 'Método de Pago',
      type: 'select',
      options: [
        { value: 'Efectivo', label: 'Efectivo' },
        { value: 'Tarjeta', label: 'Tarjeta' },
        { value: 'Transferencia', label: 'Transferencia' },
      ],
    },
    {
      name: 'validado',
      label: 'Validado',
      type: 'checkbox',
    },
    {
      name: 'fk_pedido',
      label: 'ID Pedido',
      type: 'number',
    },
    {
      name: 'fk_fecha',
      label: 'Fecha',
      render: (value, handleChange) => (
        <DatePicker
          label="Fecha"
          value={value ? new Date(value) : new Date()}
          onChange={(newValue) => handleChange('fk_fecha', newValue)}
        />
      ),
    },
    {
        name: 'hora',
        label: 'Hora',
        type: 'text',
    }
  ];

  const [formValues, setFormValues] = useState<Pago>({
    id: null,
    monto: 0,
    metodo_pago: 'Efectivo',
    comprobante_pago: '',
    validado: false,
    fk_pedido: null,
    fk_fecha: new Date(),
    hora: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Pago, string>>>({});

  const validate = (values: Pago) => {
    const errors: Partial<Record<keyof Pago, string>> = {};
    if (!values.monto || values.monto <= 0) errors.monto = 'El monto debe ser mayor a 0';
    return errors;
  };

  const handleChange = (field: keyof Pago, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (values: Pago) => {
    const errors = validate(values);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    try {
      await crearPago(values);
      showSnackbar('Pago creado con éxito!', 'success');
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error(error);
      showSnackbar('Error al crear el pago', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    open,
    pagoFields,
    setOpen,
    isSaving,
    formValues,
    setFormValues,
    formErrors,
    handleChange,
    handleSubmit,
  };
};
