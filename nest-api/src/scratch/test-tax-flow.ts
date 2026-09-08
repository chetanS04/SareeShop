import { calculateItemTax, calculateExclusiveGst } from '../common/utils/tax.util';

function runTests() {
  console.log('--- Testing calculateExclusiveGst & calculateItemTax ---');

  // Test 1: Exclusive GST helper (₹1000 base, 18% GST -> GST ₹180, Display ₹1180)
  const gstHelper = calculateExclusiveGst(1000, 18);
  console.log('GST Helper Test Result:', gstHelper);
  if (gstHelper.gstAmount !== 180 || gstHelper.displayPrice !== 1180) {
    throw new Error(`GST Helper failed: got ${JSON.stringify(gstHelper)}`);
  }

  // Test 2: Haryana Intra-State (Exclusive 18% GST on ₹1000 item)
  const haryanaTax = calculateItemTax(
    {
      hsn: '64039990',
      cgst: '9.00',
      sgst: '9.00',
      igst: '18.00',
    },
    1000,
    'Sector 14, Gurugram, Haryana - 122001'
  );
  console.log('Haryana Test Result:', haryanaTax);
  if (
    haryanaTax.taxableAmount !== '1000.00' ||
    haryanaTax.taxAmount !== '180.00' ||
    haryanaTax.cgstAmount !== '90.00' ||
    haryanaTax.sgstAmount !== '90.00' ||
    haryanaTax.igstAmount !== '0.00' ||
    haryanaTax.grossAmount !== '1180.00' ||
    !haryanaTax.isLocal
  ) {
    throw new Error(`Haryana Tax test failed: got ${JSON.stringify(haryanaTax)}`);
  }

  // Test 3: Interstate Mumbai Maharashtra (Exclusive 18% GST on ₹1000 item)
  const mumbaiTax = calculateItemTax(
    {
      hsn: '64039990',
      cgst: '9.00',
      sgst: '9.00',
      igst: '18.00',
    },
    1000,
    'Bandra West, Mumbai, Maharashtra - 400050'
  );
  console.log('Mumbai Test Result:', mumbaiTax);
  if (
    mumbaiTax.taxableAmount !== '1000.00' ||
    mumbaiTax.taxAmount !== '180.00' ||
    mumbaiTax.cgstAmount !== '0.00' ||
    mumbaiTax.sgstAmount !== '0.00' ||
    mumbaiTax.igstAmount !== '180.00' ||
    mumbaiTax.grossAmount !== '1180.00' ||
    mumbaiTax.isLocal
  ) {
    throw new Error(`Mumbai Tax test failed: got ${JSON.stringify(mumbaiTax)}`);
  }

  // Test 4: Product with custom 12% GST (₹500 base, 12% GST -> Tax ₹60, Gross ₹560)
  const productTax = calculateItemTax(
    {
      hsn: '61091000',
      cgst: '6.00',
      sgst: '6.00',
      igst: '12.00',
    },
    500,
    'Sector 18, Noida, Uttar Pradesh'
  );
  console.log('Product 12% Tax Test Result:', productTax);
  if (
    productTax.hsn !== '61091000' ||
    productTax.taxRate !== '12.00' ||
    productTax.taxableAmount !== '500.00' ||
    productTax.taxAmount !== '60.00' ||
    productTax.grossAmount !== '560.00' ||
    productTax.igstAmount !== '60.00'
  ) {
    throw new Error(`Product Tax test failed: got ${JSON.stringify(productTax)}`);
  }

  console.log('--- All exclusive tax test cases verified successfully! ---');
}

runTests();

