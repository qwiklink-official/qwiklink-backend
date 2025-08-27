exports.up = async function (knex) {
  const has = await knex.schema.hasTable('users');
  if (!has) {
    await knex.schema.createTable('users', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.text('email').notNullable().unique();
      t.text('password_hash').notNullable();
      t.text('first_name').notNullable();
      t.text('last_name').notNullable();
      t.text('phone_number');
      t.enu('role', ['customer', 'driver'], { useNative: true, enumName: 'user_role' }).notNullable();
      t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
      t.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    });
  }
};

exports.down = async function (knex) {
  const has = await knex.schema.hasTable('users');
  if (has) await knex.schema.dropTable('users');
  await knex.raw('DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = \'user_role\') THEN DROP TYPE user_role; END IF; END $$;');
};
