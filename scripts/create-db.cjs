// scripts/create-db.cjs
// Creates the database named by DB_NAME (or 'qwiklink') if it does not exist.
const { Client } = require('pg');

(async () => {
  try {
    const dbName = process.env.DB_NAME || process.env.DATABASE_NAME || 'qwiklink';
    // Connect to the default maintenance DB (postgres) or use DATABASE_URL if it points to postgres
    const defaultDb = process.env.DATABASE_URL_FOR_CREATE || process.env.DATABASE_URL || `postgres://postgres:postgres@localhost:5432/postgres`;

    const client = new Client({ connectionString: defaultDb });
    await client.connect();

    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (res.rowCount === 0) {
      console.log(`Creating database '${dbName}'...`);
      // Quote the identifier and escape any double-quotes inside the name by doubling them
      const safeName = dbName.replace(/"/g, '""');
      await client.query(`CREATE DATABASE "${safeName}"`);
      console.log('Database created.');
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }

    await client.end();
  } catch (err) {
    console.error('Failed to create database:', err.message || err);
    process.exitCode = 1;
  }
})();
