import { Router } from 'express';
import { crearEmpleado, getEmpleadosVisibles, actualizarEmpleado, eliminarEmpleado, getEmpleadoPorTelefono, getEmpleadoPordni, getEmpleadosInvisibles, restaurarEmpleado} from '../controllers/empleadoController';
import {verifyToken, checkRole } from '../middlewares/authHandler';
const router = Router();

//aqui se importan los Controllers para cada ruta

router.get('/', verifyToken, checkRole(['admin', 'agente']), getEmpleadosVisibles); //getEmpleados
router.get('/invisibles',verifyToken, checkRole(['admin']), getEmpleadosInvisibles); //getEmpleados
router.get('/tel/:tel', verifyToken, checkRole(['admin', 'agente']),getEmpleadoPorTelefono); //getEmpleadoByTel
router.get('/dni/:id',verifyToken, getEmpleadoPordni); //getEmpleadoBydni
router.post('/', crearEmpleado);//createEmpleado
router.put('/:id',verifyToken, checkRole(['admin']), actualizarEmpleado); // actualizarEmpleado
//router.put('/',verifyToken, actualizarEmpleado_POVEmpledo); // actualizarEmpleado_POVEmpled
router.put('/restaurar/:id',verifyToken, checkRole(['admin']), restaurarEmpleado ) //restaurarEmpleado
router.delete('/:id',verifyToken, checkRole(['admin']), eliminarEmpleado ); //eliminarEmpleado

export default router;