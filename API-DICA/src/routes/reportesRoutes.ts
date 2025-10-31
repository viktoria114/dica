import { Router } from 'express';
import { getVentasDiarias, getProductosMasVendidos, getRendimientoEmpleados, getReporteGastos } from '../controllers/reportesController';

const router = Router();

router.get('/ventas-diarias', getVentasDiarias);
router.get('/productos-mas-vendidos', getProductosMasVendidos);
router.get('/rendimiento-empleados', getRendimientoEmpleados);
router.get('/reporte-gastos', getReporteGastos);

export default router;
