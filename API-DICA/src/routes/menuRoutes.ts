import { Router } from "express"
import {crearMenu, actualizarMenu, getListaMenu, getListaCompletaMenu, eliminarMenu, restaurarMenu, getMenuImage} from "../controllers/menuController"
const router = Router()

router.post('/', crearMenu)
router.put('/:id', actualizarMenu)
router.get('/', getListaMenu)
router.get('/invisibles', getListaCompletaMenu)
router.delete('/:id', eliminarMenu)
router.post('/restaurar/:id', restaurarMenu)
router.get('/imagen', getMenuImage)

export default router;