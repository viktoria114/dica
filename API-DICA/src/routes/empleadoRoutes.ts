import { Router } from 'express';
import { crearEmpleado, getEmpleados } from '../controllers/empleadoController';
const router = Router();

//aqui se importan los Controllers para cada ruta

router.get('/', getEmpleados); //getEmpleados
//router.get('/:id', ); //getEmpleadoByID
router.post('/', crearEmpleado);//createEmpleado
//router.put('/:id', ); //cambiarPassword
//router.delete('/:id', );//eliminarEmpleado

export default router;