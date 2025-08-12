import { Router } from "express"
import {crearPedido, actualizarPedido, getListaPedidos,eliminarPedido, getListaCompletaPedidos, restaurarPedido} from "../controllers/pedidoController"
const router = Router()

router.post('/', crearPedido)
router.put('/:id', actualizarPedido)
router.get('/', getListaPedidos)
router.get('/invisibles', getListaCompletaPedidos)
router.delete('/:id', eliminarPedido)
router.put('/restaurar/:id', restaurarPedido)

export default router;