exports.up = async function (knex) {
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM (
          'pending', 'assigned', 'en_route_pickup', 'picked_up',
          'en_route_dropoff', 'delivered', 'cancelled'
        );
      END IF;
    END
    $$;
  `);

  const has = await knex.schema.hasTable('bookings');
  if (!has) {
    await knex.schema.createTable('bookings', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('customer_id').notNullable().references('users.id').onDelete('RESTRICT');
      t.uuid('driver_id').references('drivers.id').onDelete('SET NULL');
      t.text('parcel_size');
      t.decimal('parcel_weight_kg', 6, 2);
      t.text('pickup_instructions');
      t.text('pickup_address').notNullable();
      t.decimal('pickup_lat', 10, 7).notNullable();
      t.decimal('pickup_lng', 10, 7).notNullable();
      t.text('dropoff_address').notNullable();
      t.decimal('dropoff_lat', 10, 7).notNullable();
      t.decimal('dropoff_lng', 10, 7).notNullable();
      t.specificType('status', 'booking_status').notNullable().defaultTo('pending');
      t.integer('price_cents').notNullable().defaultTo(0);
      t.string('currency', 3).notNullable().defaultTo('ZAR');
      t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
      t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
      t.index(['customer_id']);
      t.index(['driver_id']);
      t.index(['status']);
    });
  }
};

exports.down = async function (knex) {
  const has = await knex.schema.hasTable('bookings');
  if (has) await knex.schema.dropTable('bookings');
  await knex.raw(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        DROP TYPE booking_status;
      END IF;
    END
    $$;
  `);
};
