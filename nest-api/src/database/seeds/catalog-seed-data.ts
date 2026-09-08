export interface SeedBrand {
  name: string;
  description: string;
  image1?: string;
  description1?: string;
  image2?: string;
  description2?: string;
  image3?: string;
  description3?: string;
  status?: boolean;
}

export interface SeedAttribute {
  name: string;
  description: string;
  values: { value: string; description?: string }[];
}

export interface SeedSubcategoryAttributeConfig {
  attributeName: string;
  hasImages: boolean;
  isPrimary: boolean;
}

export interface SeedCategoryDefinition {
  name: string;
  description: string;
  image?: string;
  secondaryImage?: string;
  link?: string;
  domainAttributes: [string, string];
  subcategories: string[];
}

export const brandsSeedData: SeedBrand[] = [
  {
    name: 'Zelton',
    description: '<p><strong>Zelton</strong> is our premier lifestyle and technology flagship brand, dedicated to delivering superior quality, precision engineering, and cutting-edge design across modern fashion, gadgets, and home essentials.</p>',
    image1: '/storage/brands/zelton_brand_1.png',
    description1: 'Official Zelton Flagship Store',
    status: true,
  },
  {
    name: 'Apple',
    description: '<p><strong>Apple Inc.</strong> designs and manufactures state-of-the-art smartphones, personal computers, tablets, wearables, and accessories with an unparalleled ecosystem experience.</p>',
    image1: '/storage/brands/apple_brand.png',
    description1: 'Think Different - Apple Authorized Experience',
    status: true,
  },
  {
    name: 'Samsung',
    description: '<p><strong>Samsung</strong> is a global leader in innovative consumer electronics, high-definition displays, smartphones, and next-generation home appliances.</p>',
    image1: '/storage/brands/samsung_brand.png',
    description1: 'Inspire the World, Create the Future',
    status: true,
  },
  {
    name: 'Sony',
    description: '<p><strong>Sony</strong> delivers world-class audio, gaming systems, cinema-grade cameras, and immersive 4K OLED entertainment solutions.</p>',
    image1: '/storage/brands/sony_brand.png',
    description1: 'Be Moved - Premium Audio, Video & Gaming',
    status: true,
  },
  {
    name: 'Nike',
    description: '<p><strong>Nike</strong> inspires athletes worldwide with groundbreaking sportswear, high-performance running shoes, athletic apparel, and training gear.</p>',
    image1: '/storage/brands/nike_brand.png',
    description1: 'Just Do It - Performance Footwear & Apparel',
    status: true,
  },
  {
    name: 'Adidas',
    description: '<p><strong>Adidas</strong> combines performance athletic engineering and iconic street fashion in sports footwear, jerseys, and active lifestyle apparel.</p>',
    image1: '/storage/brands/adidas_brand.png',
    description1: 'Impossible is Nothing',
    status: true,
  },
  {
    name: 'Puma',
    description: '<p><strong>Puma</strong> is one of the world’s leading sports brands, designing, developing, and marketing athletic footwear, apparel, and lifestyle accessories.</p>',
    image1: '/storage/brands/puma_brand.png',
    description1: 'Forever Faster',
    status: true,
  },
  {
    name: "Levi's",
    description: '<p><strong>Levi Strauss & Co.</strong> is the worldwide pioneer in authentic denim jeans, casual wear, rugged jackets, and timeless American apparel.</p>',
    image1: '/storage/brands/levis_brand.png',
    description1: 'Quality Never Goes Out of Style',
    status: true,
  },
  {
    name: 'boAt',
    description: '<p><strong>boAt</strong> is India’s top audio and wearables lifestyle brand, offering high-bass earphones, Bluetooth headphones, smartwatches, and party speakers.</p>',
    image1: '/storage/brands/boat_brand.png',
    description1: 'Plug Into Nirvana',
    status: true,
  },
  {
    name: 'Philips',
    description: '<p><strong>Philips</strong> delivers innovative health technology, personal grooming trimmers, air fryers, kitchen appliances, and smart LED lighting solutions.</p>',
    image1: '/storage/brands/philips_brand.png',
    description1: 'Innovation and You',
    status: true,
  },
  {
    name: 'LG Electronics',
    description: '<p><strong>LG</strong> pioneers smart home appliances, OLED displays, dual inverter air conditioners, washing machines, and premium refrigerators.</p>',
    image1: '/storage/brands/lg_brand.png',
    description1: "Life's Good with LG",
    status: true,
  },
  {
    name: 'Dell',
    description: '<p><strong>Dell Technologies</strong> creates high-performance laptops, gaming desktops (Alienware), commercial workstations, and precision monitors.</p>',
    image1: '/storage/brands/dell_brand.png',
    description1: 'The Power to Do More',
    status: true,
  },
  {
    name: 'HP',
    description: '<p><strong>HP</strong> delivers reliable laptops, convertible 2-in-1s, laser printers, monitors, and gaming rigs designed for work and creativity.</p>',
    image1: '/storage/brands/hp_brand.png',
    description1: 'Keep Reinventing',
    status: true,
  },
];

