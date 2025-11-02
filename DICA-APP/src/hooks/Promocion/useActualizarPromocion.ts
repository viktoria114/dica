import { useState } from "react";
import { useSnackbar } from "../../contexts/SnackbarContext";
import type { Promocion } from "../../types";
import { useAppDispatch } from "../../store/hooks";
import {
  addItemPromocion,
  getPromociones,
  removeItemPromocion,
  updatePromocion,
} from "../../store/slices/promocionesSlice";

// 🔧 Versión corregida y tipada
export const useActualizarPromocion = (onSuccess?: () => void) => {
  const dispatch = useAppDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSnackbar } = useSnackbar();

  const actualizar = async (
    id: number,
    originalValues: Promocion,
    newValues: Promocion
  ) => {
    setIsUpdating(true);
    try {
      // ✅ 1. Actualizar los datos generales de la promoción
      await dispatch(
        updatePromocion({
          id,
          payload: {
            nombre: newValues.nombre,
            tipo: newValues.tipo,
            precio: newValues.precio,
            visibilidad: newValues.visibilidad,
            items: newValues.items,
          },
        })
      ).unwrap();

      await dispatch(getPromociones());

      // ✅ 2. Comparar ítems antiguos y nuevos
      const originalItemsMap = new Map(
        originalValues.items?.map((i) => [i.id, i.cantidad])
      );
      const newItemsMap = new Map(
        newValues.items?.map((i) => [i.id, i.cantidad])
      );

      // 🔁 Procesar ítems nuevos o modificados
      for (const [itemId, newCantidad] of newItemsMap.entries()) {
        const originalCantidad = originalItemsMap.get(itemId) || 0;
        const diff = newCantidad - originalCantidad;

        if (diff > 0) {
          // Agregar diferencia positiva
          await dispatch(
            addItemPromocion({ id, id_menu: itemId, cantidad: diff })
          ).unwrap();
          await dispatch(getPromociones());
        } else if (diff < 0) {
          // Quitar diferencia negativa
          await dispatch(
            removeItemPromocion({ id, id_menu: itemId, cantidad: -diff })
          ).unwrap();
          await dispatch(getPromociones());
        }

        // Eliminar del mapa para que solo queden los removidos
        originalItemsMap.delete(itemId);
      }

      // 🗑️ Procesar ítems eliminados
      for (const [itemId, originalCantidad] of originalItemsMap.entries()) {
        await dispatch(
          removeItemPromocion({ id, id_menu: itemId, cantidad: originalCantidad })
        ).unwrap();
        await dispatch(getPromociones());
      }

      showSnackbar("Promoción actualizada con éxito!", "success");
      onSuccess?.();
    } catch (error) {
      console.error(error);
      showSnackbar("Error al actualizar la promoción", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return { actualizar, isUpdating };
};
