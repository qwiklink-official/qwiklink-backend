
import pkg from "pg";
const { Pool } = pkg;

// Production-ready, minimal DB configuration.
// Prefer DATABASE_URL (hosted providers). For local development, fall back
// to DB_USER/DB_PASSWORD/DB_HOST/DB_PORT/DB_NAME.
const useConnectionString = Boolean(process.env.DATABASE_URL);

const poolConfig = useConnectionString
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
    }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : undefined,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      database: process.env.DB_NAME,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
    };

const pool = new Pool(poolConfig);
export default pool;