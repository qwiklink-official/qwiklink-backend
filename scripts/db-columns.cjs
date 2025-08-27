(function(){
  // If DATABASE_URL not set in environment, load from .env
  if (!process.env.DATABASE_URL) {
    try { require('dotenv').config(); } catch (e) { /* ignore if dotenv not installed */ }
  }
})();
// scripts/db-columns.cjs (CommonJS)
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/qwiklink' });
  await c.connect();
  const r = await c.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position");
  console.log(r.rows);
  await c.end();
})().catch(e => { console.error(e); process.exit(1); });
