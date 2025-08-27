import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME,
  ssl: false,
});

const sql = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text UNIQUE NOT NULL,
  role text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);
`;

(async () => {
  try {
    await pool.query(sql);
    console.log('Local DB initialized');
  } catch (err) {
    console.error('INIT_DB_ERR', err && err.message ? err.message : err);
  } finally {
    await pool.end();
  }
})();
