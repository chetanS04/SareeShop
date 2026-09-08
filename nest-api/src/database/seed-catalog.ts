import * as dotenv from 'dotenv';
import * as mysql from 'mysql2/promise';
import { getDbConfig } from './db-config';
import { brandsSeedData, attributesSeedData, SeedSubcategoryAttributeConfig } from './seeds/catalog-seed-data';
import { categoriesSeedData } from './seeds/categories-seed-data';

dotenv.config();

async function seedCatalog() {
  const dbConfig = getDbConfig();
  console.log(`\n======================================================`);
  console.log(`🚀 Starting Comprehensive E-Commerce Catalog Seeder`);
  console.log(`Max 2 Attributes Per Subcategory (All 7 Pattern Types)`);
  console.log(`Connecting to database "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}...`);
  console.log(`======================================================\n`);

  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  });

  try {
    // -------------------------------------------------------------
    // STEP 0: Reset catalog tables for clean 50% data seeding
    // -------------------------------------------------------------
    console.log('0. Resetting catalog tables for fresh 50% data seeding...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('TRUNCATE TABLE `category_attributes`;');
    await connection.query('TRUNCATE TABLE `attribute_values`;');
    await connection.query('TRUNCATE TABLE `attributes`;');
    await connection.query('TRUNCATE TABLE `categories`;');
    await connection.query('TRUNCATE TABLE `brands`;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✓ Catalog tables truncated successfully.\n');

    // -------------------------------------------------------------
    // STEP 1: Seed Brands
    // -------------------------------------------------------------
    console.log(`1. Seeding ${brandsSeedData.length} Brands...`);
    for (const b of brandsSeedData) {
      await connection.execute(
        `INSERT INTO \`brands\` (\`name\`, \`description\`, \`image1\`, \`description1\`, \`status\`)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           \`description\` = VALUES(\`description\`),
           \`image1\` = VALUES(\`image1\`),
           \`description1\` = VALUES(\`description1\`),
           \`status\` = VALUES(\`status\`)`,
        [b.name, b.description || '', b.image1 || null, b.description1 || null, b.status ? 1 : 0],
      );
    }
    const [brandRows]: any = await connection.execute('SELECT COUNT(*) as count FROM `brands`');
    console.log(`✓ Seeded Brands successfully. Total brands in DB: ${brandRows[0].count}\n`);

    // -------------------------------------------------------------
    // STEP 2: Seed Attributes & Attribute Values
    // -------------------------------------------------------------
    console.log(`2. Seeding ${attributesSeedData.length} Attributes and their Attribute Values...`);
    const attributeMap = new Map<string, number>();

    for (const attr of attributesSeedData) {
      // Upsert Attribute
      const [existingAttr]: any = await connection.execute(
        'SELECT id FROM `attributes` WHERE `name` = ? LIMIT 1',
        [attr.name],
      );

      let attrId: number;
      if (existingAttr && existingAttr.length > 0) {
        attrId = Number(existingAttr[0].id);
        await connection.execute(
          'UPDATE `attributes` SET `description` = ?, `status` = 1 WHERE `id` = ?',
          [attr.description || '', attrId],
        );
      } else {
        const [insertRes]: any = await connection.execute(
          'INSERT INTO `attributes` (`name`, `description`, `status`) VALUES (?, ?, 1)',
          [attr.name, attr.description || ''],
        );
        attrId = Number(insertRes.insertId);
      }

      attributeMap.set(attr.name, attrId);

      // Seed Attribute Values in batch
      if (attr.values && attr.values.length > 0) {
        const batchValues: any[] = [];
        const placeholders: string[] = [];

        for (const v of attr.values) {
          placeholders.push('(?, ?, ?, 1)');
          batchValues.push(v.value, v.description || '', attrId);
        }

        const insertValuesSql = `
          INSERT INTO \`attribute_values\` (\`value\`, \`description\`, \`attribute_id\`, \`status\`)
          VALUES ${placeholders.join(', ')}
          ON DUPLICATE KEY UPDATE
            \`description\` = VALUES(\`description\`),
            \`status\` = VALUES(\`status\`)
        `;

        await connection.query(insertValuesSql, batchValues);
      }
    }

    const [attrCountRows]: any = await connection.execute('SELECT COUNT(*) as count FROM `attributes`');
    const [valCountRows]: any = await connection.execute('SELECT COUNT(*) as count FROM `attribute_values`');
    console.log(`✓ Seeded Attributes (${attrCountRows[0].count}) and Attribute Values (${valCountRows[0].count}) successfully.\n`);

    // -------------------------------------------------------------
    // STEP 3: Seed 35 Parent Categories
    // -------------------------------------------------------------
    console.log(`3. Seeding ${categoriesSeedData.length} Parent Categories...`);
    const parentCategoryMap = new Map<string, number>();

    for (const cat of categoriesSeedData) {
      const [existingCat]: any = await connection.execute(
        'SELECT id FROM `categories` WHERE `name` = ? AND `parent_id` IS NULL LIMIT 1',
        [cat.name],
      );

      let parentId: number;
      if (existingCat && existingCat.length > 0) {
        parentId = Number(existingCat[0].id);
        await connection.execute(
          'UPDATE `categories` SET `description` = ?, `image` = ?, `secondary_image` = ?, `link` = ?, `status` = 1 WHERE `id` = ?',
          [cat.description || '', cat.image || null, cat.secondaryImage || null, cat.link || null, parentId],
        );
      } else {
        const [insertRes]: any = await connection.execute(
          'INSERT INTO `categories` (`name`, `description`, `image`, `secondary_image`, `link`, `parent_id`, `status`) VALUES (?, ?, ?, ?, ?, NULL, 1)',
          [cat.name, cat.description || '', cat.image || null, cat.secondaryImage || null, cat.link || null],
        );
        parentId = Number(insertRes.insertId);
      }

      parentCategoryMap.set(cat.name, parentId);
    }
    console.log(`✓ Seeded ${categoriesSeedData.length} Parent Categories successfully.\n`);

    // -------------------------------------------------------------
    // STEP 4: Clear existing category_attributes before seeding
    // -------------------------------------------------------------
    console.log('4. Resetting category_attributes pivot table for clean max-2 attribute assignment...');
    await connection.execute('DELETE FROM `category_attributes`');
    console.log('✓ Cleared category_attributes.\n');

    // -------------------------------------------------------------
    // STEP 5: Seed Subcategories & Precise Max-2 Category Attributes
    // -------------------------------------------------------------
    console.log('5. Seeding Subcategories and configuring all 7 subcategory attribute patterns...');

    const patternStats = {
      type0_no_attributes: 0,
      type1_one_attr_no_images: 0,
      type2_one_attr_with_images: 0,
      type3_two_attrs_no_images: 0,
      type4_two_attrs_1st_images_and_primary: 0,
      type5_two_attrs_2nd_images_and_primary: 0,
      type6_two_attrs_1st_images_2nd_primary: 0,
    };

    const allCatAttrPlaceholders: string[] = [];
    const allCatAttrValues: any[] = [];

    for (const cat of categoriesSeedData) {
      const parentId = parentCategoryMap.get(cat.name);
      if (!parentId) continue;

      const [attr1Name, attr2Name] = cat.domainAttributes;

      for (let idx = 0; idx < cat.subcategories.length; idx++) {
        const subName = cat.subcategories[idx];
        const subDesc = `<p>Explore our premium collection of <strong>${subName}</strong> under <strong>${cat.name}</strong>. High quality, curated range with best prices.</p>`;
        const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const subLink = `/category/${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${subSlug}`;

        // Upsert subcategory
        const [existingSub]: any = await connection.execute(
          'SELECT id FROM `categories` WHERE `name` = ? AND `parent_id` = ? LIMIT 1',
          [subName, parentId],
        );

        let subId: number;
        if (existingSub && existingSub.length > 0) {
          subId = Number(existingSub[0].id);
          await connection.execute(
            'UPDATE `categories` SET `description` = ?, `link` = ?, `status` = 1 WHERE `id` = ?',
            [subDesc, subLink, subId],
          );
        } else {
          const [insertRes]: any = await connection.execute(
            'INSERT INTO `categories` (`name`, `description`, `link`, `parent_id`, `status`) VALUES (?, ?, ?, ?, 1)',
            [subName, subDesc, subLink, parentId],
          );
          subId = Number(insertRes.insertId);
        }

        // Determine which of the 7 patterns to apply (idx % 7)
        const patternType = idx % 7;
        let subAttrs: SeedSubcategoryAttributeConfig[] = [];

        switch (patternType) {
          case 0:
            // 1. Without attribute (0 attributes)
            subAttrs = [];
            patternStats.type0_no_attributes++;
            break;

          case 1:
            // 2. One attribute without images (hasImages: false, isPrimary: true)
            subAttrs = [
              { attributeName: attr1Name, hasImages: false, isPrimary: true },
            ];
            patternStats.type1_one_attr_no_images++;
            break;

          case 2:
            // 3. One attribute with images (hasImages: true, isPrimary: true)
            subAttrs = [
              { attributeName: attr1Name, hasImages: true, isPrimary: true },
            ];
            patternStats.type2_one_attr_with_images++;
            break;

          case 3:
            // 4. Two attributes without images (both hasImages: false, 1st isPrimary: true, 2nd isPrimary: false)
            subAttrs = [
              { attributeName: attr1Name, hasImages: false, isPrimary: true },
              { attributeName: attr2Name, hasImages: false, isPrimary: false },
            ];
            patternStats.type3_two_attrs_no_images++;
            break;

          case 4:
            // 5. Two attributes: 1st attribute has images AND is primary; 2nd has no images AND is not primary
            subAttrs = [
              { attributeName: attr1Name, hasImages: true, isPrimary: true },
              { attributeName: attr2Name, hasImages: false, isPrimary: false },
            ];
            patternStats.type4_two_attrs_1st_images_and_primary++;
            break;

          case 5:
            // 6. Two attributes: 2nd attribute has images AND is primary; 1st has no images AND is not primary
            subAttrs = [
              { attributeName: attr1Name, hasImages: false, isPrimary: false },
              { attributeName: attr2Name, hasImages: true, isPrimary: true },
            ];
            patternStats.type5_two_attrs_2nd_images_and_primary++;
            break;

          case 6:
            // 7. Two attributes: 1st attribute has images AND is not primary; 2nd has no images AND is primary
            subAttrs = [
              { attributeName: attr1Name, hasImages: true, isPrimary: false },
              { attributeName: attr2Name, hasImages: false, isPrimary: true },
            ];
            patternStats.type6_two_attrs_1st_images_2nd_primary++;
            break;
        }

        // Collect category_attributes records (guaranteed max 2 attributes)
        for (const sa of subAttrs) {
          const resolvedAttrId = attributeMap.get(sa.attributeName);
          if (resolvedAttrId) {
            allCatAttrPlaceholders.push('(?, ?, ?, ?)');
            allCatAttrValues.push(
              subId,
              resolvedAttrId,
              sa.hasImages ? 1 : 0,
              sa.isPrimary ? 1 : 0,
            );
          }
        }
      }

      console.log(`  ✓ Seeded "${cat.name}": ${cat.subcategories.length} subcategories with max 2 attributes`);
    }

    // Batch insert category_attributes
    console.log(`\nInserting ${allCatAttrPlaceholders.length} category_attribute links in batches...`);
    const chunkSize = 500;
    for (let i = 0; i < allCatAttrPlaceholders.length; i += chunkSize) {
      const pChunk = allCatAttrPlaceholders.slice(i, i + chunkSize);
      const vChunk = allCatAttrValues.slice(i * 4, (i + chunkSize) * 4);

      const sqlCatAttr = `
        INSERT INTO \`category_attributes\` (\`category_id\`, \`attribute_id\`, \`has_images\`, \`is_primary\`)
        VALUES ${pChunk.join(', ')}
        ON DUPLICATE KEY UPDATE
          \`has_images\` = VALUES(\`has_images\`),
          \`is_primary\` = VALUES(\`is_primary\`)
      `;
      await connection.query(sqlCatAttr, vChunk);
    }

    // -------------------------------------------------------------
    // FINAL SUMMARY & VERIFICATION
    // -------------------------------------------------------------
    const [finalParentCats]: any = await connection.execute('SELECT COUNT(*) as count FROM `categories` WHERE `parent_id` IS NULL');
    const [finalSubCats]: any = await connection.execute('SELECT COUNT(*) as count FROM `categories` WHERE `parent_id` IS NOT NULL');
    const [finalCatAttrs]: any = await connection.execute('SELECT COUNT(*) as count FROM `category_attributes`');
    const [finalBrands]: any = await connection.execute('SELECT COUNT(*) as count FROM `brands`');
    const [finalAttributes]: any = await connection.execute('SELECT COUNT(*) as count FROM `attributes`');
    const [finalAttrValues]: any = await connection.execute('SELECT COUNT(*) as count FROM `attribute_values`');

    console.log(`\n======================================================`);
    console.log(`🎉 CATALOG SEEDING COMPLETED SUCCESSFULLY!`);
    console.log(`======================================================`);
    console.table([
      { Entity: 'Brands', Count: finalBrands[0].count },
      { Entity: 'Parent Categories', Count: finalParentCats[0].count },
      { Entity: 'Subcategories', Count: finalSubCats[0].count },
      { Entity: 'Attributes', Count: finalAttributes[0].count },
      { Entity: 'Attribute Values', Count: finalAttrValues[0].count },
      { Entity: 'Category Attributes Pivot Links', Count: finalCatAttrs[0].count },
    ]);

    console.log(`\n--- Subcategory Attribute Pattern Breakdown ---`);
    console.table([
      { Pattern: 'Type 0: Without Attributes (0 attr)', Count: patternStats.type0_no_attributes },
      { Pattern: 'Type 1: 1 Attribute without images (No Images, Primary)', Count: patternStats.type1_one_attr_no_images },
      { Pattern: 'Type 2: 1 Attribute with images (Has Images, Primary)', Count: patternStats.type2_one_attr_with_images },
      { Pattern: 'Type 3: 2 Attributes without images (No Images, 1st Primary)', Count: patternStats.type3_two_attrs_no_images },
      { Pattern: 'Type 4: 2 Attributes (1st: Images+Primary, 2nd: No Images+Not Primary)', Count: patternStats.type4_two_attrs_1st_images_and_primary },
      { Pattern: 'Type 5: 2 Attributes (1st: No Images+Not Primary, 2nd: Images+Primary)', Count: patternStats.type5_two_attrs_2nd_images_and_primary },
      { Pattern: 'Type 6: 2 Attributes (1st: Images+Not Primary, 2nd: No Images+Primary)', Count: patternStats.type6_two_attrs_1st_images_2nd_primary },
    ]);
    console.log(`======================================================\n`);
  } catch (err: any) {
    console.error(`❌ Error during catalog seeding:`, err);
    throw err;
  } finally {
    await connection.end();
  }
}

seedCatalog().catch((err) => {
  console.error('Catalog seeding process exited with error:', err);
  process.exit(1);
});
