import * as mysql from 'mysql2/promise';

async function seed() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root1234',
    database: 'saree_app',
  });

  const entries: [string, string][] = [
    ['sold_by_name', 'SVastra'],
    ['sold_by_address', '9C 206, Bloomdale Mahindra Complex, Nagpur, Maharashtra, 441108, IN'],
    ['pan_no', 'BFJPA5082B'],
    ['gstin', '27-UR'],
    ['home_state', 'Maharashtra'],
    ['support_phone', '7507599315'],
    ['support_email', 'svastrastore@gmail.com'],
  ];

  for (const [k, v] of entries) {
    await conn.execute(
      'INSERT INTO settings (`key`, `value`, `created_at`, `updated_at`) VALUES (?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updated_at` = NOW()',
      [k, v]
    );
  }

  console.log('Settings successfully seeded in database!');
  const [rows] = await conn.execute('SELECT * FROM settings');
  console.log('Current settings in DB:', rows);
  await conn.end();
}

seed().catch(console.error);
