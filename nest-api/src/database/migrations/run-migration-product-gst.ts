import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { getDbConfig } from '../db-config';

dotenv.config();

async function run() {
  const dbConfig = getDbConfig();
  console.log(`Connecting to database "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}...`);
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  });

  console.log('1. Adding hsn, cgst, sgst, igst columns to products table...');
  try {
    const [prodCols] = await connection.execute('DESCRIBE products');
    const prodColNames = (prodCols as any[]).map((c: any) => c.Field);

    if (!prodColNames.includes('hsn')) {
      await connection.execute('ALTER TABLE `products` ADD COLUMN `hsn` varchar(15) NULL');
      console.log('  + Added hsn column to products');
    }
    if (!prodColNames.includes('cgst')) {
      await connection.execute('ALTER TABLE `products` ADD COLUMN `cgst` decimal(5,2) NULL');
      console.log('  + Added cgst column to products');
    }
    if (!prodColNames.includes('sgst')) {
      await connection.execute('ALTER TABLE `products` ADD COLUMN `sgst` decimal(5,2) NULL');
      console.log('  + Added sgst column to products');
    }
    if (!prodColNames.includes('igst')) {
      await connection.execute('ALTER TABLE `products` ADD COLUMN `igst` decimal(5,2) NULL');
      console.log('  + Added igst column to products');
    }
  } catch (err: any) {
    console.error('Error adding columns to products:', err.message);
  }

  console.log('2. Migrating category tax data to existing products where product tax is null...');
  try {
    const [catCols] = await connection.execute('DESCRIBE categories');
    const catColNames = (catCols as any[]).map((c: any) => c.Field);

    if (catColNames.includes('hsn') || catColNames.includes('cgst')) {
      await connection.execute(`
        UPDATE \`products\` p
        JOIN \`categories\` c ON p.\`category_id\` = c.\`id\`
        LEFT JOIN \`categories\` pc ON c.\`parent_id\` = pc.\`id\`
        SET
          p.\`hsn\` = COALESCE(p.\`hsn\`, c.\`hsn\`, pc.\`hsn\`),
          p.\`cgst\` = COALESCE(p.\`cgst\`, c.\`cgst\`, pc.\`cgst\`),
          p.\`sgst\` = COALESCE(p.\`sgst\`, c.\`sgst\`, pc.\`sgst\`),
          p.\`igst\` = COALESCE(p.\`igst\`, c.\`igst\`, pc.\`igst\`)
        WHERE p.\`hsn\` IS NULL AND (c.\`hsn\` IS NOT NULL OR pc.\`hsn\` IS NOT NULL);
      `);
      console.log('✓ Successfully migrated existing category tax info to products.');
    }
  } catch (err: any) {
    console.warn('Category tax data migration note:', err.message);
  }

  console.log('3. Dropping hsn, cgst, sgst, igst columns from categories table...');
  try {
    const [catCols] = await connection.execute('DESCRIBE categories');
    const catColNames = (catCols as any[]).map((c: any) => c.Field);

    for (const col of ['hsn', 'cgst', 'sgst', 'igst']) {
      if (catColNames.includes(col)) {
        await connection.execute(`ALTER TABLE \`categories\` DROP COLUMN \`${col}\``);
        console.log(`  - Dropped ${col} column from categories`);
      }
    }
    console.log('✓ Categories table updated (tax columns removed).');
  } catch (err: any) {
    console.error('Error dropping columns from categories:', err.message);
  }

  console.log('4. Verifying products table columns:');
  const [cols] = await connection.execute('DESCRIBE products');
  console.table((cols as any[]).map((c: any) => ({ Field: c.Field, Type: c.Type, Null: c.Null })));

  await connection.end();
  console.log('Migration completed successfully!');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
