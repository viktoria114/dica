import {Router} from 'express';
import { gestionarMensajes, gestionarVerificacion, toggleActivity} from '../controllers/agenteController';

const router = Router()

router.post('/activity/toggle', toggleActivity)
router.get('/', gestionarVerificacion)
router.post('/', gestionarMensajes)

export default router