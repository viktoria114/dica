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
      key: "item_id" | "promocion_id"
    ) => {
      return items.map((item) => ({
        ...item,
        id: item[key]!, // Asigna 'id' desde item_id o promocion_id
      }));
    };

    if (formValues?.items) {
      setSelectedMenus(adaptToSelector(formValues.items, "item_id"));
    } else {
      setSelectedMenus([]);
    }

    if (formValues?.promociones) {
      setSelectedPromos(
        adaptToSelector(formValues.promociones, "promocion_id")
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
