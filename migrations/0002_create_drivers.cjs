exports.up = async function (knex) {
  const has = await knex.schema.hasTable('drivers');
  if (!has) {
    await knex.schema.createTable('drivers', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('user_id').notNullable().references('users.id').onDelete('CASCADE');
      t.text('license_number');
      t.text('vehicle_type');
      t.text('vehicle_plate');
      t.boolean('is_active').notNullable().defaultTo(true);
      t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    });
  }
};

exports.down = async function (knex) {
  const has = await knex.schema.hasTable('drivers');
  if (has) await knex.schema.dropTable('drivers');
};
