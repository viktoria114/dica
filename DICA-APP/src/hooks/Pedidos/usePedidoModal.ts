import { useState, useEffect } from "react";
import type { Pedido, ItemsYPromociones } from "../../types";
import { usePedidoForm } from "./usePedidoForm";

// Hook para manejar toda la lógica del modal de Pedido
export const usePedidoModal = (
  // Callback para actualizar la lista en `usePedidos`
  onFormSubmitSuccess: (pedido: Pedido) => void
) => {
  const [open, setOpen] = useState(false);

  // 1. Usamos tu hook de formulario
  const form = usePedidoForm();
  const {
    formValues,
    setFormValues,
    handleSubmit,
    // ...resto de props de usePedidoForm
  } = form;

  // 2. Estados para los ItemSelector (viven junto al formulario)
  const [selectedMenus, setSelectedMenus] = useState<ItemsYPromociones[]>([]);
  const [selectedPromos, setSelectedPromos] = useState<ItemsYPromociones[]>([]);

  // 3. Efecto para sincronizar los selectores cuando se carga un pedido
  useEffect(() => {
    // El tipo de `ItemsYPromociones` no tiene 'id', pero ItemSelector lo necesita.
    // Lo "adaptamos" al vuelo.
    const adaptToSelector = (
      items: ItemsYPromociones[],
      key: string
    ) => {
      return items.map((item) => ({
        ...item,
        // 1. Preserva el ID de fila único (ej: 101, 102) para la 'key' de React
        uniqueKey: item.id,
        // 2. Sobrescribe 'id' para que sea el ID de producto (ej: 5, 12)
        //    (Esto es necesario para que tu 'handleAdd' siga funcionando)
        id: item[key]!,
      }));
    };

    if (formValues?.items) {
      setSelectedMenus(adaptToSelector(formValues.items, "id_menu"));
    } else {
      setSelectedMenus([]);
    }

    if (formValues?.promociones) {
      setSelectedPromos(
        adaptToSelector(formValues.promociones, "id_promocion")
      );
    } else {
      setSelectedPromos([]);
    }
  }, [formValues]); // Se ejecuta cada vez que 'formValues' cambia

  // 4. Funciones para controlar el modal
  const abrirModalDetalle = (pedido: Pedido) => {
    setFormValues(pedido);
    setOpen(true);
  };

  const abrirModalNuevo = () => {
    setFormValues({} as Pedido); // Resetea el formulario
    setOpen(true);
  };

  const cerrarModal = () => {
    setFormValues({} as Pedido);
    setOpen(false);
  };

  // 5. Wrapper para el 'handleSubmit'
  const handleSubmitModal = async () => {
    // Antes de enviar, inyectamos los items/promos actualizados
    const pedidoCompleto = {
      ...formValues,
      items: selectedMenus,
      promociones: selectedPromos,
    };

    try {
      await handleSubmit(pedidoCompleto);
      onFormSubmitSuccess(pedidoCompleto);
    } catch (error) {
      console.error("Error en handleSubmitModal wrapper:", error);
    }
  };

  return {
    open,
    form, // Pasamos el hook 'form' completo
    selectedMenus,
    setSelectedMenus,
    selectedPromos,
    setSelectedPromos,
    abrirModalDetalle,
    abrirModalNuevo,
    cerrarModal,
    handleSubmitModal,
  };
};
