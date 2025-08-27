exports.up = async function (knex) {
  const has = await knex.schema.hasTable('tracking_points');
  if (!has) {
    await knex.schema.createTable('tracking_points', (t) => {
      t.bigIncrements('id').primary();
      t.uuid('booking_id').notNullable().references('bookings.id').onDelete('CASCADE');
      t.uuid('driver_id').notNullable().references('drivers.id').onDelete('CASCADE');
      t.decimal('lat', 10, 7).notNullable();
      t.decimal('lng', 10, 7).notNullable();
      t.decimal('speed_kmh', 6, 2);
      t.decimal('heading_deg', 6, 2);
      t.timestamp('recorded_at', { useTz: true }).defaultTo(knex.fn.now());
      t.index(['booking_id', 'recorded_at']);
      t.index(['driver_id', 'recorded_at']);
    });
  }
};

exports.down = async function (knex) {
  const has = await knex.schema.hasTable('tracking_points');
  if (has) await knex.schema.dropTable('tracking_points');
};
