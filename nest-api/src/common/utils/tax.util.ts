export interface TaxSource {
  hsn?: string | null;
  cgst?: string | number | null;
  sgst?: string | number | null;
  igst?: string | number | null;
  gstRate?: string | number | null;
  tax_rate?: string | number | null;
  taxRate?: string | number | null;
}

export interface TaxCalculationResult {
  hsn: string | null;
  taxRate: string;
  taxableAmount: string;
  taxAmount: string;
  cgstRate: string;
  cgstAmount: string;
  sgstRate: string;
  sgstAmount: string;
  igstRate: string;
  igstAmount: string;
  grossAmount: string;
  isLocal: boolean;
}

export const HOME_STATE = 'Haryana';

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export function extractState(address: string | any): string {
  if (!address) return 'Unknown';
  let addrStr = '';
  if (typeof address === 'string') {
    try {
      const parsed = JSON.parse(address);
      if (typeof parsed === 'object' && parsed !== null) {
        if (parsed.state) return String(parsed.state).trim();
        addrStr = Object.values(parsed).join(' ');
      } else {
        addrStr = address;
      }
    } catch {
      addrStr = address;
    }
  } else if (typeof address === 'object' && address !== null) {
    if (address.state) return String(address.state).trim();
    addrStr = Object.values(address).join(' ');
  }

  const lower = addrStr.toLowerCase();
  for (const s of INDIAN_STATES) {
    if (lower.includes(s.toLowerCase())) return s;
  }
  const parts = addrStr.split(',').map((p) => p.trim());
  return parts.length >= 2 ? parts[parts.length - 2] || 'Unknown' : 'Unknown';
}

export function isLocalState(address: string | any): boolean {
  const state = extractState(address);
  return state.toLowerCase().includes(HOME_STATE.toLowerCase());
}

export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function calculateExclusiveGst(basePrice: number, gstRate: number): {
  gstAmount: number;
  displayPrice: number;
} {
  const rate = isNaN(gstRate) || gstRate < 0 ? 0 : gstRate;
  const base = isNaN(basePrice) || basePrice < 0 ? 0 : basePrice;
  const gstAmount = round2(base * (rate / 100));
  const displayPrice = round2(base + gstAmount);
  return { gstAmount, displayPrice };
}

export function calculateItemTax(
  source: TaxSource | null | undefined,
  baseOrGrossAmount: number,
  shippingAddress?: string | any,
  isExclusive: boolean = true,
): TaxCalculationResult {
  // 1. Resolve HSN
  const hsn = source?.hsn || null;

  // 2. Resolve Tax Rates
  const rawCgst = source?.cgst ?? null;
  const rawSgst = source?.sgst ?? null;
  const rawIgst = source?.igst ?? null;
  const rawGstRate =
    source?.gstRate ??
    source?.tax_rate ??
    source?.taxRate ??
    null;

  const cgstVal = rawCgst !== null && rawCgst !== undefined && String(rawCgst).trim() !== '' ? parseFloat(String(rawCgst)) : null;
  const sgstVal = rawSgst !== null && rawSgst !== undefined && String(rawSgst).trim() !== '' ? parseFloat(String(rawSgst)) : null;
  const igstVal = rawIgst !== null && rawIgst !== undefined && String(rawIgst).trim() !== '' ? parseFloat(String(rawIgst)) : null;
  const gstRateVal = rawGstRate !== null && rawGstRate !== undefined && String(rawGstRate).trim() !== '' ? parseFloat(String(rawGstRate)) : null;

  let totalRate = 0;
  if (igstVal !== null && !isNaN(igstVal) && igstVal >= 0) {
    totalRate = igstVal;
  } else if ((cgstVal !== null || sgstVal !== null) && (!isNaN(cgstVal ?? 0) || !isNaN(sgstVal ?? 0))) {
    totalRate = (cgstVal || 0) + (sgstVal || 0);
  } else if (gstRateVal !== null && !isNaN(gstRateVal) && gstRateVal >= 0) {
    totalRate = gstRateVal;
  }

  // 3. Tax Breakdown: Exclusive (Base Price + GST) or Inclusive
  let taxable: number;
  let totalTax: number;
  let gross: number;

  if (isExclusive) {
    taxable = round2(baseOrGrossAmount);
    totalTax = round2(taxable * (totalRate / 100));
    gross = round2(taxable + totalTax);
  } else {
    taxable = round2(baseOrGrossAmount / (1 + totalRate / 100));
    totalTax = round2(baseOrGrossAmount - taxable);
    gross = round2(baseOrGrossAmount);
  }

  const local = isLocalState(shippingAddress);

  if (local) {
    // Intra-state (Haryana): CGST (50%) + SGST (50%), IGST = 0
    const halfRate = round2(totalRate / 2);
    const halfTax = round2(totalTax / 2);
    const otherHalfTax = round2(totalTax - halfTax);

    return {
      hsn: hsn ? String(hsn).trim() : null,
      taxRate: totalRate.toFixed(2),
      taxableAmount: taxable.toFixed(2),
      taxAmount: totalTax.toFixed(2),
      grossAmount: gross.toFixed(2),
      cgstRate: (cgstVal !== null && !isNaN(cgstVal) ? cgstVal : halfRate).toFixed(2),
      cgstAmount: halfTax.toFixed(2),
      sgstRate: (sgstVal !== null && !isNaN(sgstVal) ? sgstVal : halfRate).toFixed(2),
      sgstAmount: otherHalfTax.toFixed(2),
      igstRate: '0.00',
      igstAmount: '0.00',
      isLocal: true,
    };
  } else {
    // Inter-state: IGST = 100%, CGST = 0, SGST = 0
    return {
      hsn: hsn ? String(hsn).trim() : null,
      taxRate: totalRate.toFixed(2),
      taxableAmount: taxable.toFixed(2),
      taxAmount: totalTax.toFixed(2),
      grossAmount: gross.toFixed(2),
      cgstRate: '0.00',
      cgstAmount: '0.00',
      sgstRate: '0.00',
      sgstAmount: '0.00',
      igstRate: totalRate.toFixed(2),
      igstAmount: totalTax.toFixed(2),
      isLocal: false,
    };
  }
}
