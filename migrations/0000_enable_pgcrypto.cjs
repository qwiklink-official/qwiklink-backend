/**
 * Ensure pgcrypto is available for gen_random_uuid()
 */
exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
};
exports.down = async function () {
  // keep extension installed (safe to leave)
};
