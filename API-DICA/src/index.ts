import { log } from 'console';
import express from 'express';
//import itemRoutes from './routes/itemRoutes';
//import { errorHandler } from './middlewares/errorHandler';

console.log("SI FUNCIONA LOCO");


const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/valen', (req, res) => {
    console.log("jij");
    
  res.status(200).send('HOLA OSY VLANE');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

// Routes
//app.use('/api/items', itemRoutes);

// Global error handler (should be after routes)
//app.use(errorHandler);

export default app;