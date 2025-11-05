// src/hooks/Pedidos/useConfirmarPedido.ts
import { useState } from "react";
import type { Pedido } from "../../types";
import { actualizarPedido } from "../../api/pedidos";
import { useAuth } from "../useAuth";

type SuccessCallback = (updatedPedido: Pedido) => void;

/**
 * Hook para confirmar un pedido creado por el Bot (estado 7 -> estado 1).
 * Utiliza la función actualizarPedido de la API.
 */
export const useConfirmarPedido = (onSuccess: SuccessCallback) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const EMPLEADO = useAuth(); // ID de un empleado genérico (Debe ser el usuario logueado)
  const empleadoDni = EMPLEADO?.usuario?.dni;

  const confirmar = async (pedido: Pedido) => {
    setIsConfirming(true);
    setConfirmError(null);

    // 1. Crear el objeto de actualización con el nuevo estado: 7 (A Confirmar) -> 1 (Pendiente)
    const pedidoActualizado: Partial<Pedido> = {
      ...pedido, // Mantener todos los datos existentes
      fk_estado: 1, // Cambiar a estado 1 (Pendiente)
    };

    try {
      if (!pedido.pedido_id) {
        throw new Error("El pedido debe tener un ID para ser confirmado.");
      }
      if (!empleadoDni) {
        console.error("Empleado no autenticado o DNI no disponible.");
        setIsConfirming(false);
        setConfirmError("Debe iniciar sesión para confirmar pedidos.");
        return; // Salir de la función
      }

      // 2. Llamar a la función actualizarPedido
      const updatedPedido = await actualizarPedido(
        pedido.pedido_id,
        pedidoActualizado,
        empleadoDni
      );

      // 3. Ejecutar el callback de éxito
      onSuccess(updatedPedido);
      window.location.reload();
      return updatedPedido;
    } catch (error) {
      console.error("Error al confirmar el pedido:", error);
      setConfirmError("No se pudo confirmar el pedido.");
      // Se lanza el error para que el componente que llama lo maneje si es necesario
      throw error;
    } finally {
      setIsConfirming(false);
    }
  };

  return {
    confirmar,
    isConfirming,
    confirmError,
  };
};
