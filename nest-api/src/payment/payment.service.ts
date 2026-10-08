import {
  Injectable,
  Inject,
  BadRequestException,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, and, lte, inArray } from 'drizzle-orm';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { DRIZZLE } from '../database/database.provider';
import type { DrizzleDB } from '../database/database.provider';
import {
  orders,
  orderItems,
  carts,
  products,
  variants,
  orderTrackingRecords,
} from '../database/schema';
import { sql } from 'drizzle-orm';

import { OrdersService } from '../orders/orders.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ProductsService } from '../products/products.service';
import { validateAndSanitizeShippingAddress } from '../common/utils/address-validator';
import { getOrderSlug } from '../common/utils/slug.util';
import { calculateItemTax } from '../common/utils/tax.util';

// In-memory store for pending payment orders (single-server fallback)
const pendingOrders = new Map<string, any>();

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private razorpay: Razorpay;
  private keyId: string;
  private keySecret: string;
  private currency: string;

  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private config: ConfigService,
    private ordersService: OrdersService,
    private notificationsService: NotificationsService,
    @Inject(forwardRef(() => ProductsService)) private productsService: ProductsService,
  ) {
    /* 
     ===========================================================================
     RAZORPAY PAYMENT GATEWAY CONFIGURATION
     ===========================================================================
    */
    this.keyId = this.config.get<string>('RAZORPAY_KEY_ID') || process.env.RAZORPAY_KEY_ID || 'rzp_test_Tl2nTBopDxOys3';
    this.keySecret = this.config.get<string>('RAZORPAY_KEY_SECRET') || process.env.RAZORPAY_KEY_SECRET || 'etLGxPhuEDOmz9g5WfyZU3mK';
    this.currency = this.config.get<string>('RAZORPAY_CURRENCY') || process.env.RAZORPAY_CURRENCY || 'INR';

    this.razorpay = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });

    this.logger.log(`Razorpay Payment Service initialized [KeyID: ${this.keyId}, Currency: ${this.currency}]`);
  }

  private generateOrderNumber(): string {
    return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  async initiatePayment(userId: number, user: any, body: any) {
    // Proactively clean up any stale abandoned pending online payment sessions (>1 hour old)
    this.cleanupAbandonedOnlineOrders().catch(() => { });

    let cartItems: any[] = [];
    let isSingleItem = false;

    if (body.product_id && body.variant_id) {
      isSingleItem = true;
      const product = await this.db.query.products.findFirst({ where: eq(products.id, body.product_id) });
      const variant = await this.db.query.variants.findFirst({ where: eq(variants.id, body.variant_id) });

      if (!product || product.status === false) throw new BadRequestException('Sorry! The selected product is currently unavailable.');
      if (!variant || variant.status === false || variant.deletedAt !== null) throw new BadRequestException('Sorry! The selected variant is currently unavailable.');
      if (variant.productId !== product.id) throw new BadRequestException('Invalid variant for the selected product');
      if (variant.stock <= 0) {
        throw new BadRequestException(`Sorry! "${product.name}${variant.title ? ` (${variant.title})` : ''}" is currently out of stock.`);
      }
      if (variant.stock < body.quantity) {
        throw new BadRequestException(`Sorry! Only ${variant.stock} items are currently available for this product.`);
      }

      const itemTotal = parseFloat(variant.sp as string) * body.quantity;
      cartItems = [{
        product_id: product.id,
        variant_id: variant.id,
        quantity: body.quantity,
        price: variant.sp,
        total: itemTotal,
        selected_attributes: body.selected_attributes ?? null,
        variant_data: variant,
      }];
    } else {
      // Cart-based checkout
      const dbCartItems = await this.db.query.carts.findMany({
        where: eq(carts.userId, userId),
        with: { product: true, variant: true } as any,
      });

      let filtered = dbCartItems;
      if (body.cart_items?.length) {
        filtered = dbCartItems.filter((c: any) => body.cart_items.includes(c.id));
      }

      if (!filtered.length) throw new BadRequestException('Your cart is empty. Please add items before placing an order.');

      for (const item of filtered) {
        const freshProd = await this.db.query.products.findFirst({ where: eq(products.id, item.productId) });
        if (!freshProd || freshProd.status === false) {
          throw new BadRequestException(`Sorry! "${freshProd?.name || 'A product in your cart'}" is currently unavailable.`);
        }

        const freshVar = await this.db.query.variants.findFirst({ where: eq(variants.id, item.variantId) });
        if (!freshVar || freshVar.status === false || freshVar.deletedAt !== null) {
          throw new BadRequestException(`Sorry! The variant for "${freshProd.name}" is currently unavailable.`);
        }

        if (freshVar.stock <= 0) {
          throw new BadRequestException(`Sorry! "${freshProd.name}${freshVar.title ? ` (${freshVar.title})` : ''}" is currently out of stock. Please remove it from your cart.`);
        }

        if (freshVar.stock < item.quantity) {
          throw new BadRequestException(`Sorry! Only ${freshVar.stock} items are currently available for "${freshProd.name}${freshVar.title ? ` (${freshVar.title})` : ''}". You requested ${item.quantity}.`);
        }
      }

      cartItems = filtered.map((item: any) => {
        const unitPrice = parseFloat(item.variant?.sp ?? item.product?.sp ?? '0');
        return {
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
          price: unitPrice.toFixed(2),
          total: (unitPrice * item.quantity).toFixed(2),
          selected_attributes: item.selectedAttributes,
          variant_data: item.variant,
        };
      });
    }

    // Validate and sanitize shipping address
    const { sanitizedAddress } = validateAndSanitizeShippingAddress(body.shipping_address);

    let subtotalTaxable = 0;
    let totalTax = 0;
    let totalShippingFee = 0;
    const itemsWithTax: any[] = [];

    for (const item of cartItems) {
      const hydratedProd = (await this.productsService.findProductWithRelations(item.product_id)) || null;
      const unitPrice = parseFloat(String(item.price));
      const itemTaxable = unitPrice * item.quantity;
      const itemTax = calculateItemTax(hydratedProd, itemTaxable, sanitizedAddress, true);
      const vShip = parseFloat(String(item.variant_data?.shippingCharges || '0')) || 0;

      subtotalTaxable += itemTaxable;
      totalTax += parseFloat(itemTax.taxAmount);
      totalShippingFee += vShip * item.quantity;

      itemsWithTax.push({
        item,
        unitPrice,
        itemTaxable,
        itemTax,
        variantShipFee: vShip,
      });
    }

    const total = subtotalTaxable + totalTax + totalShippingFee;
    const orderNumber = this.generateOrderNumber();
    const invoiceNumber = await this.ordersService.generateUniqueInvoiceNumber();

    // Store pending order in DB so it is persistent across server restarts
    const [r] = await this.db.insert(orders).values({
      orderNumber,
      invoiceNumber,
      userId,
      status: 'pending',
      paymentMethod: 'online',
      paymentStatus: 'pending',
      subtotal: subtotalTaxable.toFixed(2),
      shippingFee: totalShippingFee.toFixed(2),
      tax: totalTax.toFixed(2),
      total: total.toFixed(2),
      shippingAddress: sanitizedAddress,
      billingAddress: body.billing_address ? validateAndSanitizeShippingAddress(body.billing_address).sanitizedAddress : sanitizedAddress,
      notes: body.notes ?? null,
    }).$returningId();

    for (const { item, itemTax, variantShipFee } of itemsWithTax) {
      await this.db.insert(orderItems).values({
        orderId: r.id,
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        price: String(item.price),
        total: itemTax.grossAmount,
        selectedAttributes: item.selected_attributes ?? null,
        hsn: itemTax.hsn,
        taxRate: itemTax.taxRate,
        taxableAmount: itemTax.taxableAmount,
        taxAmount: itemTax.taxAmount,
        cgstRate: itemTax.cgstRate,
        cgstAmount: itemTax.cgstAmount,
        sgstRate: itemTax.sgstRate,
        sgstAmount: itemTax.sgstAmount,
        igstRate: itemTax.igstRate,
        igstAmount: itemTax.igstAmount,
        isCodAllowed: item.variant_data?.isCodAllowed !== false,
        isReturnable: item.variant_data?.isReturnable !== false,
        returnWindowDays: Number(item.variant_data?.returnWindowDays ?? 7),
        shippingCharge: variantShipFee.toFixed(2),
      });
    }

    // Keep memory fallback
    pendingOrders.set(orderNumber, {
      cart_items: cartItems,
      is_single_item: isSingleItem,
      shipping_address: sanitizedAddress,
      billing_address: body.billing_address ? validateAndSanitizeShippingAddress(body.billing_address).sanitizedAddress : sanitizedAddress,
      notes: body.notes ?? null,
      subtotal: subtotalTaxable,
      shipping_fee: totalShippingFee,
      tax: totalTax,
      total,
      user_id: userId,
      cart_item_ids: body.cart_items ?? [],
      db_order_id: r.id,
    });

    const customerPhoneRaw = user.phoneNumber ?? user.phone_number ?? body.phone ?? '9999999999';
    const cleanCustomerPhone = customerPhoneRaw.replace(/[^0-9]/g, '').slice(-10) || '9999999999';
    const customerEmail = user.email ?? body.email ?? 'customer@example.com';
    const customerName = user.name ?? body.name ?? 'Customer';

    const amountInPaise = Math.round(total * 100);
    this.logger.log(`[RAZORPAY_DEBUG][1. INITIATE_START] Order: ${orderNumber} | User ID: ${userId} | Amount: ₹${total.toFixed(2)} (${amountInPaise} paise)`);

    let rzpOrder: any;
    try {
      rzpOrder = await this.razorpay.orders.create({
        amount: amountInPaise,
        currency: this.currency,
        receipt: orderNumber,
        notes: {
          order_number: orderNumber,
          user_id: String(userId),
          customer_name: customerName,
          customer_email: customerEmail,
        },
      });
    } catch (rzpErr: any) {
      this.logger.error(`[RAZORPAY_DEBUG][INITIATE_FAILED] Order ${orderNumber}: ${rzpErr.message}`, rzpErr);
      await this.db.delete(orderItems).where(eq(orderItems.orderId, r.id)).catch(() => { });
      await this.db.delete(orders).where(eq(orders.id, r.id)).catch(() => { });
      pendingOrders.delete(orderNumber);
      throw new BadRequestException(rzpErr.error?.description || rzpErr.message || 'Failed to initialize Razorpay payment');
    }

    this.logger.log(`[RAZORPAY_DEBUG][2. RAZORPAY_ORDER_CREATED] Order ID: ${rzpOrder.id} for Order #${orderNumber} | Amount: ${rzpOrder.amount} paise | Currency: ${rzpOrder.currency}`);

    return {
      success: true,
      order_number: orderNumber,
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount, // in paise
      amount_in_rupees: parseFloat(total.toFixed(2)),
      currency: rzpOrder.currency,
      key_id: this.keyId,
      customer: {
        id: String(userId),
        name: customerName,
        email: customerEmail,
        contact: cleanCustomerPhone,
      },
      shipping_address: sanitizedAddress,
    };
  }

  /**
   * Cancel a pending payment order when the checkout modal is dismissed or user
   * abandons before payment completes. Cleans up the pending DB record.
   */
  async cancelPayment(userId: number, orderNumber: string): Promise<any> {
    const existingOrder = await this.db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber),
    });

    if (!existingOrder) {
      pendingOrders.delete(orderNumber);
      return { success: true, message: 'Order not found or already cancelled.' };
    }

    if (existingOrder.userId !== userId) {
      throw new BadRequestException('You do not have permission to cancel this order.');
    }

    if (existingOrder.paymentStatus === 'paid') {
      return { success: false, message: 'Cannot cancel an already-paid order.' };
    }

    await this.db.delete(orderItems).where(eq(orderItems.orderId, existingOrder.id)).catch(() => { });
    await this.db.delete(orderTrackingRecords).where(eq(orderTrackingRecords.orderId, existingOrder.id)).catch(() => { });
    await this.db.delete(orders).where(eq(orders.id, existingOrder.id)).catch(() => { });
    pendingOrders.delete(orderNumber);

    this.logger.log(`[CANCEL] Cancelled pending order #${existingOrder.id} (${orderNumber}) for user ${userId}`);
    return { success: true, message: 'Pending payment order cancelled successfully.' };
  }

  async verifyPayment(body: any): Promise<any> {
    const orderNumber =
      body.order_id ||
      body.order_number ||
      body.notes?.order_number ||
      body.payload?.payment?.entity?.notes?.order_number ||
      body.data?.order_id;

    const razorpayOrderId =
      body.razorpay_order_id ||
      body.payload?.payment?.entity?.order_id;

    const razorpayPaymentId =
      body.razorpay_payment_id ||
      body.payment_id ||
      body.payload?.payment?.entity?.id;

    const razorpaySignature =
      body.razorpay_signature ||
      body.signature;

    if (!orderNumber && !razorpayOrderId) {
      throw new BadRequestException('Order ID is required for payment verification.');
    }

    this.logger.log(`[RAZORPAY_DEBUG][3. VERIFY_PAYMENT_START] Order: ${orderNumber || razorpayOrderId} | Payment ID: ${razorpayPaymentId} | Razorpay Order ID: ${razorpayOrderId} | Signature: ${razorpaySignature ? 'PRESENT' : 'MISSING'}`);

    // Check if order exists in DB
    const existingOrder = await this.db.query.orders.findFirst({
      where: orderNumber ? eq(orders.orderNumber, orderNumber) : undefined,
      with: { orderItems: true } as any,
    });

    if (existingOrder && existingOrder.paymentStatus === 'paid') {
      this.logger.log(`[RAZORPAY_DEBUG][ALREADY_PAID] Order ${orderNumber} is already marked PAID`);
      return { success: true, status: 'PAID', data: existingOrder };
    }

    let isPaymentValid = false;

    // 1. HMAC SHA-256 signature verification
    if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature === razorpaySignature) {
        this.logger.log(`[RAZORPAY_DEBUG][4. SIGNATURE_VERIFIED] Match: true | Order: ${orderNumber}`);
        isPaymentValid = true;
      } else {
        this.logger.error(`[RAZORPAY_DEBUG][4. SIGNATURE_MISMATCH] Expected: ${generatedSignature} | Received: ${razorpaySignature}`);
        isPaymentValid = false;
      }
    }

    // 2. Fetch payment details from Razorpay to verify status & amount
    let paymentDetails: any = null;
    if (razorpayPaymentId) {
      try {
        paymentDetails = await (this.razorpay.payments as any).fetch(razorpayPaymentId);
        const pStatus = (paymentDetails?.status || '').toLowerCase();
        this.logger.log(`[RAZORPAY_DEBUG][5. FETCHED_STATUS] Payment ID: ${razorpayPaymentId} | Status: ${pStatus} | Method: ${paymentDetails?.method} | Bank: ${paymentDetails?.bank || 'N/A'}`);

        if (pStatus === 'captured') {
          isPaymentValid = true;
        } else if (pStatus === 'authorized') {
          try {
            const captured = await (this.razorpay.payments as any).capture(
              razorpayPaymentId,
              paymentDetails.amount,
              paymentDetails.currency || 'INR',
            );
            if (captured && captured.status === 'captured') {
              isPaymentValid = true;
              paymentDetails = captured;
            }
          } catch (capErr: any) {
            this.logger.warn(`Razorpay payment capture note: ${capErr.message}`);
            isPaymentValid = true;
          }
        } else if (['failed', 'refunded'].includes(pStatus)) {
          isPaymentValid = false;
        }
      } catch (fetchErr: any) {
        this.logger.warn(`Could not fetch Razorpay payment ${razorpayPaymentId}: ${fetchErr.message}`);
      }
    }

    const transactionId = razorpayPaymentId || `RZP-${Date.now()}`;

    if (isPaymentValid) {
      // Validate amount to prevent client tampering
      const expectedTotal = parseFloat(String(existingOrder?.total || pendingOrders.get(orderNumber)?.total || '0'));
      if (paymentDetails?.amount && expectedTotal > 0) {
        const expectedPaise = Math.round(expectedTotal * 100);
        if (paymentDetails.amount < expectedPaise) {
          this.logger.error(`Razorpay amount mismatch for ${orderNumber}: paid ${paymentDetails.amount} paise, expected ${expectedPaise} paise`);
          throw new BadRequestException('Paid amount does not match the order total.');
        }
      }

      const targetUserId = existingOrder ? existingOrder.userId : pendingOrders.get(orderNumber)?.user_id;

      if (!existingOrder && !pendingOrders.has(orderNumber)) {
        this.logger.error(`Pending order data not found for: ${orderNumber}`);
        throw new BadRequestException('Order session expired. Please contact support.');
      }

      const itemsList = existingOrder ? (existingOrder as any).orderItems : pendingOrders.get(orderNumber)?.cart_items;

      // Deduct stock for all items
      const deductedVariants: { variantId: number; productId: number }[] = [];
      for (const item of itemsList) {
        const vId = item.variantId ?? item.variant_id;
        const pId = item.productId ?? item.product_id;
        const qty = item.quantity;
        await this.db.update(variants).set({ stock: sql`stock - ${qty}` }).where(eq(variants.id, vId));
        if (vId && pId) {
          deductedVariants.push({ variantId: Number(vId), productId: Number(pId) });
        }
      }

      if (deductedVariants.length > 0) {
        this.ordersService.broadcastVariantStockUpdates(deductedVariants).catch(err => this.logger.error('Failed to broadcast stock updates on payment success:', err));
      }

      if (existingOrder) {
        const invNum = existingOrder.invoiceNumber || await this.ordersService.generateUniqueInvoiceNumber();
        await this.db.update(orders).set({
          paymentStatus: 'paid',
          status: 'pending',
          invoiceNumber: invNum,
          transactionId: String(transactionId),
        }).where(eq(orders.id, existingOrder.id));

        await this.db.insert(orderTrackingRecords).values({
          orderId: existingOrder.id,
          status: 'pending',
          description: 'Online payment received successfully via Razorpay - Awaiting admin confirmation',
          location: 'Online Store',
          trackedAt: new Date(),
        });

        // Clear cart for user
        if (targetUserId) {
          await this.db.delete(carts).where(eq(carts.userId, targetUserId));
        }

        pendingOrders.delete(orderNumber);

        // Send Order Placed Email
        this.ordersService.sendOrderPlacedEmail(existingOrder.id).catch(err => this.logger.error('Failed to send order placed email:', err));

        const updatedOrder = await this.db.query.orders.findFirst({
          where: eq(orders.id, existingOrder.id),
          with: { orderItems: { with: { product: true, variant: true } as any } } as any,
        });

        const paymentOrderSlug = getOrderSlug(updatedOrder) || updatedOrder?.orderNumber || existingOrder.orderNumber;

        // Emit real-time notification to Customer
        if (targetUserId) {
          this.notificationsService.createAndEmitNotification({
            userId: targetUserId,
            recipientGroup: 'customer',
            title: '🎉 Order Placed Successfully',
            message: `Your order #${updatedOrder?.orderNumber || existingOrder.orderNumber} for ₹${(updatedOrder as any)?.total || existingOrder.total} has been received!`,
            type: 'ORDER_PLACED',
            priority: 'HIGH',
            entityType: 'order',
            entityId: existingOrder.id,
            referenceKey: `ORDER_PLACED_${existingOrder.id}`,
            link: `/orders/${paymentOrderSlug}`,
            metadata: { orderId: existingOrder.id, orderNumber: updatedOrder?.orderNumber || existingOrder.orderNumber, totalAmount: (updatedOrder as any)?.total }
          }).catch(err => this.logger.error('Failed to emit customer order notification:', err));
        }

        // Emit real-time notification to Admin Dashboard
        this.notificationsService.createAndEmitNotification({
          recipientGroup: 'admin',
          title: '🛒 New Order Placed (Razorpay)',
          message: `New order #${updatedOrder?.orderNumber || existingOrder.orderNumber} placed for ₹${(updatedOrder as any)?.total || existingOrder.total}`,
          type: 'ORDER_PLACED',
          priority: 'HIGH',
          entityType: 'order',
          entityId: existingOrder.id,
          referenceKey: `ADMIN_ORDER_PLACED_${existingOrder.id}`,
          link: `/dashboard/orders/${paymentOrderSlug}`,
          metadata: { orderId: existingOrder.id, orderNumber: updatedOrder?.orderNumber || existingOrder.orderNumber, totalAmount: (updatedOrder as any)?.total }
        }).catch(err => this.logger.error('Failed to emit admin order notification:', err));

        return { success: true, status: 'PAID', data: updatedOrder };
      } else {
        // Fallback memory creation if DB order was absent
        const pendingData = pendingOrders.get(orderNumber);
        const invNum = await this.ordersService.generateUniqueInvoiceNumber();
        const [r] = await this.db.insert(orders).values({
          orderNumber,
          invoiceNumber: invNum,
          userId: pendingData.user_id,
          status: 'pending',
          paymentMethod: 'online',
          paymentStatus: 'paid',
          subtotal: pendingData.subtotal.toFixed(2),
          shippingFee: (pendingData.shipping_fee || 0).toFixed(2),
          tax: (pendingData.tax || 0).toFixed(2),
          total: pendingData.total.toFixed(2),
          shippingAddress: pendingData.shipping_address,
          billingAddress: pendingData.billing_address,
          notes: pendingData.notes,
          transactionId: String(transactionId),
        }).$returningId();

        for (const item of pendingData.cart_items) {
          const hydratedProd = (await this.productsService.findProductWithRelations(item.product_id)) || null;
          const unitPrice = parseFloat(String(item.price));
          const itemTaxable = unitPrice * item.quantity;
          const itemTax = calculateItemTax(hydratedProd, itemTaxable, pendingData.shipping_address, true);

          await this.db.insert(orderItems).values({
            orderId: r.id,
            productId: item.product_id,
            variantId: item.variant_id,
            quantity: item.quantity,
            price: String(item.price),
            total: itemTax.grossAmount,
            selectedAttributes: item.selected_attributes ?? null,
            hsn: itemTax.hsn,
            taxRate: itemTax.taxRate,
            taxableAmount: itemTax.taxableAmount,
            taxAmount: itemTax.taxAmount,
            cgstRate: itemTax.cgstRate,
            cgstAmount: itemTax.cgstAmount,
            sgstRate: itemTax.sgstRate,
            sgstAmount: itemTax.sgstAmount,
            igstRate: itemTax.igstRate,
            igstAmount: itemTax.igstAmount,
            isCodAllowed: item.variant_data?.isCodAllowed !== false,
            isReturnable: item.variant_data?.isReturnable !== false,
            returnWindowDays: Number(item.variant_data?.returnWindowDays ?? 7),
            shippingCharge: (parseFloat(String(item.variant_data?.shippingCharges || '0')) || 0).toFixed(2),
          });
        }

        await this.db.insert(orderTrackingRecords).values({
          orderId: r.id,
          status: 'pending',
          description: 'Online payment received successfully via Razorpay - Awaiting admin confirmation',
          location: 'Online Store',
          trackedAt: new Date(),
        });

        await this.db.delete(carts).where(eq(carts.userId, pendingData.user_id));
        pendingOrders.delete(orderNumber);

        this.ordersService.sendOrderPlacedEmail(r.id).catch(err => this.logger.error('Failed to send order placed email:', err));

        const createdOrder = await this.db.query.orders.findFirst({
          where: eq(orders.id, r.id),
          with: { orderItems: { with: { product: true, variant: true } as any } } as any,
        });

        const fallbackOrderSlug = getOrderSlug(createdOrder) || createdOrder?.orderNumber || orderNumber;

        // Emit notifications
        this.notificationsService.createAndEmitNotification({
          userId: pendingData.user_id,
          recipientGroup: 'customer',
          title: '🎉 Order Placed Successfully',
          message: `Your order #${createdOrder?.orderNumber || orderNumber} for ₹${(createdOrder as any)?.total || pendingData.total} has been received!`,
          type: 'ORDER_PLACED',
          priority: 'HIGH',
          entityType: 'order',
          entityId: r.id,
          referenceKey: `ORDER_PLACED_${r.id}`,
          link: `/orders/${fallbackOrderSlug}`,
          metadata: { orderId: r.id, orderNumber: createdOrder?.orderNumber || orderNumber, totalAmount: (createdOrder as any)?.total }
        }).catch(err => this.logger.error('Failed to emit customer order notification:', err));

        this.notificationsService.createAndEmitNotification({
          recipientGroup: 'admin',
          title: '🛒 New Order Placed (Razorpay)',
          message: `New order #${createdOrder?.orderNumber || orderNumber} placed for ₹${(createdOrder as any)?.total || pendingData.total}`,
          type: 'ORDER_PLACED',
          priority: 'HIGH',
          entityType: 'order',
          entityId: r.id,
          referenceKey: `ADMIN_ORDER_PLACED_${r.id}`,
          link: `/dashboard/orders/${fallbackOrderSlug}`,
          metadata: { orderId: r.id, orderNumber: createdOrder?.orderNumber || orderNumber, totalAmount: (createdOrder as any)?.total }
        }).catch(err => this.logger.error('Failed to emit admin order notification:', err));

        return { success: true, status: 'PAID', data: createdOrder };
      }
    } else {
      // Payment FAILED / CANCELLED
      if (existingOrder && existingOrder.paymentStatus !== 'paid') {
        await this.db.delete(orderItems).where(eq(orderItems.orderId, existingOrder.id)).catch(() => { });
        await this.db.delete(orderTrackingRecords).where(eq(orderTrackingRecords.orderId, existingOrder.id)).catch(() => { });
        await this.db.delete(orders).where(eq(orders.id, existingOrder.id)).catch(() => { });
        this.logger.log(`[CLEANUP] Deleted unpaid/cancelled pending order #${existingOrder.id} (${orderNumber})`);
      }
      pendingOrders.delete(orderNumber);
      return {
        success: false,
        status: 'FAILED',
        message: 'Payment was not successful. Your order was not placed and no amount was charged.',
      };
    }
  }

  // ─── Proactive cleanup for abandoned unpaid online payment sessions ────────
  async cleanupAbandonedOnlineOrders(): Promise<void> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const staleOrders = await this.db.select({ id: orders.id }).from(orders).where(
        and(
          eq(orders.paymentMethod, 'online'),
          eq(orders.paymentStatus, 'pending'),
          lte(orders.createdAt, oneHourAgo),
        ),
      );
      if (staleOrders.length > 0) {
        const staleIds = staleOrders.map(o => o.id);
        await this.db.delete(orderItems).where(inArray(orderItems.orderId, staleIds)).catch(() => { });
        await this.db.delete(orderTrackingRecords).where(inArray(orderTrackingRecords.orderId, staleIds)).catch(() => { });
        await this.db.delete(orders).where(inArray(orders.id, staleIds)).catch(() => { });
        this.logger.log(`[CLEANUP] Purged ${staleIds.length} stale abandoned online payment order(s)`);
      }
    } catch (err: any) {
      this.logger.warn(`Failed to cleanup abandoned online orders: ${err.message}`);
    }
  }

  async testCredentials() {
    return {
      gateway: 'razorpay',
      key_id: this.keyId,
      key_secret_preview: this.keySecret ? this.keySecret.substring(0, 8) + '...' : 'not-set',
      currency: this.currency,
      credentials_loaded: !!(this.keyId && this.keySecret),
    };
  }

  async refundPayment(paymentId: string, amount: number, notes?: any) {
    return (this.razorpay.payments as any).refund(paymentId, {
      amount: Math.round(amount * 100),
      notes,
    });
  }

  /**
   * Diagnostic: Called by the frontend when Razorpay fires `payment.failed`.
   * Logs the client error and cross-checks it with Razorpay's server record.
   */
  async logClientFailure(userId: number, body: any): Promise<any> {
    const clientError = body?.error || {};
    const paymentId = clientError?.metadata?.payment_id || body?.payment_id;

    this.logger.error(
      `[RAZORPAY_DEBUG][CLIENT_PAYMENT_FAILED] User: ${userId} | Order: ${body?.order_number} | RzpOrder: ${body?.razorpay_order_id} | ` +
      `Code: ${clientError.code} | Source: ${clientError.source} | Step: ${clientError.step} | Reason: ${clientError.reason} | ` +
      `Description: ${clientError.description}`,
    );

    let serverRecord: any = null;
    if (paymentId) {
      try {
        const p: any = await (this.razorpay.payments as any).fetch(paymentId);
        serverRecord = {
          id: p.id,
          status: p.status,
          method: p.method,
          international: p.international,
          error_code: p.error_code,
          error_description: p.error_description,
          error_source: p.error_source,
          error_step: p.error_step,
          error_reason: p.error_reason,
        };
        this.logger.error(`[RAZORPAY_DEBUG][SERVER_PAYMENT_RECORD] ${JSON.stringify(serverRecord)}`);
      } catch (e: any) {
        this.logger.warn(`[RAZORPAY_DEBUG][SERVER_PAYMENT_RECORD_UNAVAILABLE] ${paymentId}: ${e?.message}`);
      }
    }
    return { success: true, server_record: serverRecord };
  }

  /**
   * Diagnostic: Query Razorpay API directly for enabled payment methods on this key.
   * Useful to verify why UPI, Cards, Netbanking, or Wallets show or do not show.
   */
  async getAvailableMethods(): Promise<any> {
    try {
      const https = require('https');
      const response = await new Promise<any>((resolve, reject) => {
        https.get(`https://api.razorpay.com/v1/methods?key_id=${this.keyId}`, (res: any) => {
          let data = '';
          res.on('data', (chunk: any) => (data += chunk));
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });

      const upiEnabled = response.upi === true;
      const cardEnabled = response.card === true;
      const netbankingBanks = typeof response.netbanking === 'object' ? Object.keys(response.netbanking).length : 0;
      const wallets = response.wallet ? Object.keys(response.wallet).filter(k => response.wallet[k] === true) : [];

      this.logger.log(`[RAZORPAY_DEBUG][METHODS] UPI: ${upiEnabled} | Cards: ${cardEnabled} | Netbanking Banks: ${netbankingBanks} | Wallets: ${wallets.join(', ')}`);

      return {
        success: true,
        key_id: this.keyId,
        upi_enabled: upiEnabled,
        card_enabled: cardEnabled,
        netbanking_banks_count: netbankingBanks,
        wallets_enabled: wallets,
        upi_diagnostic: upiEnabled
          ? 'UPI is ENABLED for this Razorpay account.'
          : 'UPI is DISABLED for merchant key ' + this.keyId + '. To enable UPI, open Razorpay Dashboard (https://dashboard.razorpay.com) -> Settings -> Payment Methods -> UPI and activate it.',
      };
    } catch (err: any) {
      this.logger.error(`[RAZORPAY_DEBUG][METHODS_ERROR] ${err.message}`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Diagnostic: Fetch the last 10 payment attempts directly from Razorpay
   * with their exact status, error code, and error reason.
   */
  async getRecentPaymentAttempts(): Promise<any> {
    try {
      const list = await this.razorpay.payments.all({ count: 10 });
      const formatted = list.items.map((p: any) => ({
        id: p.id,
        order_id: p.order_id,
        status: p.status,
        method: p.method,
        bank: p.bank,
        wallet: p.wallet,
        vpa: p.vpa,
        amount: (p.amount / 100).toFixed(2),
        currency: p.currency,
        error_code: p.error_code,
        error_description: p.error_description,
        error_source: p.error_source,
        error_step: p.error_step,
        error_reason: p.error_reason,
        created_at: new Date(p.created_at * 1000).toLocaleString(),
      }));

      this.logger.log(`[RAZORPAY_DEBUG][RECENT_ATTEMPTS] Fetched ${formatted.length} recent payment records`);
      return {
        success: true,
        count: formatted.length,
        attempts: formatted,
      };
    } catch (err: any) {
      this.logger.error(`[RAZORPAY_DEBUG][RECENT_ATTEMPTS_ERROR] ${err.message}`, err);
      return { success: false, error: err.message };
    }
  }
}
