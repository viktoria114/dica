import { Router } from "express";
import { verifyToken,checkRole } from "../middlewares/authHandler";
import {crearStock, setVencimientoStock,GetRegistrosStock, getStockNoVisible, getStockVisible, validateLowStock, actualizarStock, restaurarStock, eliminarstock } from "../controllers/stockControllers";
const router = Router();

router.post('/', crearStock);  //PostStock
router.get('/', getStockVisible) //GetStock
router.get('/invisibles', getStockNoVisible) //GetStock
router.put('/:id',actualizarStock) //PutStock - Actualizar
router.put('/restaurar/:id', restaurarStock) //Restaurar Stock
router.get('/verificar', validateLowStock)
router.delete('/:id', eliminarstock) //DeleteStock
router.post('/vencidos', setVencimientoStock)

router.get('/registro/:id', GetRegistrosStock)

export default router;