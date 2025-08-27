/**
 * Seed a test user for CI and local development.
 * Computes bcrypt hash at runtime from TEST_PASSWORD (defaults to 'password123').
 */
const bcrypt = require('bcrypt');

exports.seed = async function (knex) {
  const testPassword = process.env.TEST_PASSWORD || 'password123';
  const hash = await bcrypt.hash(testPassword, 10);

  const cols = await knex('users').columnInfo();

  function buildUser(email, first, last, phone, role) {
    const base = { id: knex.raw('gen_random_uuid()'), email, password_hash: hash, role };
    if (cols.first_name && cols.last_name) {
      base.first_name = first;
      base.last_name = last;
    } else if (cols.full_name) {
      base.full_name = `${first} ${last}`.trim();
    }
    if (cols.phone) base.phone = phone;
    if (cols.phone_number) base.phone_number = phone;
    return base;
  }

  const users = [
    buildUser('test.customer@example.com', 'Test', 'Customer', '0000000001', 'customer'),
    buildUser('test.driver@example.com', 'Test', 'Driver', '0000000002', 'driver'),
    buildUser('test.dispatcher@example.com', 'Dispatch', 'Admin', '0000000003', 'dispatcher'),
  ];

  // Clear table and insert deterministic users
  await knex('users').del();
  await knex('users').insert(users);
};

