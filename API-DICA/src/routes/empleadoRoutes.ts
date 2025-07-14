import { Router } from 'express';
import { crearEmpleado, getEmpleadosVisibles, actualizarEmpleado, eliminarEmpleado, getEmpleadoPorTelefono, getEmpleadoPorDNI, getEmpleadosInvisibles} from '../controllers/empleadoController';
import { checkRole } from '../middlewares/authHandler';
const router = Router();

//aqui se importan los Controllers para cada ruta

router.get('/', /*checkRole(['admin']), */ getEmpleadosVisibles); //getEmpleados
router.get('/invisibles', /*checkRole(['admin']), */ getEmpleadosInvisibles); //getEmpleados
router.get('/tel/:tel', getEmpleadoPorTelefono); //getEmpleadoByTel
router.get('/dni/:id', getEmpleadoPorDNI); //getEmpleadoByDNI
router.post('/', crearEmpleado);//createEmpleado
router.put('/:id', actualizarEmpleado); // actualizarEmpleado
router.delete('/:id', eliminarEmpleado ); //eliminarEmpleado

export default router;