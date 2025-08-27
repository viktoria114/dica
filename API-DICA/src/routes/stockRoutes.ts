import { Router } from "express";
import { verifyToken,checkRole } from "../middlewares/authHandler";
import { checkVencimientoStock, eliminarstock, restaurarStock, CrearRegistroStock, crearStock, eliminarRegistroStock, GetRegistrosStock, getStockNoVisible, getStockVisible, validateLowStock, actualizarStock } from "../controllers/stockControllers";
const router = Router();

router.post('/', crearStock);  //PostStock
router.get('/', getStockVisible) //GetStock
router.get('/invisibles', getStockNoVisible) //GetStock
router.put('/:id',actualizarStock) //PutStock - Actualizar
router.put('/restaurar/:id', restaurarStock) //Restaurar Stock
router.get('/verificar', validateLowStock)
router.delete('/:id', eliminarstock) //DeleteStock
router.post('/vencidos', checkVencimientoStock)

router.post('/registro/:id', CrearRegistroStock) //post RegistroStock
router.get('/registro/:id', GetRegistrosStock)
router.delete('/registro/:id', eliminarRegistroStock)

export default router;