exports.up = async function (knex) {
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'device_platform') THEN
        CREATE TYPE device_platform AS ENUM ('ios','android','web');
      END IF;
    END
    $$;
  `);

  const has = await knex.schema.hasTable('device_tokens');
  if (!has) {
    await knex.schema.createTable('device_tokens', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('user_id').notNullable().references('users.id').onDelete('CASCADE');
      t.text('fcm_token').notNullable().unique();
      t.specificType('platform', 'device_platform').notNullable();
      t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
      t.timestamp('revoked_at', { useTz: true });
      t.index(['user_id']);
    });
  }
};

exports.down = async function (knex) {
  const has = await knex.schema.hasTable('device_tokens');
  if (has) await knex.schema.dropTable('device_tokens');
  await knex.raw(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'device_platform') THEN
        DROP TYPE device_platform;
      END IF;
    END
    $$;
  `);
};
