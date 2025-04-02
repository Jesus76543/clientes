import dotenv from "dotenv";
import { Sequelize } from "sequelize";
dotenv.config();

// Debug: Imprimir la URL de conexión (solo para depuración)
console.log("URL de conexión MySQL:", process.env.MYSQL_URL);

const sequelize = new Sequelize(process.env.MYSQL_URL, {
  dialect: "mysql",
  logging: false, // Puedes activarlo para ver las consultas SQL
  dialectOptions: {
    connectTimeout: 60000 // Para darle más tiempo a la conexión
  },
});

// Función de conexión con reintentos
const connectWithRetry = async (maxRetries = 5, retryInterval = 5000) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await sequelize.authenticate();
      console.log("✅ Conexión a la base de datos establecida correctamente");
      return true;
    } catch (error) {
      retries++;
      console.error(`❌ Intento ${retries}/${maxRetries} fallido: ${error.message}`);
      
      if (retries < maxRetries) {
        console.log(`Reintentando en ${retryInterval/1000} segundos...`);
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      }
    }
  }
  
  console.error("⛔ No se pudo conectar a la base de datos después de múltiples intentos");
  return false;
};

// Intentar la conexión con reintentos
connectWithRetry();

export default sequelize;