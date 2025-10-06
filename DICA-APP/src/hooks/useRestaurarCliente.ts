import { useState } from "react";
import { fetchRestaurarCliente } from "../api/clientes";

export function useRestaurarCliente(onSuccess: () => void) {
  const [isRestoring, setIsRestoring] = useState(false);

  const restaurar = async (tel: string) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas restaurar este cliente?"
    );
    if (!confirmar) return;

    try {
      setIsRestoring(true);
      await fetchRestaurarCliente(tel);
      alert("Cliente restaurado correctamente");
      onSuccess();
    } catch (err) {
      if (err instanceof Error) alert(err.message);
      else alert("Error desconocido al restaurar cliente");
    } finally {
      setIsRestoring(false);
    }
  };

  return { restaurar, isRestoring };
}
