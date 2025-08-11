import { Router } from "express"
import {crearPedido, actualizarPedido, getListaPedidos} from "../controllers/pedidoController"
const router = Router()

router.post('/', crearPedido)
router.put('/:id', actualizarPedido)
router.get('/', getListaPedidos)
//router.get('/invisibles', getListaCompletaPedido)
//router.delete('/:id', eliminarPedido)
//router.post('/restaurar/:id', restaurarPedido)

export default router;