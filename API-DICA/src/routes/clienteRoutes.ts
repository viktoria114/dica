import { Router } from 'express';
import {verifyToken, checkRole } from '../middlewares/authHandler';
import { actualizarCliente, crearCliente, eliminarCliente, restaurarCliente, obtenerClientePorTelefono } from '../controllers/clienteController';
const router = Router();

//aqui se importan los Controllers para cada ruta

router.get('/:telefono',verifyToken, checkRole(['admin', 'cajero']), obtenerClientePorTelefono);
router.post('/',verifyToken, checkRole(['admin', 'cajero']), crearCliente);
router.put('/:tel',verifyToken, checkRole(['admin', 'cajero']), actualizarCliente)
router.put('/restaurar/:id',verifyToken, checkRole(['admin', 'cajero']), restaurarCliente) //restaurarCliente
router.delete('/:id',verifyToken, checkRole(['admin', 'cajero']), eliminarCliente)

export default router;