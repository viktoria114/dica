import app from './app';
import config from './config/config';
import { dbconnect } from './config/db';

dbconnect().then(() => {
      app.listen(config.port, () => {
          console.log(`Servidor corriendo en http://localhost:${config.port}`);
        });
      
  }).catch(err => {
      console.error('No se pudo iniciar el servidor debido a un error en la base de datos');
  });
