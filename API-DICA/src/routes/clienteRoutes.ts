import { Router } from 'express';
import { checkRole } from '../middlewares/authHandler';
import { actualizarCliente, crearCliente, eliminarCliente, obtenerClientePorTelefono } from '../controllers/clienteController';
const router = Router();

//aqui se importan los Controllers para cada ruta

router.get('/:telefono', obtenerClientePorTelefono);
router.post('/', crearCliente);
router.put('/:id', actualizarCliente)
router.delete('/:id', eliminarCliente)

export default router;