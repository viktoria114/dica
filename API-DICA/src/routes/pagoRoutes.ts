import { Router } from "express";
import { verifyToken, checkRole } from "../middlewares/authHandler";
import { crearPago, actualizarPago, getPagos, getPagoPorId, eliminarPagos, getPagoPorPedidoId } from "../controllers/pagoController";
import { sendDropBoxToken } from "../utils/image";

const router = Router();

router.post('/', crearPago); //PostPago
router.get('/', getPagos); //GetPagos
router.get('/token', sendDropBoxToken) //obtiene el token necesario para ver comprobantes desde el front
router.get('/:id', getPagoPorId); //GetPago Por ID
router.get('/pedido/:id', getPagoPorPedidoId); //GetPago Por ID de Pedido
router.delete('/:id', eliminarPagos); //DeletePago
router.put('/:id', actualizarPago); //PutStock - Actualizar

export default router;