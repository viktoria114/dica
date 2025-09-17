import { Router } from 'express';
import { verifyToken, checkRole } from '../middlewares/authHandler';
import {
  crearPromocion,
  getListaPromocionesI,
  getListaPromocionesV,
  actualizarPromocion,
  eliminarPromocion,
  restaurarPromocion,
  agregarItemPromocion,
  eliminarItemPromocion,
  getPromocionesDePedido,
  agregarPromocionPedido,
  eliminarPromocionPedido,
} from '../controllers/promocionesController';

const router = Router();

router.post('/', crearPromocion);
router.put('/:id', actualizarPromocion);
router.get('/', getListaPromocionesV);
router.get('/invisibles', getListaPromocionesI);
router.delete('/:id', eliminarPromocion);
router.put('/restaurar/:id', restaurarPromocion);

router.post('/item/:id', agregarItemPromocion);
router.delete('/item/:id', eliminarItemPromocion);

router.get('/pedido/:id', getPromocionesDePedido)
router.post('/pedido/:id', agregarPromocionPedido);
router.delete('/pedido/:id', eliminarPromocionPedido);

export default router;
