import express from 'express';
import empleadoRoutes from './routes/empleadoRoutes';
import clienteRoutes from './routes/clienteRoutes';
import sugerenciaRoutes from './routes/sugerenciaRoutes'
import stockRoutes from './routes/stockRoutes'
import authRoutes from "./routes/authRoutes";
import agenteRoutes from './routes/agenteRoutes'
import menuRoutes from './routes/menuRoutes'
import { errorHandler } from './middlewares/errorHandler';
import cors from 'cors'

const app = express();

app.use(express.json());
app.use(cors());
// Routes
app.use('/api/empleados', empleadoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/sugerencias', sugerenciaRoutes)
app.use('/api/stock', stockRoutes)
app.use("/api/auth", authRoutes);
app.use('/api/agente', agenteRoutes);
app.use('/api/menu', menuRoutes)

app.get('/', (req, res) => {
    res.send('¡Bienvenido a mi API: DICA');
  });

// Global error handler (should be after routes)
app.use(errorHandler);


export default app;