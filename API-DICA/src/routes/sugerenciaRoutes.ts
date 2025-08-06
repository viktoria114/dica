import { Router } from "express";
import { obtenerSugerencias, crearSugerencia } from "../controllers/sugerenciasController";
import { verifyToken, checkRole } from "../middlewares/authHandler";
const router = Router();

//Aquí se importan los controles para cada ruta

router.post('/:telefono',verifyToken, checkRole(['admin', 'agente']), crearSugerencia); //postSugerencia
router.get('/', verifyToken, checkRole(['admin']),obtenerSugerencias); //getSugerencias

export default router;