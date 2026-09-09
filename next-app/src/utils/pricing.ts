/**
 * Pricing Utility Helper for Application-Wide Consistent Pricing Logic
 * 
 * Pricing Business Rules:
 * 1. Base Price (BP) / variant.sp = Tax-Exclusive Base Price entered in Admin (e.g. ₹1,500)
 * 2. Product GST Rate = e.g. 12% IGST (or 6% CGST + 6% SGST) from product/category settings
 * 3. Selling Price (sp) = Base Price + GST (e.g. ₹1,500 + 12% GST = ₹1,680)
 * 4. Original/Strikethrough Price = MRP (mrp)
 * 5. Discount = Math.round(((MRP - SP) / MRP) * 100)
 */

export interface PricingResult {
  sp: number;            // Current Customer Display Selling Price (Base Price + GST, e.g. 1680)
  basePrice: number;     // Tax-Exclusive Base Price (e.g. 1500)
  gstRate: number;       // GST Rate (e.g. 12)
  gstAmount: number;     // GST Amount (e.g. 180)
  mrp: number;           // Original Retail Price (MRP)
  discountPct: number;   // Discount percentage rounded to whole number
  hasDiscount: boolean;   // True if MRP > SP and SP > 0
  formattedSp: string;   // Formatted SP (e.g. ₹1,680)
  formattedBasePrice: string; // Formatted Base Price (e.g. ₹1,500)
  formattedGstAmount: string; // Formatted GST Amount (e.g. ₹180)
  formattedMrp: string;  // Formatted MRP (e.g. ₹2,000)
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

export function getProductGstRate(productOrVariant: any): number {
  if (!productOrVariant) return 0;

  // 1. Direct igst
  if (productOrVariant.igst !== null && productOrVariant.igst !== undefined && String(productOrVariant.igst).trim() !== "") {
    const igst = parseFloat(String(productOrVariant.igst));
    if (!isNaN(igst) && igst >= 0) return igst;
  }

  // 2. Direct cgst + sgst
  const hasCgst = productOrVariant.cgst !== null && productOrVariant.cgst !== undefined && String(productOrVariant.cgst).trim() !== "";
  const hasSgst = productOrVariant.sgst !== null && productOrVariant.sgst !== undefined && String(productOrVariant.sgst).trim() !== "";
  if (hasCgst || hasSgst) {
    const cgst = hasCgst ? parseFloat(String(productOrVariant.cgst)) : 0;
    const sgst = hasSgst ? parseFloat(String(productOrVariant.sgst)) : 0;
    const total = (isNaN(cgst) ? 0 : cgst) + (isNaN(sgst) ? 0 : sgst);
    return Math.round(total * 100) / 100;
  }

  // 3. gstRate or tax_rate on product
  if (productOrVariant.gstRate !== null && productOrVariant.gstRate !== undefined && String(productOrVariant.gstRate).trim() !== "") {
    const r = parseFloat(String(productOrVariant.gstRate));
    if (!isNaN(r) && r >= 0) return r;
  }

  if (productOrVariant.tax_rate !== null && productOrVariant.tax_rate !== undefined && String(productOrVariant.tax_rate).trim() !== "") {
    const r = parseFloat(String(productOrVariant.tax_rate));
    if (!isNaN(r) && r >= 0) return r;
  }

  // 4. Variant-level gstRate
  if (productOrVariant.variant?.gstRate !== null && productOrVariant.variant?.gstRate !== undefined && String(productOrVariant.variant.gstRate).trim() !== "") {
    const r = parseFloat(String(productOrVariant.variant.gstRate));
    if (!isNaN(r) && r >= 0) return r;
  }

  // 5. Category gstRate
  if (productOrVariant.category?.gstRate !== null && productOrVariant.category?.gstRate !== undefined && String(productOrVariant.category.gstRate).trim() !== "") {
    const r = parseFloat(String(productOrVariant.category.gstRate));
    if (!isNaN(r) && r >= 0) return r;
  }

  return 0;
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
    : 0;

  const validGstRate = isNaN(gstRate) || gstRate < 0 ? 0 : gstRate;
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
    return getPricing(0, 0, 0);
  }

  // 1. If variants array is available, prioritize the first in-stock variant (stock > 0), fallback to first variant
  let variant = null;
  const rawVariants = productOrVariant.variants;
  if (Array.isArray(rawVariants) && rawVariants.length > 0) {
    const activeVariants = rawVariants.filter(
      (v: any) => v.status === true || v.status === 1 || v.status === undefined
    );
    const inStock = activeVariants.find((v: any) => Number(v.stock ?? 0) > 0);
    variant = inStock || activeVariants[0] || rawVariants[0];
  }

  // 2. If not determined from variants array, check best_variant, bestVariant, or productOrVariant itself
  if (!variant) {
    variant = productOrVariant.best_variant || productOrVariant.bestVariant || productOrVariant;
  }

  const gstRate = getProductGstRate(productOrVariant) || (variant ? getProductGstRate(variant) : 0);

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


