import * as dotenv from 'dotenv';
import * as mysql from 'mysql2/promise';
import { getDbConfig } from './db-config';
import { attributesSeedData } from './seeds/catalog-seed-data';

dotenv.config();

// -------------------------------------------------------------
// HELPER TYPES & DOMAIN CONFIGS
// -------------------------------------------------------------
interface CategoryDomainRule {
  brandKeywords: string[];
  basePriceMin: number;
  basePriceMax: number;
  priceStep: number;
  hsnList: string[];
  gstRate: number; // 5, 12, 18, 28
  featurePool: string[];
}

const DOMAIN_RULES: Record<string, CategoryDomainRule> = {
  fashion_men: {
    brandKeywords: ["Levi's", 'Allen Solly', 'Zara', 'H&M', 'Nike', 'Adidas', 'Puma', 'Wildcraft', 'Zelton'],
    basePriceMin: 599,
    basePriceMax: 4999,
    priceStep: 100,
    hsnList: ['610910', '620342', '620520', '610510', '620190', '610342'],
    gstRate: 12,
    featurePool: [
      '100% Breathable Combed Cotton Fabric',
      'Anti-Shrink & Pre-Washed Finish',
      'Reinforced Double-Stitched Seams',
      'Comfort All-Day Regular Drape',
      'Color-Lock Technology for Long Lasting Fade Resistance',
      'Moisture Wicking Quick Dry Feel',
    ],
  },
  fashion_women: {
    brandKeywords: ['Zara', 'H&M', "Levi's", 'Allen Solly', 'Puma', 'Nike', 'Zelton'],
    basePriceMin: 799,
    basePriceMax: 6999,
    priceStep: 150,
    hsnList: ['620442', '610442', '621142', '610610', '620630', '620452'],
    gstRate: 12,
    featurePool: [
      'Ultra-Soft Premium Viscose & Silk Blend',
      'Elegant Contemporary Silhouette',
      'Wrinkle-Resistant Easy Care Fabric',
      'Lustrous Draped Flow & Flattering Fit',
      'Handcrafted Delicate Detailing',
      'Breathable All-Season Comfort',
    ],
  },
  fashion_kids: {
    brandKeywords: ['H&M', 'Zara', 'Nike', 'Adidas', 'Puma', 'Wildcraft', 'Zelton'],
    basePriceMin: 399,
    basePriceMax: 2999,
    priceStep: 80,
    hsnList: ['611120', '620920', '610990', '620462'],
    gstRate: 5,
    featurePool: [
      'Hypoallergenic Non-Toxic Pure Cotton',
      'Gentle on Delicate Sensitive Skin',
      'Tagless Scratch-Free Neck Label',
      'Durable Play-Proof Reinforced Knees',
      'Elastic Stretch Waist for Easy Movement',
      'Machine Wash Safe & Quick Drying',
    ],
  },
  footwear: {
    brandKeywords: ['Nike', 'Adidas', 'Puma', 'Wildcraft', 'Allen Solly', 'Zelton'],
    basePriceMin: 1299,
    basePriceMax: 11999,
    priceStep: 250,
    hsnList: ['640299', '640391', '640411', '640590', '640319'],
    gstRate: 12,
    featurePool: [
      'Responsive High-Energy Foam Cushioning',
      'High-Traction Anti-Slip Rubber Outsole',
      'Engineered Breathable Mesh Upper',
      'Ergonomic Arch & Heel Support',
      'Ultra Lightweight Shock-Absorbing Midsole',
      'Padded Collar and Tongue for Ankle Stability',
    ],
  },
  smartphones_laptops_tech: {
    brandKeywords: ['Apple', 'Samsung', 'Sony', 'Dell', 'HP', 'Casio', 'LG Electronics', 'Zelton'],
    basePriceMin: 14999,
    basePriceMax: 149999,
    priceStep: 3000,
    hsnList: ['851713', '847130', '847141', '852852', '847330'],
    gstRate: 18,
    featurePool: [
      'Next-Gen High-Performance Processor Chipset',
      'Ultra Retina 120Hz Fluid OLED Display',
      'All-Day Extended Battery Life with Fast Charge',
      'Aerospace-Grade Lightweight Aluminum Enclosure',
      'Advanced Thermal Cooling Vapor Chamber',
      'Wi-Fi 7 & Ultra Fast Low Latency Connectivity',
    ],
  },
  audio_wearables: {
    brandKeywords: ['boAt', 'Sony', 'Bose', 'Apple', 'Samsung', 'Casio', 'Philips', 'Zelton'],
    basePriceMin: 1299,
    basePriceMax: 27999,
    priceStep: 400,
    hsnList: ['851830', '851821', '851762', '910212', '851890'],
    gstRate: 18,
    featurePool: [
      'Hybrid Active Noise Cancellation (ANC)',
      'Custom Tuned Deep Bass Audiophile Drivers',
      'Up to 40 Hours Total Playtime with Fast Charge',
      'IPX7 Water & Sweat Resistant Rating',
      'Spatial Audio with Dynamic Head Tracking',
      'Crystal-Clear AI Quad-Mic for Noise-Free Calls',
    ],
  },
  tv_appliances: {
    brandKeywords: ['Samsung', 'LG Electronics', 'Sony', 'Philips', 'Prestige', 'Zelton'],
    basePriceMin: 12999,
    basePriceMax: 89999,
    priceStep: 2500,
    hsnList: ['852872', '841810', '845011', '841510', '851660'],
    gstRate: 28,
    featurePool: [
      'Quantum 4K HDR10+ Cinematic Visual Engine',
      '5-Star Inverter Power Saving Compressor',
      'Dolby Atmos Multi-Dimensional Surround Sound',
      'AI Smart IoT Connectivity with Mobile Control',
      'Scratch & Rust Resistant Toughened Body',
      '10 Years Comprehensive Motor / Panel Warranty',
    ],
  },
  kitchen_home: {
    brandKeywords: ['Prestige', 'Philips', 'LG Electronics', 'Zelton'],
    basePriceMin: 799,
    basePriceMax: 18999,
    priceStep: 250,
    hsnList: ['732393', '851679', '850940', '821599', '761510'],
    gstRate: 18,
    featurePool: [
      'Food Grade SS304 Rustproof Stainless Steel',
      'Heavy Duty Copper Motor with Overload Protection',
      'Precision Temperature Control & Auto Cut-Off',
      'PFOA-Free Durable Ceramic Non-Stick Coating',
      'Ergonomic Heat-Resistant Cool-Touch Handle',
      'Dishwasher Safe Modular Removable Parts',
    ],
  },
  furniture_decor: {
    brandKeywords: ['Zelton', 'Fossil', 'Wildcraft', 'Prestige'],
    basePriceMin: 2499,
    basePriceMax: 49999,
    priceStep: 1000,
    hsnList: ['940360', '940161', '940429', '940510', '630221'],
    gstRate: 18,
    featurePool: [
      'Seasoned Solid Sheesham Hardwood Construction',
      'High Resilience Memory Foam Cushioning',
      'Termite Resistant & Moisture Sealed Finish',
      'Ergonomic Posture Support Design',
      'Scratch Resistant Satin Lacquer Coat',
      '5 Years Structural Craftsmanship Warranty',
    ],
  },
  beauty_grooming: {
    brandKeywords: ["L'Oreal Paris", 'Nivea', 'Philips', 'Zelton'],
    basePriceMin: 249,
    basePriceMax: 3499,
    priceStep: 100,
    hsnList: ['330499', '330510', '330720', '851010', '330790'],
    gstRate: 18,
    featurePool: [
      'Dermatologically Tested & Cruelty-Free Formula',
      'Deep Hydration with Hyaluronic Acid & Vitamin E',
      'Paraben & Sulphate Free Clean Ingredients',
      'Self-Sharpening Titanium Coated Blades',
      'Lightweight Fast-Absorbing Non-Greasy Texture',
      'Long-Lasting 24-Hour Freshness Lock',
    ],
  },
  health_nutrition: {
    brandKeywords: ['Zelton', 'Nivea', 'Philips', 'Prestige'],
    basePriceMin: 399,
    basePriceMax: 4999,
    priceStep: 150,
    hsnList: ['210690', '300490', '950691', '901890'],
    gstRate: 12,
    featurePool: [
      '100% Pure Certified Organic & Lab Tested',
      'High Bioavailability Fast Absorption Matrix',
      'Zero Added Sugar & No Artificial Preservatives',
      'Enriched with Essential Vitamins & Minerals',
      'GMP & ISO Certified Manufacturing Standard',
      'Micro-Filtered Pure Clean Protein Blend',
    ],
  },
  sports_outdoor: {
    brandKeywords: ['Wildcraft', 'Nike', 'Adidas', 'Puma', 'Casio', 'Zelton'],
    basePriceMin: 899,
    basePriceMax: 14999,
    priceStep: 300,
    hsnList: ['950691', '420212', '630622', '950662'],
    gstRate: 18,
    featurePool: [
      'Heavy Duty Tear-Resistant Ripstop Cordura Fabric',
      'All-Weather Water-Repellent HydroShield Coating',
      'Ergonomic Load-Bearing Lumbar Suspension',
      'Aerospace Grade Lightweight Alloy Frame',
      'Reflective Night-Safety Visibility Accents',
      'High Impact Shock Absorption Buffer',
    ],
  },
  watches_eyewear_jewelry: {
    brandKeywords: ['Ray-Ban', 'Casio', 'Fossil', 'Zelton'],
    basePriceMin: 1499,
    basePriceMax: 24999,
    priceStep: 500,
    hsnList: ['900311', '910211', '711319', '900410'],
    gstRate: 18,
    featurePool: [
      '100% Polarized UV400 Protection Optical Glass',
      'Precision Japanese Quartz Movement Caliber',
      'Corrosion-Resistant Surgical Grade 316L Steel',
      'Scratch-Proof Sapphire Crystal Display Glass',
      'Water Resistant up to 100M Depth Rating',
      'Hand-Polished Lightweight Italian Acetate Frame',
    ],
  },
  groceries_staples: {
    brandKeywords: ['Zelton', 'Prestige'],
    basePriceMin: 149,
    basePriceMax: 1999,
    priceStep: 50,
    hsnList: ['090210', '090121', '100630', '150910', '090411'],
    gstRate: 5,
    featurePool: [
      '100% Farm Fresh Single-Origin Harvest',
      'Zero Pesticides, Chemicals, or Adulterants',
      'Aroma-Lock Nitrogen Flush Vacuum Packaging',
      'Naturally Sun-Dried & Cold-Processed',
      'Rich in Natural Antioxidants & Nutrients',
      'Certified FSSAI & Organic Compliant',
    ],
  },
  default_general: {
    brandKeywords: ['Zelton', 'Philips', 'Sony', 'Samsung', 'Wildcraft', 'Casio'],
    basePriceMin: 699,
    basePriceMax: 8999,
    priceStep: 200,
    hsnList: ['854370', '950450', '820559', '920290', '842482'],
    gstRate: 18,
    featurePool: [
      'High Durability Professional Build Quality',
      'Precision Engineered for Daily Dependability',
      'Energy Efficient Multi-Mode Operation',
      'Ergonomic User-Friendly Controls',
      'Comprehensive 1 Year Manufacturer Warranty',
      'Tested to Strict International Safety Standards',
    ],
  },
};

