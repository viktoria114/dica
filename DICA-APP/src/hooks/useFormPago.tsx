import { useState } from 'react';
import type { Pago } from '../types';
import { useSnackbar } from '../contexts/SnackbarContext';
import type { FieldConfig } from '../Components/common/FormBase';
import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { useAppDispatch } from '../store/hooks';
import { crearPagos, getPagos } from '../store/slices/pagosSlice';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

const formatDateForBackend = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export const usePagoForm = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
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
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <DatePicker
            label="Fecha"
            value={value ? new Date(value) : new Date()}
            onChange={(newValue) => handleChange('fk_fecha', newValue)}
            format="dd/MM/yy"
          />
        </LocalizationProvider>
      ),
    },
    {
      name: 'hora',
      label: 'Hora',
      render: (value, handleChange) => {
        let dateValue = null;
        if (value instanceof Date) {
          dateValue = value;
        } else if (typeof value === 'string' && value) {
          const [hours, minutes] = value.split(':');
          dateValue = new Date();
          dateValue.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        }

        return (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <TimePicker
              label="Hora"
              value={dateValue}
              onChange={(newValue: Date | null) => {
                if (newValue) {
                  const hours = newValue.getHours().toString().padStart(2, '0');
                  const minutes = newValue.getMinutes().toString().padStart(2, '0');
                  handleChange('hora', `${hours}:${minutes}`);
                } else {
                  handleChange('hora', '');
                }
              }}
              ampm={false}
              views={['hours', 'minutes']}
              format="HH:mm"
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
        );
      },
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
      const formattedValues = {
        ...values,
        fk_fecha: formatDateForBackend(new Date(values.fk_fecha)),
      };
      await dispatch(crearPagos(formattedValues));
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
