import { Router } from 'express';
import { crearEmpleado, getEmpleados } from '../controllers/empleadoController';
import { checkRole } from '../middlewares/authHandler';
const router = Router();

//aqui se importan los Controllers para cada ruta

router.get('/', /*checkRole(['admin']), */ getEmpleados); //getEmpleados
//router.get('/:id', ); //getEmpleadoByID
router.post('/', crearEmpleado);//createEmpleado
//router.put('/:id', ); //cambiarPassword
//router.delete('/:id', );//eliminarEmpleado

export default router;