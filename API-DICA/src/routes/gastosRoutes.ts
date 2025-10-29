import { Router } from 'express';
import {verifyToken, checkRole } from '../middlewares/authHandler';
import { crearGasto, eliminarGasto, listarGastos, modificarGasto } from '../controllers/gastoController';
const router = Router();

router.get('/', listarGastos)
router.post('/', crearGasto)
router.put('/:id', modificarGasto)
router.delete('/:id', eliminarGasto)

export default router