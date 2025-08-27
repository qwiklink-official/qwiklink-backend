(function(){
  if (!process.env.DATABASE_URL) {
    try { require('dotenv').config(); } catch (e) { }
  }
})();
// scripts/check-migrations.cjs (CommonJS)
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/qwiklink' });
  await c.connect();
  const r = await c.query('SELECT * FROM knex_migrations ORDER BY id');
  console.log(r.rows);
  await c.end();
})().catch(e=>{console.error(e); process.exit(1);});
