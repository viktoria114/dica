import { Router } from "express";
import { verifyToken,checkRole } from "../middlewares/authHandler";
import { checkVencimientoStock, CrearRegistroStock, crearStock, eliminarRegistroStock, GetRegistrosStock, getStockNoVisible, getStockVisible, validateLowStock } from "../controllers/stockControllers";
const router = Router();

router.post('/', crearStock);  //PostStock
router.get('/', getStockVisible) //GetStock
router.get('/invisibles', getStockNoVisible) //GetStock
router.get('/verificar', validateLowStock)
router.post('/vencidos', checkVencimientoStock)

router.post('/registro/:id', CrearRegistroStock) //post RegistroStock
router.get('/registro/:id', GetRegistrosStock)
router.delete('/registro/:id', eliminarRegistroStock)

export default router;