export const attributesSeedData: SeedAttribute[] = [
  {
    name: 'Color',
    description: 'Product colorway / shade',
    values: [
      { value: 'Midnight Black', description: 'Deep matte black' },
      { value: 'Arctic White', description: 'Pure clean white' },
      { value: 'Navy Blue', description: 'Classic dark blue' },
      { value: 'Space Gray', description: 'Metallic space gray' },
      { value: 'Crimson Red', description: 'Vibrant crimson red' },
      { value: 'Olive Green', description: 'Muted army olive green' },
      { value: 'Rose Gold', description: 'Sleek luxury rose gold' },
      { value: 'Charcoal Grey', description: 'Dark smokey grey' },
      { value: 'Mustard Yellow', description: 'Rich warm mustard' },
      { value: 'Royal Blue', description: 'Deep royal blue' },
    ],
  },
  {
    name: 'Clothing Size',
    description: 'Standard apparel size',
    values: [
      { value: 'XS', description: 'Extra Small' },
      { value: 'S', description: 'Small' },
      { value: 'M', description: 'Medium' },
      { value: 'L', description: 'Large' },
      { value: 'XL', description: 'Extra Large' },
      { value: '2XL', description: 'Double Extra Large' },
      { value: 'Free Size', description: 'One size fits most' },
    ],
  },
  {
    name: 'Footwear Size',
    description: 'UK / Indian shoe sizing',
    values: [
      { value: 'UK 6', description: 'Foot length ~25 cm' },
      { value: 'UK 7', description: 'Foot length ~26 cm' },
      { value: 'UK 8', description: 'Foot length ~27 cm' },
      { value: 'UK 9', description: 'Foot length ~28 cm' },
      { value: 'UK 10', description: 'Foot length ~29 cm' },
      { value: 'UK 11', description: 'Foot length ~30 cm' },
    ],
  },
  {
    name: 'Kids Age & Size',
    description: 'Infant & child age groupings',
    values: [
      { value: '0-3 Months', description: 'Newborn 0-3M' },
      { value: '6-12 Months', description: 'Infant 6-12M' },
      { value: '1-2 Years', description: 'Toddler 1-2Y' },
      { value: '3-4 Years', description: 'Preschool 3-4Y' },
      { value: '6-8 Years', description: 'Child 6-8Y' },
      { value: '10-12 Years', description: 'Junior 10-12Y' },
    ],
  },
  {
    name: 'Storage Capacity',
    description: 'Digital storage space',
    values: [
      { value: '64 GB', description: '64 Gigabytes' },
      { value: '128 GB', description: '128 Gigabytes' },
      { value: '256 GB', description: '256 Gigabytes' },
      { value: '512 GB', description: '512 Gigabytes' },
      { value: '1 TB', description: '1 Terabyte' },
      { value: '2 TB', description: '2 Terabytes' },
    ],
  },
  {
    name: 'RAM Memory',
    description: 'Random access memory configuration',
    values: [
      { value: '8 GB RAM', description: '8GB High speed memory' },
      { value: '12 GB RAM', description: '12GB High speed memory' },
      { value: '16 GB RAM', description: '16GB High speed memory' },
      { value: '24 GB RAM', description: '24GB Unified memory' },
      { value: '32 GB RAM', description: '32GB Dual Channel memory' },
      { value: '64 GB RAM', description: '64GB Professional memory' },
    ],
  },
  {
    name: 'Material',
    description: 'Primary fabric or build material',
    values: [
      { value: '100% Pure Cotton', description: 'Natural breathable cotton' },
      { value: 'Pure Genuine Leather', description: 'Full grain authentic leather' },
      { value: 'Denim Cotton', description: 'Durable twill denim' },
      { value: 'Stainless Steel', description: 'Food grade rustproof steel' },
      { value: 'Solid Sheesham Wood', description: 'Premium Indian rosewood' },
      { value: 'Engineered Wood', description: 'High density moisture resistant' },
      { value: 'Pure Silk', description: 'Lustrous mulberry silk' },
      { value: 'Aerospace Aluminium', description: 'Lightweight high tensile metal' },
    ],
  },
  {
    name: 'Volume & Capacity',
    description: 'Liquid or volumetric measure',
    values: [
      { value: '100 ml', description: 'Travel size' },
      { value: '250 ml', description: 'Medium container' },
      { value: '500 ml', description: 'Half liter' },
      { value: '1 Litre', description: '1L Family size' },
      { value: '2 Litres', description: '2L Large volume' },
      { value: '5 Litres', description: '5L Bulk container' },
    ],
  },
  {
    name: 'Screen Size',
    description: 'Display diagonal dimension',
    values: [
      { value: '6.1 Inch', description: 'Compact smartphone display' },
      { value: '6.7 Inch', description: 'Large smartphone display' },
      { value: '10.9 Inch', description: 'Tablet screen' },
      { value: '14.0 Inch', description: 'Standard business laptop' },
      { value: '15.6 Inch', description: 'Standard desktop replacement' },
      { value: '27 Inch', description: 'QHD Creator / Gaming monitor' },
      { value: '43 Inch', description: '4K Living room TV' },
      { value: '55 Inch', description: '4K Home theater display' },
    ],
  },
  {
    name: 'Warranty Duration',
    description: 'Manufacturer warranty coverage',
    values: [
      { value: '6 Months Warranty', description: 'Half year standard warranty' },
      { value: '1 Year Warranty', description: '12 months full warranty' },
      { value: '2 Years Warranty', description: '24 months extended coverage' },
      { value: '3 Years Warranty', description: '36 months comprehensive support' },
      { value: '5 Years Warranty', description: '60 months long-term warranty' },
      { value: 'Lifetime Warranty', description: 'Limited lifetime warranty' },
    ],
  },
];
