// config/db.ts
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

// Crear el pool de conexiones
const pool = new Pool({
  connectionString: process.env.POSTGRES_URI,
});

export const dbconnect = async (): Promise<void> => {
  try {
    await pool.connect();
    console.log("✅ Conexión exitosa a PostgreSQL (Neon)");
  } catch (error) {
    // TypeScript no sabe si error es Error, así que lo comprobamos
    if (error instanceof Error) {
      console.error("❌ Error al conectar a PostgreSQL (Neon):", error.message);
    } else {
      console.error("❌ Error desconocido al conectar a PostgreSQL (Neon):", error);
    }
  }
};

// Exportar pool y dbconnect
export { pool };
