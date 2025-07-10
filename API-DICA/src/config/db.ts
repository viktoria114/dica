// config/db.js
require("dotenv").config();
const { Pool } = require("pg");

// Crear el pool de conexiones
const pool = new Pool({
  connectionString: process.env.POSTGRES_URI,
});

const dbconnect = async () => {
  try {
    await pool.connect();
    console.log("✅ Conexión exitosa a PostgreSQL (Neon)");
  } catch (error) {
    console.error("❌ Error al conectar a PostgreSQL (Neon):", error.message);
  }
};

// Exportar pool y dbconnect
module.exports = { dbconnect, pool };
