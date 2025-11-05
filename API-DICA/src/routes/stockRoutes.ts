import { Router } from 'express';
import { verifyToken, checkRole } from '../middlewares/authHandler';
import {
  crearStock,
  setVencimientoStock,
  GetRegistrosStock,
  getStockNoVisible,
  getStockVisible,
  validateLowStock,
  actualizarStock,
  restaurarStock,
  eliminarstock,
  crearRegistroStock,
  actualizarRegistroStock,
  eliminarRegistroStock,
  validateExpiredStock,
} from '../controllers/stockControllers';

const router = Router();

router.post('/', crearStock); //PostStock
router.get('/', getStockVisible); //GetStock
router.get('/invisibles', getStockNoVisible); //GetStock
router.get('/verificar', validateLowStock);
router.post('/vencidos', setVencimientoStock);
router.get('/registro/:id', GetRegistrosStock);

router.delete('/:id', eliminarstock); //DeleteStock
router.put('/restaurar/:id', restaurarStock); //Restaurar Stock
router.put('/:id', actualizarStock); //PutStock - Actualizar

router.post('/registro', crearRegistroStock); //PostRegistroStock
router.put('/registro/:id', actualizarRegistroStock); //PutRegistroStock - Actualizar
router.delete('/registro/:id', eliminarRegistroStock); //DeleteRegistroStock
router.get('/vencidos', validateExpiredStock); //Verificar stock vencido

export default router;
