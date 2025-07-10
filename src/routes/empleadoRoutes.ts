import { Router } from 'express';
import { crearEmpleado } from '../controllers/empleadoController';
const router = Router();

//aqui se importan los Controllers para cada ruta

//router.get('/:id', ); //getEmpleadoByID
router.post('/', crearEmpleado);//createEmpleado
//router.put('/:id', ); //cambiarPassword
//router.delete('/:id', );//eliminarEmpleado

export default router;