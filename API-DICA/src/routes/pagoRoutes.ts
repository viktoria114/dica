import { Router } from "express";
import { verifyToken, checkRole } from "../middlewares/authHandler";
import { crearPago, actualizarPago, getPagos, getPagoPorId } from "../controllers/pagoController";

const router = Router();

router.post('/', crearPago); //PostPago
router.get('/', getPagos); //GetPagos
router.get('/:id', getPagoPorId); //GetPago Por ID
router.put('/:id', actualizarPago); //PutStock - Actualizar

export default router;