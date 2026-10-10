import jsPDF from "jspdf";

export interface OrderInvoiceData {
  id: number;
  order_number?: string;
  orderNumber?: string;
  invoice_number?: string;
  invoiceNumber?: string;
  status?: string;
  payment_method?: string;
  paymentMethod?: string;
  payment_status?: string;
  paymentStatus?: string;
  transaction_id?: string | null;
  transactionId?: string | null;
  subtotal?: number | string;
  shipping_fee?: number | string;
  shippingFee?: number | string;
  tax?: number | string;
  total?: number | string;
  shipping_address?: string;
  shippingAddress?: string;
  billing_address?: string;
  billingAddress?: string;
  created_at?: string;
  createdAt?: string;
  delivered_at?: string;
  deliveredAt?: string;
  user?: {
    name?: string;
    email?: string;
    phone?: string;
    phone_number?: string;
    contact?: string;
  };
  order_items?: any[];
  orderItems?: any[];
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch("/svastra/logo-mark.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export const generateInvoicePDF = async (
  order: OrderInvoiceData,
  settings?: Record<string, string> | null
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const logoDataUrl = await loadLogoDataUrl();

  const rawIdStr = String(order.id || "1").replace(/\D/g, "") || "1";
  const orderNum = order.order_number || order.orderNumber || `ORD-${rawIdStr}`;
  const formattedOrderId = orderNum;

  const txnId = order.transaction_id || order.transactionId;
  const invoiceNum =
    order.invoice_number ||
    order.invoiceNumber ||
    (txnId ? `INV-${txnId}` : `INV-${rawIdStr.padStart(6, "0")}`);

  const soldByName = settings?.sold_by_name?.trim() || "SVastra";
  const soldByAddress =
    settings?.sold_by_address?.trim() ||
    "9C 206, Bloomdale Mahindra Complex, Nagpur, Maharashtra, 441108, IN";
  const soldByPan = settings?.pan_no?.trim() || settings?.pan?.trim() || "BFJPA5082B";
  const gstinValue = settings?.gstin?.trim() || "27-UR";
  const supportPhone = settings?.support_phone?.trim() || "7507599315";
  const supportEmail = settings?.support_email?.trim() || "svastrastore@gmail.com";
  const websiteUrl = settings?.website_url?.trim() || "www.svastrastore.com";

  const formatDateStr = (dateStr?: string | null) => {
    if (!dateStr) {
      return new Date()
        .toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "-");
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return new Date()
        .toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "-");
    }
    return d
      .toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
  };

  const orderDate = formatDateStr(order.created_at || order.createdAt);
  const invoiceDate = formatDateStr(
    order.delivered_at || order.deliveredAt || order.created_at || order.createdAt
  );

  const customerName = order.user?.name || "Valued Customer";
  const customerEmail = order.user?.email || "";
  const customerPhone =
    order.user?.phone || order.user?.phone_number || order.user?.contact || "";

  let rawAddr = order.shipping_address || order.shippingAddress || "N/A";
  let shippingAddr = String(rawAddr);
  try {
    if (typeof rawAddr === "string" && rawAddr.trim().startsWith("{")) {
      const p = JSON.parse(rawAddr.trim());
      shippingAddr = [p.add, p.city, [p.state, p.pin].filter(Boolean).join(" "), p.country]
        .filter(Boolean)
        .join(", ");
    }
  } catch {
    shippingAddr = String(rawAddr);
  }

  const rawTotal =
    typeof order.total === "number" ? order.total : parseFloat((order.total as any) || "0") || 0;
  const rawSubtotal =
    typeof order.subtotal === "number"
      ? order.subtotal
      : parseFloat((order.subtotal as any) || "0") || rawTotal;
  const rawTax =
    typeof order.tax === "number" ? order.tax : parseFloat((order.tax as any) || "0") || 0;
  const rawShipping =
    typeof order.shipping_fee === "number"
      ? order.shipping_fee
      : parseFloat((order.shippingFee as any) || "0") || 0;

  const paymentMeth =
    (order.payment_method || order.paymentMethod || "cash_on_delivery") === "cash_on_delivery"
      ? "Cash on Delivery (COD)"
      : "Online Payment";
  const paymentStat = (order.payment_status || order.paymentStatus || "pending").toUpperCase();

  const itemsList = order.order_items || order.orderItems || [];

  const L = 14;
  const R = 196;
  const primaryRgb = [139, 19, 19] as [number, number, number];

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...primaryRgb);
  doc.text("TAX INVOICE", 105, 12, { align: "center" });

  // Logo + Sold By
  const headerY = 18;
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", L, headerY, 14, 14);
    } catch {
      doc.setFontSize(12);
      doc.setTextColor(...primaryRgb);
      doc.text("SVastra", L, headerY + 10);
    }
  } else {
    doc.setFontSize(12);
    doc.setTextColor(...primaryRgb);
    doc.text("SVastra", L, headerY + 10);
  }

  const soldByX = L + 18;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`Sold By: ${soldByName}`, soldByX, headerY + 4);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 51, 51);
  const addressLines = doc.splitTextToSize(soldByAddress, 78);
  doc.text(addressLines, soldByX, headerY + 9);

  const gstinY = headerY + 9 + addressLines.length * 3.8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text(`PAN: ${soldByPan}  |  GSTIN: ${gstinValue}`, soldByX, gstinY);

  // Invoice meta box (right)
  const invBoxX = 128;
  const invBoxW = R - invBoxX;
  const invRows: Array<[string, string]> = [
    ["Invoice No.", invoiceNum],
    ["Order ID", formattedOrderId],
    ["Invoice Date", invoiceDate],
    ["Order Date", orderDate],
    ["Payment", paymentMeth],
  ];
  if (txnId) invRows.push(["Txn ID", String(txnId)]);

  const invBoxH = invRows.length * 5.2 + 4;
  doc.setDrawColor(...primaryRgb);
  doc.setLineWidth(0.35);
  doc.rect(invBoxX, headerY, invBoxW, invBoxH);

  let invRowY = headerY + 4.5;
  invRows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(68, 68, 68);
    doc.text(label, invBoxX + 2, invRowY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(value, invBoxX + invBoxW - 2, invRowY, { align: "right", maxWidth: invBoxW - 30 });
    invRowY += 5.2;
  });

  const headerEndY = Math.max(gstinY + 5, headerY + invBoxH) + 4;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(L, headerEndY, R, headerEndY);

  // Bill To + Order Summary
  let currentY = headerEndY + 6;
  const col2X = 108;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryRgb);
  doc.text("Bill To / Ship To", L, currentY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 51, 51);
  doc.text(`Name: ${customerName}`, L, currentY + 5);

  let leftSubY = currentY + 10;
  if (customerPhone) {
    doc.text(`Phone: ${customerPhone}`, L, leftSubY);
    leftSubY += 5;
  }
  if (customerEmail) {
    doc.text(`Email: ${customerEmail}`, L, leftSubY);
    leftSubY += 5;
  }

  const shipLines = doc.splitTextToSize(`Address: ${shippingAddr}`, 88);
  doc.text(shipLines, L, leftSubY);
  const leftEndY = leftSubY + shipLines.length * 4;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryRgb);
  doc.text("Order Summary", col2X, currentY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 51, 51);
  doc.text(`Items: ${itemsList.length}`, col2X, currentY + 5);
  doc.text(`Payment Status: ${paymentStat}`, col2X, currentY + 10);
  doc.text(`Amount Payable: Rs. ${rawTotal.toFixed(2)}`, col2X, currentY + 15);

  currentY = Math.max(leftEndY, currentY + 20) + 4;
  doc.setLineWidth(0.5);
  doc.line(L, currentY, R, currentY);

  // Table headers
  currentY += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);

  doc.text("Description", L, currentY);
  doc.text("Qty", 95, currentY, { align: "center" });
  doc.text("Gross (Rs.)", 120, currentY, { align: "center" });
  doc.text("Discount", 145, currentY, { align: "center" });
  doc.text("Taxable (Rs.)", 170, currentY, { align: "center" });
  doc.text("Total (Rs.)", R, currentY, { align: "right" });

  currentY += 4;
  doc.setLineWidth(0.4);
  doc.line(L, currentY, R, currentY);

  currentY += 5;
  itemsList.forEach((item: any) => {
    const prodName =
      item.product?.name ||
      item.product?.title ||
      item.product_name ||
      item.name ||
      item.title ||
      "Product Item";

    const sku = item.variant?.sku || item.sku || "";
    let variantText = "";
    if (item.variant?.title) {
      variantText = item.variant.title;
    } else if (item.selected_attributes || item.selectedAttributes) {
      const attrs = item.selected_attributes || item.selectedAttributes;
      if (typeof attrs === "object" && attrs !== null) {
        variantText = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(", ");
      } else if (typeof attrs === "string") {
        variantText = attrs;
      }
    }

    const fullTitle = variantText ? `${prodName} (${variantText})` : prodName;
    const qty = parseInt(item.quantity || "1", 10) || 1;
    const itemPrice =
      typeof item.price === "number" ? item.price : parseFloat(item.price || "0") || 0;

    const itemRateRaw =
      item.taxRate ??
      item.tax_rate ??
      item.product?.gstRate ??
      item.product?.tax_rate ??
      item.product?.category?.gstRate ??
      item.product?.category?.tax_rate ??
      18;
    const parsedRate = parseFloat(String(itemRateRaw));
    const itemRate = !isNaN(parsedRate) && parsedRate >= 0 ? parsedRate : 18;

    const taxableValNum = item.taxableAmount || item.taxable_amount
      ? parseFloat(item.taxableAmount || item.taxable_amount)
      : itemPrice * qty;
    const taxableVal = taxableValNum.toFixed(2);

    const itemTaxAmount = item.taxAmount || item.tax_amount
      ? parseFloat(item.taxAmount || item.tax_amount)
      : taxableValNum * (itemRate / 100);

    const itemTotalCalculated =
      typeof item.total === "number"
        ? item.total
        : item.total
          ? parseFloat(item.total)
          : taxableValNum + itemTaxAmount;

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    const titleLines = doc.splitTextToSize(fullTitle, 75);
    doc.text(titleLines, L, currentY);

    let subY = currentY + titleLines.length * 4;
    if (sku) {
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`SKU: ${sku}`, L, subY);
      subY += 3.5;
    }

    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text(`GST: ${itemRate.toFixed(1)}%`, L, subY);
    subY += 3.5;

    const blockHeight = subY - currentY;

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(String(qty), 95, currentY, { align: "center" });
    doc.text(taxableVal, 120, currentY, { align: "center" });
    doc.text("0.00", 145, currentY, { align: "center" });
    doc.text(taxableVal, 170, currentY, { align: "center" });
    doc.text(itemTotalCalculated.toFixed(2), R, currentY, { align: "right" });

    currentY += blockHeight + 4;
  });

  doc.setLineWidth(0.3);
  doc.line(L, currentY, R, currentY);

  const fmtRs = (amount: number) => `Rs. ${amount.toFixed(2)}`;
  const summaryTaxable = rawSubtotal > 0 ? rawSubtotal : rawTotal - rawTax - rawShipping;
  const summaryIgst = rawTax > 0 ? rawTax : Math.max(0, rawTotal - summaryTaxable - rawShipping);

  // Payment + amount summary
  currentY += 8;
  const sectionTopY = currentY;
  const payBoxW = 88;
  const payBoxH = txnId ? 30 : 24;
  const totalsX = 108;
  const totalsW = R - totalsX;
  const summaryRows = 2 + (rawShipping > 0 ? 1 : 0) + 1;
  const totalsH = 8 + summaryRows * 5 + 6;

  doc.setDrawColor(212, 212, 212);
  doc.setLineWidth(0.3);
  doc.rect(L, sectionTopY, payBoxW, payBoxH);
  doc.setFillColor(139, 19, 19);
  doc.rect(L, sectionTopY, payBoxW, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details", L + 2, sectionTopY + 4.2);

  doc.setTextColor(51, 51, 51);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  let payY = sectionTopY + 9;
  doc.setFont("helvetica", "bold");
  doc.text("Method", L + 2, payY);
  doc.setFont("helvetica", "normal");
  doc.text(paymentMeth, L + 20, payY, { maxWidth: payBoxW - 22 });
  payY += 4.2;
  doc.setFont("helvetica", "bold");
  doc.text("Status", L + 2, payY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(paymentStat === "PAID" ? 21 : 180, paymentStat === "PAID" ? 128 : 83, paymentStat === "PAID" ? 61 : 9);
  doc.text(paymentStat, L + 20, payY);
  if (txnId) {
    payY += 4.2;
    doc.setTextColor(51, 51, 51);
    doc.setFont("helvetica", "bold");
    doc.text("Txn ID", L + 2, payY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);
    doc.text(String(txnId), L + 20, payY, { maxWidth: payBoxW - 22 });
  }

  doc.setDrawColor(212, 212, 212);
  doc.rect(totalsX, sectionTopY, totalsW, totalsH);
  doc.setFillColor(248, 244, 240);
  doc.rect(totalsX, sectionTopY, totalsW, 6, "F");
  doc.setTextColor(...primaryRgb);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Amount Summary", totalsX + 2, sectionTopY + 4.5);

  let sumY = sectionTopY + 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 51, 51);
  doc.text("Taxable Value:", totalsX + 2, sumY);
  doc.text(fmtRs(summaryTaxable), totalsX + totalsW - 2, sumY, { align: "right" });
  sumY += 5;
  doc.text("IGST:", totalsX + 2, sumY);
  doc.text(fmtRs(summaryIgst), totalsX + totalsW - 2, sumY, { align: "right" });
  if (rawShipping > 0) {
    sumY += 5;
    doc.text("Shipping:", totalsX + 2, sumY);
    doc.text(fmtRs(rawShipping), totalsX + totalsW - 2, sumY, { align: "right" });
  }
  sumY += 5.5;
  doc.setDrawColor(...primaryRgb);
  doc.line(totalsX + 2, sumY, R - 2, sumY);
  sumY += 4.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text("Grand Total:", totalsX + 2, sumY);
  doc.setFontSize(11);
  doc.setTextColor(...primaryRgb);
  doc.text(fmtRs(rawTotal), totalsX + totalsW - 2, sumY, { align: "right" });

  const sectionBottomY = Math.max(sectionTopY + payBoxH, sectionTopY + totalsH);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(119, 119, 119);
  doc.text(
    "This is a computer-generated tax invoice and does not require a physical signature.",
    L,
    sectionBottomY + 6,
    { maxWidth: R - L, align: "center" }
  );

  // Footer
  const footerY = 272;
  doc.setLineWidth(0.4);
  doc.line(L, footerY - 4, R, footerY - 4);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryRgb);
  doc.text(soldByName, R, footerY, { align: "right" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text("Thank you for shopping with SVastra!", R, footerY + 4, { align: "right" });

  doc.setFontSize(6.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`Regd. Office: ${soldByName}, ${soldByAddress}`, L, footerY, { maxWidth: 120 });
  doc.setFont("helvetica", "normal");
  doc.text(`Support: ${supportPhone} | ${supportEmail} | ${websiteUrl}`, L, footerY + 5);

  doc.setLineWidth(0.3);
  doc.line(L, footerY + 9, R, footerY + 9);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text("E. & O.E.", 165, footerY + 13);
  doc.setFont("helvetica", "normal");
  doc.text("page 1 of 1", R, footerY + 13, { align: "right" });

  doc.save(`Tax_Invoice_${invoiceNum}.pdf`);
};