const NO_ATTR_EDITIONS = [
  'Standard Edition',
  'Pro Performance Edition',
  'Premium Collector Bundle',
  'Deluxe Starter Pack',
  'Value Multi-Pack',
  'Family Size Set',
  'Compact Travel Edition',
  'Ultra Titanium Edition',
  'Essential Care Kit',
  'Special Anniversary Pack',
  'Executive Master Edition',
  'Apex Limited Edition',
];

const PRODUCT_ADJECTIVES = [
  'Signature',
  'Pro Ultra',
  'Apex Series',
  'Classic Heritage',
  'Elite Max',
  'Vanguard',
  'Studio Master',
  'Prime Luxe',
  'Titanium Force',
  'EcoComfort',
  'HyperVelocity',
  'Matrix Wave',
  'NeoCore',
  'AeroLite',
  'Stealth Shadow',
  'Urban Nomad',
  'Precision Craft',
  'InfiniTech',
  'Dynamic Edge',
  'Nordic Minimal',
];

function getDomainRuleForParent(parentName: string): CategoryDomainRule {
  const p = parentName.toLowerCase();
  if (p.includes("men's fashion")) return DOMAIN_RULES.fashion_men;
  if (p.includes("women's fashion")) return DOMAIN_RULES.fashion_women;
  if (p.includes('kids') || p.includes('baby')) return DOMAIN_RULES.fashion_kids;
  if (p.includes('footwear') || p.includes('shoes')) return DOMAIN_RULES.footwear;
  if (p.includes('smartphone') || p.includes('laptop') || p.includes('computer')) return DOMAIN_RULES.smartphones_laptops_tech;
  if (p.includes('audio') || p.includes('headphone') || p.includes('wearable') || p.includes('watch')) return DOMAIN_RULES.audio_wearables;
  if (p.includes('television') || p.includes('home theater') || p.includes('appliances')) return DOMAIN_RULES.tv_appliances;
  if (p.includes('kitchen') || p.includes('dining') || p.includes('cookware')) return DOMAIN_RULES.kitchen_home;
  if (p.includes('furniture') || p.includes('bedroom') || p.includes('decor') || p.includes('mattress')) return DOMAIN_RULES.furniture_decor;
  if (p.includes('beauty') || p.includes('cosmetic') || p.includes('grooming') || p.includes('skin') || p.includes('hair')) return DOMAIN_RULES.beauty_grooming;
  if (p.includes('health') || p.includes('nutrition') || p.includes('wellness')) return DOMAIN_RULES.health_nutrition;
  if (p.includes('sports') || p.includes('gym') || p.includes('outdoor') || p.includes('luggage') || p.includes('bag')) return DOMAIN_RULES.sports_outdoor;
  if (p.includes('jewelry') || p.includes('eyewear') || p.includes('sunglasses')) return DOMAIN_RULES.watches_eyewear_jewelry;
  if (p.includes('grocer') || p.includes('staple') || p.includes('beverage') || p.includes('tea') || p.includes('coffee')) return DOMAIN_RULES.groceries_staples;
  return DOMAIN_RULES.default_general;
}

