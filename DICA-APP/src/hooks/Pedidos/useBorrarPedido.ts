import { useState } from 'react';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { borrarPedido } from '../../api/pedidos'; 

export const useBorrarPedido = (onDeleteSuccess: (id: number) => void) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const { showSnackbar } = useSnackbar();

    const handleDelete = async (pedidoId: number) => {
        if (!window.confirm(`¿Estás seguro de que quieres mover a papelera el Pedido #${pedidoId}?`)) {
            console.log("ola");
            
            return;
        }

        setIsDeleting(true);
        try {
            await borrarPedido(pedidoId);
            
            // Llama a la función de callback para actualizar la UI (quitarlo de la lista visible)
            onDeleteSuccess(pedidoId); 

            showSnackbar(`Pedido #${pedidoId} movido a la papelera con éxito.`, 'success');
        } catch (error) {
            console.error(error);
            showSnackbar("Error al borrar el pedido.", 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        isDeleting,
        handleDelete,
    };
};