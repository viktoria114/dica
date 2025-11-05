import { Router } from 'express';
import { getVentasDiarias, getProductosMasVendidos, getRendimientoEmpleados, getReporteGastos, getIngresosDiarios, getPromocionesMasPedidas, getVentasPorCategoria } from '../controllers/reportesController';

const router = Router();

router.get('/ingresos-diarios', getIngresosDiarios);
router.get('/ventas-diarias', getVentasDiarias);
router.get('/productos-mas-vendidos', getProductosMasVendidos);
router.get('/rendimiento-empleados', getRendimientoEmpleados);
router.get('/reporte-gastos', getReporteGastos);
router.get('/promociones-mas-pedidas', getPromocionesMasPedidas);
router.get('/ventas-por-categoria', getVentasPorCategoria);


export default router;
