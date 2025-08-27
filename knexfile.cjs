// knexfile.cjs
require('dotenv').config();

const base = {
  client: 'pg',
  migrations: { tableName: 'knex_migrations', directory: './migrations' },
  pool: { min: 2, max: 10 },
};

function connectionFromEnv({ ssl = false } = {}) {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ...(ssl ? { ssl: { rejectUnauthorized: false } } : {}),
    };
  }
  return {
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'postgres',
    ...(ssl ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}

module.exports = {
  development: {
    ...base,
    connection: connectionFromEnv({ ssl: false }),
  },
  production: {
    ...base,
    connection: connectionFromEnv({ ssl: true }),
  },
};