// -------------------------------------------------------------
// MAIN SEEDER FUNCTION
// -------------------------------------------------------------
async function seedAllProducts() {
  const dbConfig = getDbConfig();
  console.log(`\n======================================================`);
  console.log(`🚀 Starting Comprehensive Subcategory Product & Variant Seeder`);
  console.log(`Target: 7 Products per Subcategory across all subcategories (50% reduced)`);
  console.log(`Variants: 6 Variants per Product matching subcategory attributes`);
  console.log(`Database: "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}`);
  console.log(`======================================================\n`);

  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    multipleStatements: true,
  });

  const startTime = Date.now();

  try {
    // -------------------------------------------------------------
    // STEP 1: Sync all expanded attribute values into DB
    // -------------------------------------------------------------
    console.log('1. Ensuring all expanded attribute values exist in database...');
    const [existingAttrs]: any = await connection.execute('SELECT id, name FROM `attributes`');
    const attrNameToIdMap = new Map<string, number>();
    for (const a of existingAttrs) {
      attrNameToIdMap.set(a.name, Number(a.id));
    }

    const attrValInsertList: any[] = [];
    for (const attr of attributesSeedData) {
      const attrId = attrNameToIdMap.get(attr.name);
      if (!attrId) continue;
      for (const val of attr.values) {
        attrValInsertList.push([val.value, val.description || '', attrId, 1]);
      }
    }

    if (attrValInsertList.length > 0) {
      const placeholders = attrValInsertList.map(() => '(?, ?, ?, ?)').join(', ');
      const flatVals = attrValInsertList.flat();
      const insertSql = `
        INSERT INTO \`attribute_values\` (\`value\`, \`description\`, \`attribute_id\`, \`status\`)
        VALUES ${placeholders}
        ON DUPLICATE KEY UPDATE \`description\` = VALUES(\`description\`), \`status\` = 1
      `;
      await connection.query(insertSql, flatVals);
    }

    // Load full attributes and attribute values map
    const [allAttrValRows]: any = await connection.execute(
      'SELECT av.id, av.value, av.attribute_id, a.name as attr_name FROM `attribute_values` av JOIN `attributes` a ON av.attribute_id = a.id WHERE av.status = 1 ORDER BY av.id ASC'
    );
    const attrValuesByAttrId = new Map<number, { id: number; value: string; attrName: string }[]>();
    for (const r of allAttrValRows) {
      const aId = Number(r.attribute_id);
      if (!attrValuesByAttrId.has(aId)) attrValuesByAttrId.set(aId, []);
      attrValuesByAttrId.get(aId)!.push({ id: Number(r.id), value: r.value, attrName: r.attr_name });
    }
    console.log(`✓ Synchronized ${allAttrValRows.length} attribute values across ${attrNameToIdMap.size} attributes.\n`);

    // -------------------------------------------------------------
    // STEP 2: Load Brands, Parent Categories, Subcategories & CatAttrs
    // -------------------------------------------------------------
    console.log('2. Loading catalog structure (Brands, Categories, Category Attributes)...');
    const [brandRows]: any = await connection.execute('SELECT id, name FROM `brands` WHERE `status` = 1 ORDER BY id ASC');
    const brandsList: { id: number; name: string }[] = brandRows.map((b: any) => ({ id: Number(b.id), name: b.name }));
    const brandMapByName = new Map<string, number>();
    for (const b of brandsList) brandMapByName.set(b.name.toLowerCase(), b.id);

    const [parentRows]: any = await connection.execute('SELECT id, name FROM `categories` WHERE `parent_id` IS NULL ORDER BY id ASC');
    const parentMap = new Map<number, string>();
    for (const p of parentRows) parentMap.set(Number(p.id), p.name);

    const [subcatRows]: any = await connection.execute('SELECT id, name, parent_id FROM `categories` WHERE `parent_id` IS NOT NULL ORDER BY id ASC');
    const subcategories: { id: number; name: string; parentId: number; parentName: string }[] = subcatRows.map((s: any) => ({
      id: Number(s.id),
      name: s.name,
      parentId: Number(s.parentId),
      parentName: parentMap.get(Number(s.parentId)) || 'General',
    }));

    const [catAttrRows]: any = await connection.execute('SELECT category_id, attribute_id, has_images, is_primary FROM `category_attributes`');
    const catAttrsBySubId = new Map<number, { attributeId: number; hasImages: boolean; isPrimary: boolean }[]>();
    for (const ca of catAttrRows) {
      const sId = Number(ca.category_id);
      if (!catAttrsBySubId.has(sId)) catAttrsBySubId.set(sId, []);
      catAttrsBySubId.get(sId)!.push({
        attributeId: Number(ca.attribute_id),
        hasImages: Boolean(ca.has_images),
        isPrimary: Boolean(ca.is_primary),
      });
    }

    console.log(`✓ Loaded: ${brandsList.length} Brands | ${parentRows.length} Parent Categories | ${subcategories.length} Subcategories.\n`);

    // -------------------------------------------------------------
    // STEP 3: Clear Existing Product Tables Safely
    // -------------------------------------------------------------
    console.log('3. Safely clearing existing product & variant data for fresh seeding...');
    await connection.query(`
      SET FOREIGN_KEY_CHECKS = 0;
      DELETE FROM \`order_items\`;
      DELETE FROM \`carts\`;
      DELETE FROM \`likes\`;
      DELETE FROM \`reviews\`;
      DELETE FROM \`inventory_transactions\`;
      DELETE FROM \`variant_attribute_values\`;
      DELETE FROM \`item_attributes\`;
      DELETE FROM \`product_attribute_values\`;
      DELETE FROM \`variants\`;
      DELETE FROM \`products\`;
      SET FOREIGN_KEY_CHECKS = 1;
    `);
    console.log('✓ Cleared products, variants, and dependent pivot tables.\n');

    // -------------------------------------------------------------
    // STEP 4: Generate All Products, Variants & Pivot Records In-Memory
    // -------------------------------------------------------------
    console.log('4. Generating 15 realistic products and 10-12 variants per subcategory in memory...');

    const productsBatch: any[] = [];
    const variantsBatch: any[] = [];
    const itemAttributesBatch: any[] = [];
    const productAttributeValuesBatch: any[] = [];
    const variantAttributeValuesBatch: any[] = [];

    let currentProductId = 1;
    let currentVariantId = 1;

    const stats = {
      totalProducts: 0,
      totalVariants: 0,
      twoAttrVariants: 0,
      oneAttrVariants: 0,
      noAttrVariants: 0,
    };

    const PRODUCTS_PER_SUBCAT = 7;

    for (let sIdx = 0; sIdx < subcategories.length; sIdx++) {
      const sub = subcategories[sIdx];
      const domainRule = getDomainRuleForParent(sub.parentName);
      const subCatAttrs = catAttrsBySubId.get(sub.id) || [];

      // Determine brand candidates for this subcategory
      const domainBrandIds: number[] = [];
      for (const bKeyword of domainRule.brandKeywords) {
        const matched = brandsList.find((b) => b.name.toLowerCase().includes(bKeyword.toLowerCase()));
        if (matched) domainBrandIds.push(matched.id);
      }
      if (domainBrandIds.length === 0) {
        domainBrandIds.push(brandsList[0].id); // Zelton flagship default
      }

      for (let pIdx = 0; pIdx < PRODUCTS_PER_SUBCAT; pIdx++) {
        const productId = currentProductId++;
        stats.totalProducts++;

        // Select Brand
        const brandId = domainBrandIds[(sIdx + pIdx) % domainBrandIds.length];
        const brandObj = brandsList.find((b) => b.id === brandId) || brandsList[0];

        // Generate Unique Product Name
        const adjective = PRODUCT_ADJECTIVES[(sIdx * 7 + pIdx * 3) % PRODUCT_ADJECTIVES.length];
        const featureHighlight = domainRule.featurePool[(sIdx + pIdx) % domainRule.featurePool.length];
        const prodName = `${brandObj.name} ${adjective} ${sub.name} - ${featureHighlight.split(' ')[0]} Edition`;

        // Calculate Pricing & Tax
        const priceSpread = domainRule.basePriceMax - domainRule.basePriceMin;
        const baseSP = domainRule.basePriceMin + ((sIdx * 73 + pIdx * 137) % priceSpread);
        const roundedSP = Math.round(baseSP / 10) * 10;
        const mrpMarkup = 1.2 + ((sIdx + pIdx * 3) % 25) / 100;
        const prodMRP = Math.round((roundedSP * mrpMarkup) / 10) * 10 - 1;
        const prodBP = Math.round(roundedSP * 0.68 * 100) / 100;

        // GST & HSN calculation
        let effGstRate = domainRule.gstRate;
        if (domainRule.gstRate === 12 && roundedSP < 1000) {
          effGstRate = 5; // Apparel / Footwear under 1000 is 5%
        }
        const hsnCode = domainRule.hsnList[(sIdx + pIdx) % domainRule.hsnList.length];
        const halfGst = (effGstRate / 2).toFixed(2);
        const fullGst = effGstRate.toFixed(2);

        // Rich Descriptions & JSON specs
        const itemCode = `PRD-S${String(sub.id).padStart(4, '0')}-P${String(pIdx + 1).padStart(2, '0')}`;
        const prodDesc = `
          <div class="product-description">
            <p><strong>${prodName}</strong> by <strong>${brandObj.name}</strong> delivers superior quality and craftsmanship in <em>${sub.name}</em>.</p>
            <h3>Highlights:</h3>
            <ul>
              <li><strong>Manufacturer:</strong> ${brandObj.name} Official</li>
              <li><strong>Category:</strong> ${sub.parentName} &gt; ${sub.name}</li>
              <li><strong>Key Attribute:</strong> ${featureHighlight}</li>
              <li><strong>HSN:</strong> ${hsnCode} (GST ${effGstRate}%)</li>
            </ul>
            <p>Backed by official 1-year brand warranty and rapid express shipping.</p>
          </div>
        `.trim();

        const featureList = [
          featureHighlight,
          domainRule.featurePool[(sIdx + pIdx + 1) % domainRule.featurePool.length],
          domainRule.featurePool[(sIdx + pIdx + 2) % domainRule.featurePool.length],
          'Official Brand Authenticity Guarantee',
          'Certified Quality & Rigorous Durability Tested',
        ];

        const detailList = {
          Brand: brandObj.name,
          Category: sub.parentName,
          Subcategory: sub.name,
          HSN_Code: hsnCode,
          GST_Rate: `${effGstRate}%`,
          Item_Code: itemCode,
          Country_Of_Origin: 'India',
          Warranty: '1 Year Manufacturer Warranty',
          Care_Instructions: 'Handle with care. Refer to user handbook.',
        };

        const subSlug = sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
        const mainImgUrl = `/storage/products/${subSlug}_p${pIdx + 1}_main.png`;
        const imgList = [
          `/storage/products/${subSlug}_p${pIdx + 1}_1.png`,
          `/storage/products/${subSlug}_p${pIdx + 1}_2.png`,
          `/storage/products/${subSlug}_p${pIdx + 1}_3.png`,
        ];

        const isNewArrival = pIdx % 4 === 0 ? 1 : 0;

        // Push product record
        productsBatch.push([
          productId,
          prodName,
          prodDesc,
          itemCode,
          sub.id,
          brandId,
          1, // status = true
          JSON.stringify(featureList),
          JSON.stringify(detailList),
          mainImgUrl,
          JSON.stringify(imgList),
          isNewArrival,
          hsnCode,
          halfGst, // cgst
          halfGst, // sgst
          fullGst, // igst
        ]);

        // ---------------------------------------------------------
        // Generate Variants based on Subcategory Attributes
        // ---------------------------------------------------------
        if (subCatAttrs.length >= 2) {
          // CASE 1: 2 Attributes (e.g. Color & Size) -> 2 x 3 = 6 variants!
          const [attr1Config, attr2Config] = subCatAttrs;
          const attr1Vals = attrValuesByAttrId.get(attr1Config.attributeId) || [];
          const attr2Vals = attrValuesByAttrId.get(attr2Config.attributeId) || [];

          // Pick 2 distinct values for attr1 and 3 distinct values for attr2 (2 * 3 = 6 variants)
          const pickedAttr1: typeof attr1Vals = [];
          const pickedAttr2: typeof attr2Vals = [];

          const numVals1 = Math.min(2, attr1Vals.length);
          const numVals2 = Math.min(3, attr2Vals.length);

          for (let i = 0; i < numVals1; i++) {
            pickedAttr1.push(attr1Vals[(sIdx + pIdx + i) % attr1Vals.length]);
          }
          for (let j = 0; j < numVals2; j++) {
            pickedAttr2.push(attr2Vals[(sIdx * 2 + pIdx + j) % attr2Vals.length]);
          }

          // Item Attributes pivot
          itemAttributesBatch.push([productId, attr1Config.attributeId, attr1Config.hasImages ? 1 : 0, attr1Config.isPrimary ? 1 : 0]);
          itemAttributesBatch.push([productId, attr2Config.attributeId, attr2Config.hasImages ? 1 : 0, attr2Config.isPrimary ? 1 : 0]);

          // Product Attribute Values pivot
          for (const v1 of pickedAttr1) {
            productAttributeValuesBatch.push([productId, attr1Config.attributeId, v1.id]);
          }
          for (const v2 of pickedAttr2) {
            productAttributeValuesBatch.push([productId, attr2Config.attributeId, v2.id]);
          }

          let varIdx = 0;
          for (const v1 of pickedAttr1) {
            for (const v2 of pickedAttr2) {
              const variantId = currentVariantId++;
              varIdx++;
              stats.totalVariants++;
              stats.twoAttrVariants++;

              const varTitle = `${v1.value} / ${v2.value}`;
              const varSku = `SKU-S${sub.id}-P${pIdx + 1}-V${varIdx}`;
              const varSp = roundedSP + (varIdx * domainRule.priceStep);
              const varMrp = Math.round((varSp * mrpMarkup) / 10) * 10 - 1;
              const varBp = Math.round(varSp * 0.68 * 100) / 100;
              const stock = 20 + ((sIdx * 11 + pIdx * 17 + varIdx * 23) % 110);
              const shipping = varIdx % 3 === 0 ? '0.00' : '49.00';
              const returnWindow = varIdx % 2 === 0 ? 7 : 10;
              const varImg = `/storage/products/variants/${subSlug}_p${pIdx + 1}_v${varIdx}.png`;

              variantsBatch.push([
                variantId,
                varTitle,
                varSku,
                varMrp.toFixed(2),
                varSp.toFixed(2),
                varBp.toFixed(2),
                stock,
                varImg,
                JSON.stringify([varImg]),
                productId,
                1, // isCodAllowed
                1, // isReturnable
                returnWindow,
                shipping,
                1, // status
              ]);

              variantAttributeValuesBatch.push([variantId, v1.id]);
              variantAttributeValuesBatch.push([variantId, v2.id]);
            }
          }
        } else if (subCatAttrs.length === 1) {
          // CASE 2: 1 Attribute (e.g. Color only or Size only) -> 6 variants!
          const [attr1Config] = subCatAttrs;
          const attr1Vals = attrValuesByAttrId.get(attr1Config.attributeId) || [];

          // Pick 6 distinct values
          const numVals = Math.min(6, attr1Vals.length);
          const pickedAttr1: typeof attr1Vals = [];
          for (let i = 0; i < numVals; i++) {
            pickedAttr1.push(attr1Vals[(sIdx + pIdx + i) % attr1Vals.length]);
          }

          // Item Attributes pivot
          itemAttributesBatch.push([productId, attr1Config.attributeId, attr1Config.hasImages ? 1 : 0, attr1Config.isPrimary ? 1 : 0]);

          // Product Attribute Values pivot
          for (const v1 of pickedAttr1) {
            productAttributeValuesBatch.push([productId, attr1Config.attributeId, v1.id]);
          }

          let varIdx = 0;
          for (const v1 of pickedAttr1) {
            const variantId = currentVariantId++;
            varIdx++;
            stats.totalVariants++;
            stats.oneAttrVariants++;

            const varTitle = v1.value;
            const varSku = `SKU-S${sub.id}-P${pIdx + 1}-V${varIdx}`;
            const varSp = roundedSP + (varIdx * domainRule.priceStep);
            const varMrp = Math.round((varSp * mrpMarkup) / 10) * 10 - 1;
            const varBp = Math.round(varSp * 0.68 * 100) / 100;
            const stock = 25 + ((sIdx * 13 + pIdx * 19 + varIdx * 29) % 100);
            const shipping = varIdx % 4 === 0 ? '0.00' : '49.00';
            const returnWindow = 7;
            const varImg = `/storage/products/variants/${subSlug}_p${pIdx + 1}_v${varIdx}.png`;

            variantsBatch.push([
              variantId,
              varTitle,
              varSku,
              varMrp.toFixed(2),
              varSp.toFixed(2),
              varBp.toFixed(2),
              stock,
              varImg,
              JSON.stringify([varImg]),
              productId,
              1, // isCodAllowed
              1, // isReturnable
              returnWindow,
              shipping,
              1, // status
            ]);

            variantAttributeValuesBatch.push([variantId, v1.id]);
          }
        } else {
          // CASE 3: 0 Attributes (Type 0) -> 6 Edition / Bundle Variants!
          let varIdx = 0;
          for (let i = 0; i < 6; i++) {
            const variantId = currentVariantId++;
            varIdx++;
            stats.totalVariants++;
            stats.noAttrVariants++;

            const varTitle = NO_ATTR_EDITIONS[i % NO_ATTR_EDITIONS.length];
            const varSku = `SKU-S${sub.id}-P${pIdx + 1}-V${varIdx}`;
            const varSp = roundedSP + (varIdx * domainRule.priceStep);
            const varMrp = Math.round((varSp * mrpMarkup) / 10) * 10 - 1;
            const varBp = Math.round(varSp * 0.68 * 100) / 100;
            const stock = 30 + ((sIdx * 9 + pIdx * 23 + varIdx * 31) % 90);
            const shipping = varIdx % 3 === 0 ? '0.00' : '50.00';
            const returnWindow = 7;
            const varImg = `/storage/products/variants/${subSlug}_p${pIdx + 1}_v${varIdx}.png`;

            variantsBatch.push([
              variantId,
              varTitle,
              varSku,
              varMrp.toFixed(2),
              varSp.toFixed(2),
              varBp.toFixed(2),
              stock,
              varImg,
              JSON.stringify([varImg]),
              productId,
              1, // isCodAllowed
              1, // isReturnable
              returnWindow,
              shipping,
              1, // status
            ]);
          }
        }
      }
    }

    console.log(`✓ Memory generation complete:`);
    console.log(`  - Products generated: ${productsBatch.length}`);
    console.log(`  - Variants generated: ${variantsBatch.length}`);
    console.log(`  - Item Attributes pivot rows: ${itemAttributesBatch.length}`);
    console.log(`  - Product Attribute Values pivot rows: ${productAttributeValuesBatch.length}`);
    console.log(`  - Variant Attribute Values pivot rows: ${variantAttributeValuesBatch.length}\n`);

    // -------------------------------------------------------------
    // STEP 5: High-Speed Batch Inserting into MySQL
    // -------------------------------------------------------------
    console.log('5. Performing high-speed chunked batch inserts into MySQL...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

    // Helper for chunked multi-row insert
    const insertInChunks = async (tableName: string, columns: string[], rows: any[][], chunkSize = 3000) => {
      const colSql = columns.map((c) => `\`${c}\``).join(', ');
      const singleRowPlaceholder = `(${columns.map(() => '?').join(', ')})`;

      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const placeholders = chunk.map(() => singleRowPlaceholder).join(', ');
        const flatValues = chunk.flat();
        const sql = `INSERT INTO \`${tableName}\` (${colSql}) VALUES ${placeholders}`;
        await connection.query(sql, flatValues);
      }
    };

    console.log(`  Inserting ${productsBatch.length} Products...`);
    await insertInChunks(
      'products',
      [
        'id',
        'name',
        'description',
        'item_code',
        'category_id',
        'brand_id',
        'status',
        'feature_json',
        'detail_json',
        'image_url',
        'image_json',
        'is_new_arrival',
        'hsn',
        'cgst',
        'sgst',
        'igst',
      ],
      productsBatch,
      2500
    );

    console.log(`  Inserting ${itemAttributesBatch.length} Item Attributes...`);
    if (itemAttributesBatch.length > 0) {
      await insertInChunks(
        'item_attributes',
        ['product_id', 'attribute_id', 'has_images', 'is_primary'],
        itemAttributesBatch,
        5000
      );
    }

    console.log(`  Inserting ${productAttributeValuesBatch.length} Product Attribute Values...`);
    if (productAttributeValuesBatch.length > 0) {
      await insertInChunks(
        'product_attribute_values',
        ['product_id', 'attribute_id', 'attribute_value_id'],
        productAttributeValuesBatch,
        5000
      );
    }

    console.log(`  Inserting ${variantsBatch.length} Variants...`);
    await insertInChunks(
      'variants',
      [
        'id',
        'title',
        'sku',
        'mrp',
        'sp',
        'bp',
        'stock',
        'image_url',
        'image_json',
        'product_id',
        'is_cod_allowed',
        'is_returnable',
        'return_window_days',
        'shipping_charges',
        'status',
      ],
      variantsBatch,
      3000
    );

    console.log(`  Inserting ${variantAttributeValuesBatch.length} Variant Attribute Values...`);
    if (variantAttributeValuesBatch.length > 0) {
      await insertInChunks(
        'variant_attribute_values',
        ['variant_id', 'attribute_value_id'],
        variantAttributeValuesBatch,
        5000
      );
    }

    // Advance auto-increment counters past the seeded values
    await connection.query(`ALTER TABLE \`products\` AUTO_INCREMENT = ${currentProductId + 1000};`);
    await connection.query(`ALTER TABLE \`variants\` AUTO_INCREMENT = ${currentVariantId + 1000};`);
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);

    // -------------------------------------------------------------
    // FINAL SUMMARY & VERIFICATION
    // -------------------------------------------------------------
    const [finalProds]: any = await connection.execute('SELECT COUNT(*) as count FROM `products`');
    const [finalVars]: any = await connection.execute('SELECT COUNT(*) as count FROM `variants`');
    const [finalSubCount]: any = await connection.execute('SELECT COUNT(DISTINCT category_id) as count FROM `products`');
    const [finalItemAttrs]: any = await connection.execute('SELECT COUNT(*) as count FROM `item_attributes`');
    const [finalPav]: any = await connection.execute('SELECT COUNT(*) as count FROM `product_attribute_values`');
    const [finalVav]: any = await connection.execute('SELECT COUNT(*) as count FROM `variant_attribute_values`');

    console.log(`\n======================================================`);
    console.log(`🎉 ALL PRODUCTS & VARIANTS SEEDED SUCCESSFULLY!`);
    console.log(`⏱ Total Execution Time: ${durationSeconds} seconds`);
    console.log(`======================================================`);
    console.table([
      { Entity: 'Parent Categories Active', Count: parentRows.length },
      { Entity: 'Subcategories Seeded', Count: finalSubCount[0].count },
      { Entity: 'Total Products Seeded', Count: finalProds[0].count },
      { Entity: 'Total Variants Seeded', Count: finalVars[0].count },
      { Entity: 'Item Attributes Pivot', Count: finalItemAttrs[0].count },
      { Entity: 'Product Attribute Values Pivot', Count: finalPav[0].count },
      { Entity: 'Variant Attribute Values Pivot', Count: finalVav[0].count },
    ]);

    console.log(`\n--- Variant Breakdown By Attribute Patterns ---`);
    console.table([
      { Type: '2 Attributes (3x4 = 12 variants/product)', Count: stats.twoAttrVariants },
      { Type: '1 Attribute (11 variants/product)', Count: stats.oneAttrVariants },
      { Type: '0 Attributes (11 editions/product)', Count: stats.noAttrVariants },
    ]);
    console.log(`======================================================\n`);
  } catch (err: any) {
    console.error(`❌ Error during product seeding:`, err);
    throw err;
  } finally {
    await connection.end();
  }
}

seedAllProducts().catch((err) => {
  console.error('Product seeding process exited with error:', err);
  process.exit(1);
});
