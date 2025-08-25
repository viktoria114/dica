import { Router } from 'express';
import { verifyToken, checkRole } from '../middlewares/authHandler';
import {
  crearPedido,
  actualizarPedido,
  getListaPedidos,
  eliminarPedido,
  getListaCompletaPedidos,
  restaurarPedido,
  agregarItemPedido,
  eliminarItemsPedido,
  getItemPedido,
  actualizarEstadoPedido,
  cancelarPedido,
} from '../controllers/pedidoController';
const router = Router();

router.post('/', verifyToken, crearPedido);
router.put('/:id', actualizarPedido);
router.get('/', getListaPedidos);
router.get('/invisibles', getListaCompletaPedidos);
router.delete('/:id', eliminarPedido);
router.put('/restaurar/:id', restaurarPedido);

//Logica de negocio
router.post('/item/:id', agregarItemPedido);
router.delete('/item/:id', eliminarItemsPedido);
router.get('/item/:id', getItemPedido);
router.put('/estado/:id', verifyToken, actualizarEstadoPedido);
router.put('/cancelar/:id',verifyToken, cancelarPedido);
//router.put('/estado/:id', retrocederEstadoPedido)
//router.put('/estado/:id', pedidoPagado)
//router.put('/estado/:id', pedidoRenbolsado)

export default router;
