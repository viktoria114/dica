import { Router } from 'express';
import {verifyToken, checkRole } from '../middlewares/authHandler';
import { actualizarCliente, crearCliente, eliminarCliente, restaurarCliente, obtenerClientePorTelefono, agregarPreferencia} from '../controllers/clienteController';
const router = Router();

//aqui se importan los Controllers para cada ruta

router.get('/:tel', obtenerClientePorTelefono);
router.post('/',crearCliente);
router.put('/:tel',actualizarCliente)
router.put('/restaurar/:tel',restaurarCliente) //restaurarCliente
router.delete('/:tel',eliminarCliente)
router.post('/preferencias/:tel', agregarPreferencia)

export default router;