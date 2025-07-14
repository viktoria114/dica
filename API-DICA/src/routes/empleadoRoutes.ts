import { Router } from 'express';
import { crearEmpleado, getEmpleados, actualizarEmpleado, eliminarEmpleado, getEmpleadoPorTelefono} from '../controllers/empleadoController';
import {verifyToken, checkRole } from '../middlewares/authHandler';
const router = Router();

//aqui se importan los Controllers para cada ruta

router.get('/:tel', getEmpleadoPorTelefono); //getEmpleadoByTel
router.get('/', verifyToken,checkRole(['admin']),getEmpleados); //getEmpleados
//router.get('/:id', ); //getEmpleadoByID
router.post('/', crearEmpleado);//createEmpleado
router.put('/:id', actualizarEmpleado); // actualizarEmpleado
router.delete('/:id', eliminarEmpleado ); //eliminarEmpleado

export default router;