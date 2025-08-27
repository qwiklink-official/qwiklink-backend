exports.up = async function (knex) {
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wallet_tx_type') THEN
        CREATE TYPE wallet_tx_type AS ENUM ('credit','debit');
      END IF;
    END
    $$;
  `);

  const has = await knex.schema.hasTable('wallet_transactions');
  if (!has) {
    await knex.schema.createTable('wallet_transactions', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('driver_id').notNullable().references('drivers.id').onDelete('CASCADE');
      t.uuid('booking_id').references('bookings.id').onDelete('SET NULL');
      t.specificType('tx_type', 'wallet_tx_type').notNullable();
      t.integer('amount_cents').notNullable();
      t.text('description');
      t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
      t.index(['driver_id', 'created_at']);
      t.index(['booking_id']);
    });
  }
};

exports.down = async function (knex) {
  const has = await knex.schema.hasTable('wallet_transactions');
  if (has) await knex.schema.dropTable('wallet_transactions');
  await knex.raw(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wallet_tx_type') THEN
        DROP TYPE wallet_tx_type;
      END IF;
    END
    $$;
  `);
};
