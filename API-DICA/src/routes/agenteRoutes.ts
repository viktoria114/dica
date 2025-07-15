import {Router} from 'express';
import { gestionarMensajes, gestionarVerificacion } from '../controllers/agenteController';

const router = Router()

router.get('/', gestionarVerificacion)
router.post('/', gestionarMensajes)

export default router