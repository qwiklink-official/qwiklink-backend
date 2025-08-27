exports.up = async function (knex) {
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('initiated','authorized','captured','failed','refunded');
      END IF;
    END
    $$;
  `);

  const has = await knex.schema.hasTable('payments');
  if (!has) {
    await knex.schema.createTable('payments', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('booking_id').notNullable().references('bookings.id').onDelete('CASCADE');
      t.integer('amount_cents').notNullable();
      t.string('currency', 3).notNullable().defaultTo('ZAR');
      t.text('provider').notNullable().defaultTo('yoco');
      t.text('provider_charge_id');
      t.specificType('status', 'payment_status').notNullable().defaultTo('initiated');
      t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
      t.timestamp('captured_at', { useTz: true });
      t.timestamp('refunded_at', { useTz: true });
      t.index(['booking_id']);
      t.index(['status']);
    });
  }
};

exports.down = async function (knex) {
  const has = await knex.schema.hasTable('payments');
  if (has) await knex.schema.dropTable('payments');
  await knex.raw(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        DROP TYPE payment_status;
      END IF;
    END
    $$;
  `);
};
