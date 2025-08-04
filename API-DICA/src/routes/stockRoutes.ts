import { Router } from "express";
import { verifyToken,checkRole } from "../middlewares/authHandler";
import { crearStock, getStockNoVisible, getStockVisible, validateLowStock } from "../controllers/stockControllers";
const router = Router();

router.post('/', crearStock);  //PostStock
router.get('/', getStockVisible) //GetStock
router.get('/invisibles', getStockNoVisible) //GetStock
router.get('/verificar', validateLowStock)

export default router;