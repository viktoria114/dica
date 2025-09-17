import { Router } from "express"
import {crearMenu, actualizarMenu, getMenuDetalles, getListaMenu, getListaInvisibleMenu, eliminarMenu, restaurarMenu, getMenuImage} from "../controllers/menuController"
const router = Router()

router.post('/', crearMenu)
router.put('/:id', actualizarMenu)
router.get('/:id', getMenuDetalles)
router.get('/', getListaMenu)
router.get('/invisibles', getListaInvisibleMenu)
router.delete('/:id', eliminarMenu)
router.post('/restaurar/:id', restaurarMenu)
router.get('/imagen', getMenuImage)

export default router;