import {Router} from 'express';
import { gestionarMensajes, gestionarVerificacion, toggleActivity, getAgentStatus} from '../controllers/agenteController';

const router = Router()

router.post('/toggle-activity', toggleActivity)
router.get('/status', getAgentStatus)
router.get('/', gestionarVerificacion)
router.post('/', gestionarMensajes)

export default router