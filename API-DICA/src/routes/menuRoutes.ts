import { Router } from "express"
import {crearMenu, actualizarMenu, getListaMenu, getListaCompletaMenu, eliminarMenu, restaurarMenu} from "../controllers/menuController"
const router = Router()

router.post('/', crearMenu)
router.put('/:id', actualizarMenu)
router.get('/', getListaMenu)
router.get('/invisibles', getListaCompletaMenu)
router.delete('/:id', eliminarMenu)
router.post('/restaurar/:id', restaurarMenu)

export default router;