import { Router } from 'express';
import { crearEmpleado, getEmpleadosVisibles, actualizarEmpleado, eliminarEmpleado, getEmpleadoPorTelefono, getEmpleadoPorDNI, getEmpleadosInvisibles, restaurarEmpleado} from '../controllers/empleadoController';
import {verifyToken, checkRole } from '../middlewares/authHandler';
const router = Router();

//aqui se importan los Controllers para cada ruta

router.get('/', verifyToken, checkRole(['admin', 'agente']), getEmpleadosVisibles); //getEmpleados
router.get('/invisibles', /*checkRole(['admin']), */ getEmpleadosInvisibles); //getEmpleados
router.get('/tel/:tel', getEmpleadoPorTelefono); //getEmpleadoByTel
router.get('/dni/:id', getEmpleadoPorDNI); //getEmpleadoByDNI
router.post('/', crearEmpleado);//createEmpleado
router.put('/:id', actualizarEmpleado); // actualizarEmpleado
router.put('/restaurar/:id', restaurarEmpleado ) //restaurarEmpleado
router.delete('/:id', eliminarEmpleado ); //eliminarEmpleado

export default router;