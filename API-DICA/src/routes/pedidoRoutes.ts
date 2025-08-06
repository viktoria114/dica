import { Router } from "express"
import {crearPedido} from "../controllers/pedidoController"
const router = Router()

router.post('/', crearPedido)
//router.put('/:id', actualizarPedido)
//router.get('/', getListaPedido)
//router.get('/invisibles', getListaCompletaPedido)
//router.delete('/:id', eliminarPedido)
//router.post('/restaurar/:id', restaurarPedido)

export default router;