import { Router } from 'express';
import { checkRole } from '../middlewares/authHandler';
import { actualizarCliente, crearCliente, eliminarCliente, restaurarCliente, obtenerClientePorTelefono } from '../controllers/clienteController';
const router = Router();

//aqui se importan los Controllers para cada ruta

router.get('/:telefono', obtenerClientePorTelefono);
router.post('/', crearCliente);
router.put('/:tel', actualizarCliente)
router.put('/restaurar/:id', restaurarCliente) //restaurarCliente
router.delete('/:id', eliminarCliente)

export default router;