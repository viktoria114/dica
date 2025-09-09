import { Router } from 'express';
import { verifyToken, checkRole } from '../middlewares/authHandler';
import {
  crearPedido,
  actualizarPedido,
  getListaPedidos,
  eliminarPedido,
  getListaCompletaPedidos,
  restaurarPedido,
  getListaPedidosPorTelefono,
  getPedidosEnConstruccion,
  getPedidosPorConfirmar,
  getPedidosCanceladosHoy,
  agregarItemPedido,
  agregarUnItemPedido,
  eliminarItemsPedido,
  eliminarUnItemPedido,
  vaciarItemsPedido,
  getItemPedido,
  actualizarEstadoPedido,
  retrocederEstadoPedido,
  pedidoPagado,
  agenteEstadoPedido,
} from '../controllers/pedidoController';
import { cancelarPedido, deshacerCancelarPedido } from '../controllers/cancelacionesController';
const router = Router();

router.post('/', verifyToken, crearPedido);
router.put('/:id', actualizarPedido);
router.get('/', getListaPedidos);
router.get('/invisibles', getListaCompletaPedidos);
router.delete('/:id', eliminarPedido);
router.put('/restaurar/:id', restaurarPedido);
router.get('/telefono_cliente/:telefono', getListaPedidosPorTelefono);
router.get('/en_construccion/:tel', getPedidosEnConstruccion)
router.get('/por_confirmar',getPedidosPorConfirmar)

router.get('/cancelados_hoy', getPedidosCanceladosHoy);

//Logica de negocio
router.post('/item/:id', agregarItemPedido);
router.post('/un_item/:id', agregarUnItemPedido);
router.delete('/un_item/:id', eliminarUnItemPedido)
router.delete('/item/:id', eliminarItemsPedido);
router.delete('/vaciar_item/:tel', vaciarItemsPedido);
router.get('/item/:id', getItemPedido);
router.put('/estado/:id', verifyToken, actualizarEstadoPedido);
router.put('/retroceder_estado/:id',verifyToken, retrocederEstadoPedido)
router.put('/cancelar/:id',verifyToken, cancelarPedido);
router.put('/deshacer_cancelar/:id',verifyToken, deshacerCancelarPedido);
router.put('/pagado/:id', pedidoPagado);
router.put('/agente_estado/:tel', agenteEstadoPedido)

export default router;
