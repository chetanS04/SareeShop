import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import { users } from './schema/users';
import { statesSeedData } from './seeds/000_stateTableSeeder';
import { citiesSeedData } from './seeds/001_citiesTableSeeder';
import { getDbConfig } from './db-config';

dotenv.config();

async function seed() {
  const dbConfig = getDbConfig();
  console.log(`Connecting to database "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}...`);
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  });

  const db = drizzle(connection);

  // 1. Seed Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'root1234';
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  if (existingAdmin.length > 0) {
    console.log(`Updating admin user credentials for "${adminEmail}"...`);
    await db
      .update(users)
      .set({
        name: adminName,
        password: hashedPassword,
        role: 'Admin',
        isVerified: 'true',
        emailVerifiedAt: new Date(),
        status: true,
      })
      .where(eq(users.email, adminEmail));
    console.log('✓ Admin user updated successfully.');
  } else {
    console.log(`Creating admin user "${adminEmail}"...`);
    await db.insert(users).values({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'Admin',
      isVerified: 'true',
      emailVerifiedAt: new Date(),
      status: true,
    });
    console.log('✓ Admin user created successfully.');
  }

  // 2. Seed States & Cities
  try {
    const [stateCountRows] = await connection.execute('SELECT COUNT(*) as count FROM states');
    const stateCount = Number((stateCountRows as any)[0]?.count || 0);

    if (stateCount === 0 && statesSeedData.length > 0) {
      console.log(`Seeding ${statesSeedData.length} states...`);
      for (const s of statesSeedData) {
        await connection.execute(
          'INSERT INTO states (id, name, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
          [s.id, s.name, s.status ? 1 : 0],
        );
      }
      console.log(`✓ Seeded ${statesSeedData.length} states successfully.`);
    } else {
      console.log(`✓ States table already has ${stateCount} records.`);
    }

    const [cityCountRows] = await connection.execute('SELECT COUNT(*) as count FROM cities');
    const cityCount = Number((cityCountRows as any)[0]?.count || 0);

    if (cityCount === 0 && citiesSeedData.length > 0) {
      console.log(`Seeding ${citiesSeedData.length} cities in batches...`);
      const batchSize = 500;
      for (let i = 0; i < citiesSeedData.length; i += batchSize) {
        const chunk = citiesSeedData.slice(i, i + batchSize);
        const values: any[] = [];
        const placeholders = chunk
          .map((c) => {
            values.push(c.id, c.name, c.state_id, c.status ? 1 : 0);
            return '(?, ?, ?, ?)';
          })
          .join(', ');

        await connection.query(
          `INSERT INTO cities (id, name, state_id, status) VALUES ${placeholders} ON DUPLICATE KEY UPDATE name=VALUES(name), state_id=VALUES(state_id)`,
          values,
        );
      }
      console.log(`✓ Seeded all ${citiesSeedData.length} cities successfully.`);
    } else {
      console.log(`✓ Cities table already has ${cityCount} records.`);
    }
  } catch (locErr) {
    console.error('Warning during states/cities seeding:', locErr);
  }

  await connection.end();
  console.log('\n🎉 Seeding completed successfully!\n');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});

