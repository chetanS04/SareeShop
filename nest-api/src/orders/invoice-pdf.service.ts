import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

@Injectable()
export class InvoicePdfService {
  private readonly logger = new Logger(InvoicePdfService.name);

  private resolveLogoPath(): string | null {
    const candidates = [
      path.join(process.cwd(), 'uploads', 'logo', 'svastra-logo.png'),
      path.join(process.cwd(), 'uploads', 'logo', 'logo-mark.png'),
      path.join(process.cwd(), '..', 'next-app', 'public', 'svastra', 'logo-mark.png'),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) return candidate;
    }
    return null;
  }

  /**
   * Generates a Tax Invoice PDF for SVastra orders.
   * Uses PDFKit native APIs only — no splitTextToSize (that is jsPDF only).
   */
  async generateInvoicePdf(orderData: any, settingsData: Record<string, string> = {}): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 0, size: 'A4' });
        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        // ── Settings ──────────────────────────────────────────────────────
        const soldByName = settingsData?.sold_by_name?.trim() || 'SVastra';
        const soldByAddress = settingsData?.sold_by_address?.trim() || '9C 206, Bloomdale Mahindra Complex, Nagpur, Maharashtra, 441108, IN';
        const soldByPan = settingsData?.pan_no?.trim() || settingsData?.pan?.trim() || 'BFJPA5082B';
        const soldByGstin = settingsData?.gstin?.trim() || '27-UR';
        const supportPhone = settingsData?.support_phone?.trim() || '7507599315';
        const supportEmail = settingsData?.support_email?.trim() || 'svastrastore@gmail.com';

        // ── Order fields ───────────────────────────────────────────────────
        const getFinancialYear = (d: any): string => {
          const dt = d ? new Date(d) : new Date();
          const validDt = isNaN(dt.getTime()) ? new Date() : dt;
          const year = validDt.getFullYear();
          const month = validDt.getMonth(); // 0-11
          let startYear: number, endYear: number;
          if (month >= 3) {
            startYear = year;
            endYear = year + 1;
          } else {
            startYear = year - 1;
            endYear = year;
          }
          return `${String(startYear).slice(-2)}${String(endYear).slice(-2)}`;
        };

        const rawId = String(orderData.id || '1').replace(/\D/g, '') || '1';
        const orderDt = orderData.createdAt || orderData.created_at;
        const fyStr = getFinancialYear(orderDt);
        const seqPadded = rawId.padStart(5, '0');

        const orderNumber = orderData.orderNumber || orderData.order_number || `ORD-${rawId}`;
        const invoiceNum =
          (orderData as any).invoiceNumber ||
          orderData.invoice_number ||
          `ZT/${fyStr}/${seqPadded}`;

        const formattedOrderId = orderNumber;

        const fmtDate = (d: any): string => {
          if (!d) return new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
          const dt = new Date(d);
          return isNaN(dt.getTime())
            ? new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
            : dt.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
        };

        const orderDate = fmtDate(orderData.createdAt || orderData.created_at);
        const invoiceDate = fmtDate(orderData.deliveredAt || orderData.delivered_at || orderData.createdAt || orderData.created_at);

        const user = (orderData.user as any) || {};
        const customerName = user.name || 'Valued Customer';
        const customerEmail = user.email || '';
        const customerPhone = user.phone || user.phone_number || user.phoneNumber || user.contact || '';

        const rawAddr = orderData.shippingAddress || orderData.shipping_address;
        let shippingAddr = '';
        let parsedAddr: any = null;
        if (typeof rawAddr === 'object' && rawAddr !== null) {
          parsedAddr = rawAddr;
        } else if (typeof rawAddr === 'string') {
          const trimmed = rawAddr.trim();
          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
              parsedAddr = JSON.parse(trimmed);
            } catch (e) {
              parsedAddr = null;
            }
          }
        }

        if (parsedAddr) {
          shippingAddr = [
            parsedAddr.add,
            parsedAddr.city,
            [parsedAddr.state, parsedAddr.pin].filter(Boolean).join(' '),
            parsedAddr.country,
          ]
            .filter(Boolean)
            .join(', ');
        } else if (typeof rawAddr === 'string') {
          shippingAddr = rawAddr
            .split(/\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean)
            .join(', ');
        }
        if (!shippingAddr) shippingAddr = 'N/A';

        const items: any[] = orderData.orderItems || orderData.order_items || orderData.items || [];

        const totalAmount = parseFloat(String(orderData.total || '0')) || 0;
        const subtotalAmount = parseFloat(String(orderData.subtotal || orderData.total || '0')) || totalAmount;
        const shippingFee = parseFloat(String(orderData.shippingFee || orderData.shipping_fee || '0')) || 0;

        const paymentMethod = (orderData.paymentMethod || orderData.payment_method || 'cash_on_delivery') === 'cash_on_delivery'
          ? 'Cash on Delivery (COD)' : 'Online Payment';
        const paymentStatus = (orderData.paymentStatus || orderData.payment_status || 'pending').toUpperCase();
        const transactionId = orderData.transactionId || orderData.transaction_id || null;

        const fmtRs = (amount: number) => `Rs. ${amount.toFixed(2)}`;

        // ── Layout constants (matching Truckage X-positions) ───────────────
        const L = 39.68;   // left margin
        const R = 555.59;  // right margin

        // Table column X positions  — evenly divided 5 numeric boxes
        const C_DESC = L; const W_DESC = 195.32;   // Description (X: 39.68 -> 235.00)
        const C_QTY = 235.0; const W_QTY = 30.0;     // Qty (X: 235.00 -> 265.00)

        // 5 numeric boxes spanning 265.00 to 555.59 (width = 290.59 / 5 = 58.1 each)
        const C_GROSS = 265.0; const W_GROSS = 58.1;  // Gross (X: 265.00 -> 323.10)
        const C_DISC = 323.1; const W_DISC = 58.1;   // Discount (X: 323.10 -> 381.20)
        const C_TAX = 381.2; const W_TAX = 58.1;    // Taxable (X: 381.20 -> 439.30)
        const C_IGST = 439.3; const W_IGST = 58.1;   // IGST (X: 439.30 -> 497.40)
        const C_TOTAL = 497.4; const W_TOTAL = 58.19; // Total (X: 497.40 -> 555.59 = R)

        // Helper to draw a horizontal full-width line
        const hLine = (y: number, w = 1.1, color = '#000000') =>
          doc.moveTo(L, y).lineTo(R, y).lineWidth(w).strokeColor(color).stroke();

        // Helper to draw a vertical column separator line
        const vLine = (x: number, y1: number, y2: number, lw = 0.6, color = '#cccccc') =>
          doc.moveTo(x, y1).lineTo(x, y2).lineWidth(lw).strokeColor(color).stroke();

        const websiteUrl = settingsData?.website_url?.trim() || 'www.svastrastore.com';

        // ════════════════════════════════════════════════════════════════
        // 1.  HEADER  — title, logo, sold-by, invoice meta box
        // ════════════════════════════════════════════════════════════════
        doc.font('Helvetica-Bold').fontSize(17).fillColor('#8B1313')
          .text('TAX INVOICE', 0, 28, { align: 'center', width: 595.28 });

        const headerY = 46;
        const soldByX = L + 58;
        const soldByW = 248;

        const logoPath = this.resolveLogoPath();
        if (logoPath) {
          try {
            doc.image(logoPath, L, headerY, { height: 48, fit: [48, 48] });
          } catch (e) {
            doc.font('Helvetica-Bold').fontSize(14).fillColor('#8B1313')
              .text('SVastra', L, headerY + 14);
          }
        } else {
          doc.font('Helvetica-Bold').fontSize(14).fillColor('#8B1313')
            .text('SVastra', L, headerY + 14);
        }

        doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000')
          .text(`Sold By: ${soldByName}`, soldByX, headerY + 2);
        doc.font('Helvetica').fontSize(8).fillColor('#333333');
        const shipFromText = soldByAddress;
        const shipFromH = doc.heightOfString(shipFromText, { width: soldByW });
        doc.text(shipFromText, soldByX, headerY + 14, { width: soldByW });

        const gstinY = headerY + 14 + shipFromH + 4;
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#000000')
          .text(`PAN: ${soldByPan}  |  GSTIN: ${soldByGstin}`, soldByX, gstinY, { width: soldByW });

        const invBoxX = 368;
        const invBoxW = R - invBoxX;
        const invBoxY = headerY;
        const invRowH = 14;
        const invRows: Array<[string, string]> = [
          ['Invoice No.', invoiceNum],
          ['Order ID', formattedOrderId],
          ['Invoice Date', invoiceDate],
          ['Order Date', orderDate],
          ['Payment', paymentMethod],
        ];
        if (transactionId) {
          invRows.push(['Txn ID', String(transactionId)]);
        }
        const invBoxH = invRows.length * invRowH + 10;

        doc.rect(invBoxX, invBoxY, invBoxW, invBoxH).lineWidth(0.85).strokeColor('#8B1313').stroke();
        let invRowY = invBoxY + 7;
        for (const [label, value] of invRows) {
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#444444')
            .text(label, invBoxX + 8, invRowY, { width: 62 });
          doc.font('Helvetica').fontSize(7.5).fillColor('#000000')
            .text(value, invBoxX + 72, invRowY, { width: invBoxW - 80, align: 'right' });
          invRowY += invRowH;
        }

        const headerEndY = Math.max(gstinY + 14, invBoxY + invBoxH) + 12;
        hLine(headerEndY, 1.1);

        // ════════════════════════════════════════════════════════════════
        // 2.  SHIPPING / BILLING ADDRESS
        // ════════════════════════════════════════════════════════════════
        const infoY = headerEndY + 14;
        const col2X = 300;
        const col1W = col2X - L - 12;
        const col2W = R - col2X;

        doc.font('Helvetica-Bold').fontSize(9).fillColor('#8B1313')
          .text('Bill To / Ship To', L, infoY);
        doc.font('Helvetica').fontSize(8.5).fillColor('#333333');
        doc.text(`Name: ${customerName}`, L, infoY + 16, { width: col1W });

        let leftSubY = infoY + 30;
        if (customerPhone) {
          doc.text(`Phone: ${customerPhone}`, L, leftSubY, { width: col1W });
          leftSubY += 14;
        }
        if (customerEmail) {
          doc.text(`Email: ${customerEmail}`, L, leftSubY, { width: col1W });
          leftSubY += 14;
        }

        const addrText = `Address: ${shippingAddr}`;
        doc.text(addrText, L, leftSubY, { width: col1W });
        const leftAddrH = doc.heightOfString(addrText, { width: col1W });
        const leftEndY = leftSubY + leftAddrH + 6;

        doc.font('Helvetica-Bold').fontSize(9).fillColor('#8B1313')
          .text('Order Summary', col2X, infoY);
        doc.font('Helvetica').fontSize(8.5).fillColor('#333333');
        doc.text(`Items: ${items.length}`, col2X, infoY + 16, { width: col2W });
        doc.text(`Payment Status: ${paymentStatus}`, col2X, infoY + 30, { width: col2W });
        doc.text(`Amount Payable: Rs. ${totalAmount.toFixed(2)}`, col2X, infoY + 44, { width: col2W });
        const rightEndY = infoY + 58;

        const tableTopY = Math.max(leftEndY, rightEndY) + 14;

        // ── Table-top divider (Truckage style: thick)
        hLine(tableTopY, 1.4);

        // ════════════════════════════════════════════════════════════════
        // 3.  TABLE  — headers + rows + vertical column lines
        // ════════════════════════════════════════════════════════════════
        const HDR_Y = tableTopY + 10;
        const HDR_H = 22;   // header cell height (2-line for IGST/Total)
        const HDR_LINE = tableTopY + HDR_H + 10;   // line below header

        // ── Column headers  (5 numeric boxes divided equally, centered)
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#0f172a');
        doc.text('Description', C_DESC, HDR_Y);
        doc.text('Qty', C_QTY, HDR_Y, { align: 'center', width: W_QTY });
        doc.text('Gross (Rs.)', C_GROSS, HDR_Y, { align: 'center', width: W_GROSS });
        doc.text('Discount', C_DISC, HDR_Y, { align: 'center', width: W_DISC });
        doc.text('Taxable (Rs.)', C_TAX, HDR_Y, { align: 'center', width: W_TAX });
        doc.text('IGST (Rs.)', C_IGST, HDR_Y, { align: 'center', width: W_IGST });
        doc.text('Total (Rs.)', C_TOTAL, HDR_Y, { align: 'center', width: W_TOTAL });

        // Line below header
        hLine(HDR_LINE, 1.1);

        // ── Item rows ─────────────────────────────────────────────────────
        let curY = HDR_LINE + 8;
        let grandIgst = 0;
        let grandTaxable = 0;
        let grandLineTotal = 0;
        let grandQty = 0;

        if (items.length === 0) {
          doc.font('Helvetica-Oblique').fontSize(8).fillColor('#888888')
            .text('No items found for this order.', C_DESC, curY);
          curY += 18;
        }

        for (const item of items) {
          // Product name
          const productName =
            item.product?.name || item.product?.title ||
            item.product_name || item.name || item.title || 'Product';

          // Variant / attribute
          let variantInfo = '';
          if (item.variant?.title) {
            variantInfo = item.variant.title;
          } else {
            const attrs = item.selectedAttributes || item.selected_attributes;
            if (attrs && typeof attrs === 'object') {
              variantInfo = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(', ');
            } else if (typeof attrs === 'string' && attrs.trim()) {
              variantInfo = attrs;
            }
          }
          const sku = item.variant?.sku || item.sku || '';
          const fullTitle = variantInfo ? `${productName} (${variantInfo})` : productName;

          // Numbers
          const qty = parseInt(String(item.quantity || '1'), 10) || 1;
          const unitPrice = parseFloat(String(item.price || item.unit_price || '0')) || 0;
          const lineTotal = parseFloat(String(item.total || item.total_price || (unitPrice * qty).toString())) || 0;

          const hsnCode =
            item.hsn ||
            item.product?.hsn ||
            item.product?.category?.hsn ||
            item.product?.category?.parent?.hsn ||
            item.product?.hsn_code ||
            item.product?.hsnCode ||
            '';

          const itemRateRaw =
            item.taxRate ||
            item.tax_rate ||
            item.product?.gstRate ||
            item.product?.tax_rate ||
            item.product?.category?.gstRate ||
            item.product?.category?.tax_rate ||
            18.0;

          const itemRate = parseFloat(String(itemRateRaw)) || 18.0;

          const taxable = item.taxableAmount !== null && item.taxableAmount !== undefined
            ? parseFloat(String(item.taxableAmount))
            : (unitPrice * qty);

          const taxAmount = item.taxAmount !== null && item.taxAmount !== undefined
            ? parseFloat(String(item.taxAmount))
            : (taxable * (itemRate / 100));

          const computedLineTotal = item.total !== null && item.total !== undefined
            ? parseFloat(String(item.total))
            : (taxable + taxAmount);

          grandQty += qty;
          grandTaxable += taxable;
          grandIgst += taxAmount;
          grandLineTotal += computedLineTotal;

          const taxInfoList: string[] = [];
          // if (hsnCode) taxInfoList.push(`HSN: ${hsnCode}`);
          taxInfoList.push(`GST: ${itemRate.toFixed(1)}%`);
          const taxNoteText = taxInfoList.join(' | ');

          // Height measurement via PDFKit's heightOfString (set font first so measurements are exact)
          doc.font('Helvetica-Bold').fontSize(8.5);
          const titleH = doc.heightOfString(fullTitle, { width: W_DESC });

          const skuText = sku ? `SKU: ${sku}` : '';
          doc.font('Helvetica').fontSize(7.5);
          const skuH = skuText ? doc.heightOfString(skuText, { width: W_DESC }) : 0;

          doc.font('Helvetica-Oblique').fontSize(7);
          const taxNoteH = doc.heightOfString(taxNoteText, { width: W_DESC });

          const spacing = 2;
          const rowPadding = 8;
          const rowH = titleH + (skuH ? skuH + spacing : 0) + taxNoteH + spacing + rowPadding;

          if (curY + rowH > 720) { doc.addPage(); curY = 40; }

          // Description (Product Name + Variant)
          doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#0f172a')
            .text(fullTitle, C_DESC, curY, { width: W_DESC });

          let noteY = curY + titleH + spacing;

          // SKU on next line
          if (skuText) {
            doc.font('Helvetica').fontSize(7.5).fillColor('#475569')
              .text(skuText, C_DESC, noteY, { width: W_DESC });
            noteY += skuH + spacing;
          }

          // Tax note on next line
          doc.font('Helvetica-Oblique').fontSize(7).fillColor('#64748b')
            .text(taxNoteText, C_DESC, noteY, { width: W_DESC });

          // Numeric columns (centered vertically from top/bottom and horizontally from left/right)
          doc.font('Helvetica').fontSize(8.5).fillColor('#0f172a');
          const numH = doc.heightOfString('0', { width: W_QTY });
          const numY = curY + Math.max(0, (rowH - numH) / 2 - 1);

          doc.text(String(qty), C_QTY, numY, { align: 'center', width: W_QTY });
          doc.text(taxable.toFixed(2), C_GROSS, numY, { align: 'center', width: W_GROSS });
          doc.text('0.00', C_DISC, numY, { align: 'center', width: W_DISC });
          doc.text(taxable.toFixed(2), C_TAX, numY, { align: 'center', width: W_TAX });
          doc.text(taxAmount.toFixed(2), C_IGST, numY, { align: 'center', width: W_IGST });
          doc.text(computedLineTotal.toFixed(2), C_TOTAL, numY, { align: 'center', width: W_TOTAL });

          curY += rowH;

          // Thin row separator (light, like Truckage)
          doc.moveTo(L, curY - 2).lineTo(R, curY - 2).lineWidth(0.5).strokeColor('#cccccc').stroke();
        }

        // ── Vertical column separators spanning header → last row
        const tblTop = tableTopY;
        const tblBot = curY;
        const vSeps = [C_QTY, C_GROSS, C_DISC, C_TAX, C_IGST, C_TOTAL];
        for (const x of vSeps) {
          vLine(x - 1, tblTop, tblBot, 0.5, '#bbbbbb');
        }

        // ── Line below items (Truckage: 0.85)
        hLine(curY, 0.85);

        // ── Total row
        const totalRowY = curY + 6;
        const totalRowH = 20;
        doc.rect(L, totalRowY - 2, R - L, totalRowH).fillColor('#f8f4f0').fill();
        curY = totalRowY + 5;

        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#0f172a');
        doc.text('Total', C_DESC, curY);
        doc.text(String(grandQty), C_QTY, curY, { align: 'center', width: W_QTY });
        doc.text(grandTaxable.toFixed(2), C_GROSS, curY, { align: 'center', width: W_GROSS });
        doc.text('0.00', C_DISC, curY, { align: 'center', width: W_DISC });
        doc.text(grandTaxable.toFixed(2), C_TAX, curY, { align: 'center', width: W_TAX });
        doc.text(grandIgst.toFixed(2), C_IGST, curY, { align: 'center', width: W_IGST });
        doc.text(grandLineTotal.toFixed(2), C_TOTAL, curY, { align: 'center', width: W_TOTAL });

        curY = totalRowY + totalRowH + 6;
        hLine(curY, 1.2);
        hLine(curY + 2.5, 0.45, '#888888');

        // ════════════════════════════════════════════════════════════════
        // 4.  PAYMENT DETAILS  +  AMOUNT SUMMARY
        // ════════════════════════════════════════════════════════════════
        curY += 16;
        const sectionTopY = curY;
        const payBoxW = 252;
        const payBoxH = transactionId ? 88 : 72;
        const totalsBoxX = 318;
        const totalsBoxW = R - totalsBoxX;
        const totalsLabelW = 92;
        const summaryTaxable = grandTaxable > 0 ? grandTaxable : subtotalAmount;
        const summaryIgst = grandIgst > 0 ? grandIgst : Math.max(0, totalAmount - summaryTaxable - shippingFee);
        const summaryRowCount = 2 + (shippingFee > 0 ? 1 : 0) + 1;
        const totalsBoxH = 14 + summaryRowCount * 15 + 12;

        // Payment details box
        doc.rect(L, sectionTopY, payBoxW, payBoxH).lineWidth(0.75).strokeColor('#d4d4d4').stroke();
        doc.rect(L, sectionTopY, payBoxW, 20).fillColor('#8B1313').fill();
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#ffffff')
          .text('Payment Details', L + 10, sectionTopY + 6);

        const payLabelX = L + 10;
        const payValueX = L + 78;
        const payValueW = payBoxW - 88;
        let payRowY = sectionTopY + 30;

        const drawPayRow = (label: string, value: string, valueColor = '#333333', bold = false) => {
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#666666')
            .text(label, payLabelX, payRowY, { width: 64 });
          doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8).fillColor(valueColor)
            .text(value, payValueX, payRowY, { width: payValueW });
          payRowY += 15;
        };

        drawPayRow('Method', paymentMethod);
        const statusColor = paymentStatus === 'PAID' ? '#15803d' : paymentStatus === 'PENDING' ? '#b45309' : '#333333';
        drawPayRow('Status', paymentStatus, statusColor, true);
        if (transactionId) {
          drawPayRow('Txn ID', String(transactionId));
        }

        // Amount summary box
        doc.rect(totalsBoxX, sectionTopY, totalsBoxW, totalsBoxH).lineWidth(0.75).strokeColor('#d4d4d4').stroke();
        doc.rect(totalsBoxX, sectionTopY, totalsBoxW, 20).fillColor('#f8f4f0').fill();
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#8B1313')
          .text('Amount Summary', totalsBoxX + 10, sectionTopY + 6);

        let sumLineY = sectionTopY + 30;
        const drawSumRow = (label: string, value: string, bold = false, valueColor = '#333333') => {
          doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8).fillColor('#555555')
            .text(label, totalsBoxX + 10, sumLineY, { width: totalsLabelW });
          doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 9 : 8).fillColor(valueColor)
            .text(value, totalsBoxX + totalsLabelW + 6, sumLineY, {
              width: totalsBoxW - totalsLabelW - 16,
              align: 'right',
            });
          sumLineY += 15;
        };

        drawSumRow('Taxable Value:', fmtRs(summaryTaxable));
        drawSumRow('IGST:', fmtRs(summaryIgst));
        if (shippingFee > 0) {
          drawSumRow('Shipping:', fmtRs(shippingFee));
        }

        doc.moveTo(totalsBoxX + 8, sumLineY + 1).lineTo(R - 8, sumLineY + 1).lineWidth(0.8).strokeColor('#8B1313').stroke();
        sumLineY += 9;
        drawSumRow('Grand Total:', fmtRs(totalAmount), true, '#8B1313');

        const sectionBottomY = Math.max(sectionTopY + payBoxH, sectionTopY + totalsBoxH);
        doc.font('Helvetica-Oblique').fontSize(7).fillColor('#777777')
          .text(
            'This is a computer-generated tax invoice and does not require a physical signature.',
            L,
            sectionBottomY + 12,
            { width: R - L, align: 'center' },
          );

        // ════════════════════════════════════════════════════════════════
        // 5.  FOOTER  (Truckage: footer at bottom of page ~759)
        // ════════════════════════════════════════════════════════════════
        const ftLineY = 759.6;
        hLine(ftLineY, 1.1);

        const ftY = ftLineY + 6;
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#8B1313')
          .text(soldByName, 355.59, ftY, { align: 'right', width: 200 });
        doc.font('Helvetica-Oblique').fontSize(7).fillColor('#646464')
          .text('Thank you for shopping with SVastra!', 355.59, ftY + 12, { align: 'right', width: 200 });

        doc.font('Helvetica').fontSize(6.5).fillColor('#505050');
        const regdText = `Regd. Office: ${soldByName}, ${soldByAddress}`;
        const regdH = doc.heightOfString(regdText, { width: 320 });
        doc.text(regdText, L, ftY + 5, { width: 320 });

        const suppY = ftY + 5 + regdH + 2;
        doc.text(`Support: ${supportPhone} | ${supportEmail} | ${websiteUrl}`, L, suppY);

        const botLineY = Math.max(ftY + 27, suppY + 10);
        doc.moveTo(L, botLineY).lineTo(R, botLineY).lineWidth(0.85).strokeColor('#000000').stroke();

        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#000000')
          .text('E. & O.E.', 467.7, botLineY + 6);
        doc.font('Helvetica').fontSize(7.5).fillColor('#000000')
          .text('page 1 of 1', 525.59, botLineY + 6, { align: 'right', width: 30 });

        doc.end();
      } catch (err: any) {
        this.logger.error(`Error generating PDF invoice: ${err.message}`);
        reject(err);
      }
    });
  }
}
