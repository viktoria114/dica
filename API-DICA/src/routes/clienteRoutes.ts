import { Router } from 'express';
import {verifyToken, checkRole } from '../middlewares/authHandler';
import { actualizarCliente, crearCliente, eliminarCliente, restaurarCliente, obtenerClientePorTelefono, agregarPreferencia, modificarPreferencia, obtenerClientesInvisibles, obtenerClientes} from '../controllers/clienteController';
const router = Router();

//aqui se importan los Controllers para cada ruta

router.get('/tel/:tel', obtenerClientePorTelefono);
router.get('/invisibles/', obtenerClientesInvisibles);
router.get('/', obtenerClientes);
router.post('/',crearCliente);
router.put('/:tel',actualizarCliente)
router.put('/restaurar/:tel',restaurarCliente) //restaurarCliente
router.delete('/:tel',eliminarCliente)
router.post('/preferencias/:tel', agregarPreferencia)
router.put('/preferencias/:tel', modificarPreferencia)

export default router;