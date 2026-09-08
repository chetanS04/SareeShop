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

  const variantColumns = [
    { name: 'is_cod_allowed', sql: '`is_cod_allowed` tinyint(1) NOT NULL DEFAULT 1' },
    { name: 'is_returnable', sql: '`is_returnable` tinyint(1) NOT NULL DEFAULT 1' },
    { name: 'return_window_days', sql: '`return_window_days` int NOT NULL DEFAULT 7' },
    { name: 'shipping_charges', sql: '`shipping_charges` decimal(10,2) NOT NULL DEFAULT 0.00' },
  ];

  console.log('--- Checking & Updating `variants` table ---');
  for (const col of variantColumns) {
    try {
      const [existing]: any = await connection.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'variants' AND COLUMN_NAME = ?`,
        [dbConfig.database, col.name]
      );
      if (existing && existing.length > 0) {
        console.log(`Column ${col.name} already exists in variants.`);
      } else {
        await connection.execute(`ALTER TABLE \`variants\` ADD COLUMN ${col.sql}`);
        console.log(`✓ Added column ${col.name} to variants`);
      }
    } catch (err: any) {
      console.error(`Error adding column ${col.name} to variants:`, err.message);
    }
  }

  const orderItemColumns = [
    { name: 'is_cod_allowed', sql: '`is_cod_allowed` tinyint(1) NULL DEFAULT 1' },
    { name: 'is_returnable', sql: '`is_returnable` tinyint(1) NULL DEFAULT 1' },
    { name: 'return_window_days', sql: '`return_window_days` int NULL DEFAULT 7' },
    { name: 'shipping_charge', sql: '`shipping_charge` decimal(10,2) NULL DEFAULT 0.00' },
  ];

  console.log('--- Checking & Updating `order_items` table ---');
  for (const col of orderItemColumns) {
    try {
      const [existing]: any = await connection.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'order_items' AND COLUMN_NAME = ?`,
        [dbConfig.database, col.name]
      );
      if (existing && existing.length > 0) {
        console.log(`Column ${col.name} already exists in order_items.`);
      } else {
        await connection.execute(`ALTER TABLE \`order_items\` ADD COLUMN ${col.sql}`);
        console.log(`✓ Added column ${col.name} to order_items`);
      }
    } catch (err: any) {
      console.error(`Error adding column ${col.name} to order_items:`, err.message);
    }
  }

  const [vCols] = await connection.execute('DESCRIBE variants');
  console.log('\nCurrent variants columns:');
  console.table((vCols as any[]).map((c: any) => ({ Field: c.Field, Type: c.Type, Default: c.Default, Null: c.Null })));

  const [oiCols] = await connection.execute('DESCRIBE order_items');
  console.log('\nCurrent order_items columns:');
  console.table((oiCols as any[]).map((c: any) => ({ Field: c.Field, Type: c.Type, Default: c.Default, Null: c.Null })));

  await connection.end();
  console.log('Migration completed successfully.');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
