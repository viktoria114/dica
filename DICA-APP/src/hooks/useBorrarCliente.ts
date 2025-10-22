import { useState } from "react";
import { fetchBorrarCliente } from "../api/clientes";

export const useBorrarCliente = (onSuccess?: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const borrarCliente = async (tel: string) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas borrar este cliente?"
    );
    if (!confirmar) return;

    setIsDeleting(true);
    try {
      await fetchBorrarCliente(tel);
      alert("Cliente borrado correctamente");
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error) alert(error.message);
      else alert("Error desconocido al borrar cliente");
    } finally {
      setIsDeleting(false);
    }
  };

  return { borrarCliente, isDeleting };
};
