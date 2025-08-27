exports.seed = async function(knex) {
  // Assumes users and drivers are already seeded by 001_users.cjs
  const users = await knex('users').select('id', 'email').limit(2);
  const drivers = await knex('drivers').select('id').limit(1);
  if (!users.length) return;

  const booking = {
    id: knex.raw('gen_random_uuid()'),
    customer_id: users[0].id,
    driver_id: drivers.length ? drivers[0].id : null,
    parcel_size: 'small',
    parcel_weight_kg: 1.25,
    pickup_instructions: 'Leave at reception',
    pickup_address: '1 Dev Street, City',
    pickup_lat: -26.2041,
    pickup_lng: 28.0473,
    dropoff_address: '2 Test Ave, City',
    dropoff_lat: -26.2050,
    dropoff_lng: 28.0490,
    status: 'pending',
    price_cents: 2500,
    currency: 'ZAR',
  };

  await knex('bookings').del();
  await knex('bookings').insert(booking);
};
