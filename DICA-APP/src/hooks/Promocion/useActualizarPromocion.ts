import { useState } from "react";
import {
  actualizarPromocion,
  agregarItemPromocion,
  eliminarItemPromocion,
} from "../../api/promociones";
import { useSnackbar } from "../../contexts/SnackbarContext";
import type { Promocion } from "../../types";

export const useActualizarPromocion = (onSuccess?: () => void) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSnackbar } = useSnackbar();

  const actualizar = async (
    id: number,
    originalValues: Promocion,
    newValues: Promocion
  ) => {
    setIsUpdating(true);
    try {
      // 1. Update promotion details
      await actualizarPromocion(id, {
        nombre: newValues.nombre,
        tipo: newValues.tipo,
        precio: newValues.precio,
        visibilidad: newValues.visibilidad,
        items: newValues.items,
      });

      // 2. Update items
      const originalItemsMap = new Map(
        originalValues.items?.map((i) => [i.id, i.cantidad])
      );
      const newItemsMap = new Map(
        newValues.items?.map((i) => [i.id, i.cantidad])
      );

      // Process new/updated items
      for (const [itemId, newCantidad] of newItemsMap.entries()) {
        const originalCantidad = originalItemsMap.get(itemId) || 0;
        const diff = newCantidad - originalCantidad;

        if (diff > 0) {
          await agregarItemPromocion(id, {
            id_menu: itemId,
            cantidad: diff,
          });
        } else if (diff < 0) {
          await eliminarItemPromocion(id, {
            id_menu: itemId,
            cantidad: -diff,
          });
        }
        originalItemsMap.delete(itemId);
      }

      // Process removed items
      for (const [itemId, originalCantidad] of originalItemsMap.entries()) {
        await eliminarItemPromocion(id, {
          id_menu: itemId,
          cantidad: originalCantidad,
        });
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
