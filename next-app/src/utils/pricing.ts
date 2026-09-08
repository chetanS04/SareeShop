/**
 * Pricing Utility Helper for Application-Wide Consistent Pricing Logic
 * 
 * Pricing Business Rules:
 * 1. Base Price (BP) / variant.sp = Tax-Exclusive Base Price entered in Admin (e.g. ₹1,000)
 * 2. Category GST Rate = e.g. 18% (from subcategory or parent category)
 * 3. Selling Price (sp) = Base Price + GST (e.g. ₹1,000 + 18% GST = ₹1,180)
 * 4. Original/Strikethrough Price = MRP (mrp)
 * 5. Discount = Math.round(((MRP - SP) / MRP) * 100)
 */

export interface PricingResult {
  sp: number;            // Current Customer Display Selling Price (Base Price + GST, e.g. 1180)
  basePrice: number;     // Tax-Exclusive Base Price (e.g. 1000)
  gstRate: number;       // GST Rate (e.g. 18)
  gstAmount: number;     // GST Amount (e.g. 180)
  mrp: number;           // Original Retail Price (MRP)
  discountPct: number;   // Discount percentage rounded to whole number
  hasDiscount: boolean;   // True if MRP > SP and SP > 0
  formattedSp: string;   // Formatted SP (e.g. ₹1,180)
  formattedBasePrice: string; // Formatted Base Price (e.g. ₹1,000)
  formattedGstAmount: string; // Formatted GST Amount (e.g. ₹180)
  formattedMrp: string;  // Formatted MRP (e.g. ₹1,400)
  savingsAmount: number; // MRP - SP
  formattedSavings: string;
}

export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function calculateDiscount(mrp: number, sp: number): number {
  if (!mrp || mrp <= 0 || !sp || sp <= 0 || mrp <= sp) {
    return 0;
  }
  return Math.round(((mrp - sp) / mrp) * 100);
}

export function formatPrice(price?: number | string | null): string {
  const numeric = typeof price === "string" ? parseFloat(price) : price;
  if (numeric == null || isNaN(numeric)) return "₹0";
  return `₹${Math.round(numeric).toLocaleString("en-IN")}`;
}

export function getPricing(
  mrpInput?: number | string | null,
  spInput?: number | string | null,
  gstRateInput?: number | string | null
): PricingResult {
  const basePrice = parseFloat(String(spInput ?? 0)) || 0;
  const mrp = Math.round(parseFloat(String(mrpInput ?? 0)) || 0);
  const gstRate = gstRateInput !== null && gstRateInput !== undefined && gstRateInput !== "" 
    ? parseFloat(String(gstRateInput)) 
    : 18.0;

  const validGstRate = isNaN(gstRate) || gstRate < 0 ? 18.0 : gstRate;
  const rawGstAmount = basePrice * (validGstRate / 100);
  const sp = Math.round(basePrice + rawGstAmount);
  const gstAmount = Math.round(rawGstAmount);

  const discountPct = calculateDiscount(mrp, sp);
  const hasDiscount = discountPct > 0;
  const savingsAmount = hasDiscount ? Math.max(0, mrp - sp) : 0;

  return {
    sp,
    basePrice: Math.round(basePrice),
    gstRate: validGstRate,
    gstAmount,
    mrp,
    discountPct,
    hasDiscount,
    formattedSp: formatPrice(sp),
    formattedBasePrice: formatPrice(basePrice),
    formattedGstAmount: formatPrice(gstAmount),
    formattedMrp: formatPrice(mrp),
    savingsAmount,
    formattedSavings: formatPrice(savingsAmount),
  };
}

export function extractProductPricing(productOrVariant: any): PricingResult {
  if (!productOrVariant) {
    return getPricing(0, 0, 18);
  }

  const variant = productOrVariant.best_variant || 
    (productOrVariant.variants && productOrVariant.variants[0]) || 
    productOrVariant;

  const rawGstRate = productOrVariant.gstRate ?? 
    productOrVariant.tax_rate ?? 
    variant?.gstRate ?? 
    null;

  const gstRate = rawGstRate !== null && rawGstRate !== undefined && rawGstRate !== '' 
    ? parseFloat(String(rawGstRate)) 
    : 18.0;

  const basePrice = variant?.baseSp != null 
    ? parseFloat(String(variant.baseSp)) 
    : (variant?.sp != null 
        ? parseFloat(String(variant.sp)) 
        : (productOrVariant.min_price ?? 0));

  const mrp = variant?.mrp != null 
    ? parseFloat(String(variant.mrp)) 
    : (productOrVariant.max_price ?? 0);

  return getPricing(mrp, basePrice, gstRate);
}

