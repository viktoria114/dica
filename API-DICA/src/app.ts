import express from 'express';
import empleadoRoutes from './routes/empleadoRoutes';
import clienteRoutes from './routes/clienteRoutes';
import authRoutes from "./routes/authRoutes";
import { errorHandler } from './middlewares/errorHandler';


const app = express();

app.use(express.json());

// Routes
app.use('/api/empleados', empleadoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use("/api/auth", authRoutes);

app.get('/', (req, res) => {
    res.send('¡Bienvenido a mi API: DICA');
  });

// Global error handler (should be after routes)
app.use(errorHandler);


export default app;