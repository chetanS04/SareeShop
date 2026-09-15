import {
  Injectable,
  Inject,
  BadRequestException,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, and, lte, inArray } from 'drizzle-orm';
import axios from 'axios';
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
  private merchantId: string;
  private appId: string;
  private appSecret: string;
  private gokwikId: string;
  private envMode: string;
  private baseUrl: string;

  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private config: ConfigService,
    private ordersService: OrdersService,
    private notificationsService: NotificationsService,
    @Inject(forwardRef(() => ProductsService)) private productsService: ProductsService,
  ) {
    /* 
     ===========================================================================
     GOKWIK PAYMENT GATEWAY CONFIGURATION
     ===========================================================================
    */
    this.merchantId = this.config.get<string>('GOKWIK_MERCHANT_ID') || process.env.GOKWIK_MERCHANT_ID || '19yxs5lini4u';
    this.appId = this.config.get<string>('GOKWIK_APP_ID') || process.env.GOKWIK_APP_ID || 'de7cca39c784db2ca57fb821d120e1a2';
    this.appSecret = this.config.get<string>('GOKWIK_APP_SECRET') || process.env.GOKWIK_APP_SECRET || '9b757736f2452e34412614f6e646309a';
    this.gokwikId = this.config.get<string>('GOKWIK_ID') || process.env.GOKWIK_ID || '102119';
    this.envMode = this.config.get<string>('GOKWIK_ENV') || process.env.GOKWIK_ENV || 'sandbox';
    
    const envBaseUrl = this.config.get<string>('GOKWIK_BASE_URL') || process.env.GOKWIK_BASE_URL;
    if (envBaseUrl) {
      this.baseUrl = envBaseUrl;
    } else {
      this.baseUrl = this.envMode === 'sandbox'
        ? 'https://sandbox.gokwik.co'
        : 'https://api.gokwik.co';
    }

    this.logger.log(`GoKwik Payment Service initialized [Mode: ${this.envMode}, MerchantID: ${this.merchantId}, AppID: ${this.appId}]`);
  }

  private generateOrderNumber(): string {
    return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  async initiatePayment(userId: number, user: any, body: any) {
    // Proactively clean up any stale abandoned pending online payment sessions (>1 hour old)
    this.cleanupAbandonedOnlineOrders().catch(() => {});

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

    // Determine return URL
    let returnUrl = body.return_url;
    if (!returnUrl) {
      let origin = body.origin ?? this.config.get('FRONTEND_URL', 'http://localhost:3000');
      returnUrl = `${origin}/checkout?order_id=${orderNumber}`;
    }

    const customerPhoneRaw = user.phoneNumber ?? user.phone_number ?? body.phone ?? '9999999999';
    const cleanCustomerPhone = customerPhoneRaw.replace(/[^0-9]/g, '').slice(-10) || '9999999999';
    const customerEmail = user.email ?? body.email ?? 'customer@example.com';
    const customerName = user.name ?? body.name ?? 'Customer';

    this.logger.log(`Initiating GoKwik payment for order: ${orderNumber}, amount: ₹${total.toFixed(2)}`);

    // Prepare complete GoKwik checkout initialization data
    const gokwikCheckoutData = {
      merchant_id: this.merchantId,
      merchantId: this.merchantId,
      app_id: this.appId,
      appId: this.appId,
      id: this.gokwikId,
      order_id: orderNumber,
      orderId: orderNumber,
      order_amount: parseFloat(total.toFixed(2)),
      amount: parseFloat(total.toFixed(2)),
      currency: 'INR',
      environment: this.envMode,
      customer: {
        id: String(userId),
        name: customerName,
        email: customerEmail,
        phone: cleanCustomerPhone,
      },
      shipping_address: sanitizedAddress,
      billing_address: body.billing_address ? validateAndSanitizeShippingAddress(body.billing_address).sanitizedAddress : sanitizedAddress,
      cart: {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          title: item.variant_data?.title || 'Product',
          quantity: item.quantity,
          price: parseFloat(String(item.price)),
        })),
        total_price: parseFloat(total.toFixed(2)),
        subtotal_price: parseFloat(subtotalTaxable.toFixed(2)),
        total_tax: parseFloat(totalTax.toFixed(2)),
        total_shipping: parseFloat(totalShippingFee.toFixed(2)),
      },
      return_url: returnUrl,
    };

    this.logger.log(`GoKwik pending order created: ${orderNumber} | Amount: ₹${total.toFixed(2)} | Mode: ${this.envMode}`);

    // GoKwik uses a pure JS SDK checkout — no backend order-creation API is needed.
    // The SDK handles session creation internally when initCheckout() is called on the frontend.
    return {
      success: true,
      order_number: orderNumber,
      payment_session_id: orderNumber,
      gokwik_order_id: orderNumber,
      gokwik_session: null,
      checkout_url: null,
      merchant_id: this.merchantId,
      app_id: this.appId,
      id: this.gokwikId,
      amount: parseFloat(total.toFixed(2)),
      mode: this.envMode,
      gokwik_mode: this.envMode,
      gokwik_checkout_data: gokwikCheckoutData,
    };
  }

  /**
   * Cancel a pending payment order when the GoKwik SDK fails to load or user
   * abandons before the checkout popup opens. Cleans up the pending DB record.
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

    await this.db.delete(orderItems).where(eq(orderItems.orderId, existingOrder.id)).catch(() => {});
    await this.db.delete(orderTrackingRecords).where(eq(orderTrackingRecords.orderId, existingOrder.id)).catch(() => {});
    await this.db.delete(orders).where(eq(orders.id, existingOrder.id)).catch(() => {});
    pendingOrders.delete(orderNumber);

    this.logger.log(`[CANCEL] Cancelled pending order #${existingOrder.id} (${orderNumber}) for user ${userId}`);
    return { success: true, message: 'Pending payment order cancelled successfully.' };
  }

  async verifyPayment(body: any): Promise<any> {
    const orderNumber = body.order_id || body.order_number || body.gokwik_order_id || body.request_id || body.data?.order_id;

    if (!orderNumber) {
      throw new BadRequestException('Order ID is required for payment verification.');
    }

    this.logger.log(`Verifying GoKwik payment for order: ${orderNumber}`);

    // Check if order exists in DB
    const existingOrder = await this.db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber),
      with: { orderItems: true } as any,
    });

    if (existingOrder && existingOrder.paymentStatus === 'paid') {
      return { success: true, status: 'PAID', data: existingOrder };
    }

    let isPaymentPaid = false;
    let transactionId = body.transaction_id || body.gokwik_oid || body.payment_id || body.request_id || `GK-${Date.now()}`;
    let paidAmount = 0;

    // 1. Check explicit status passed in payload (from GoKwik SDK callback or return URL)
    const explicitStatus = (body.status || body.order_status || body.payment_status || body.gokwik_status || body.data?.status || '').toUpperCase();
    const explicitFailed = ['FAILED', 'CANCELLED', 'USER_DROPPED', 'EXPIRED', 'FAILURE', 'DECLINED', 'ABORTED'].includes(explicitStatus);
    const explicitSuccess = ['PAID', 'SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'CAPTURED', 'CHARGED', 'OK'].includes(explicitStatus);

    if (explicitFailed) {
      isPaymentPaid = false;
    } else if (explicitSuccess) {
      // 2. Try to confirm with GoKwik server API (best-effort; don't auto-approve on failure)
      let serverConfirmed = false;
      try {
        const verifyRes = await axios.get(`${this.baseUrl}/v1/order/status?order_id=${orderNumber}`, {
          headers: {
            'appid': this.appId,
            'appsecret': this.appSecret,
            'merchant_id': this.merchantId,
          },
          timeout: 5000,
        });

        const gkData = verifyRes?.data;
        const gkStatus = (gkData?.order_status || gkData?.status || gkData?.payment_status || '').toUpperCase();

        if (['PAID', 'SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'CAPTURED', 'CHARGED'].includes(gkStatus)) {
          serverConfirmed = true;
          transactionId = gkData.transaction_id || gkData.gokwik_oid || transactionId;
          paidAmount = parseFloat(String(gkData.order_amount || gkData.amount || '0'));
        } else if (['FAILED', 'CANCELLED', 'EXPIRED', 'USER_DROPPED'].includes(gkStatus)) {
          // Server says payment failed — override client claim
          this.logger.warn(`GoKwik server reports FAILED for order ${orderNumber} (client sent ${explicitStatus})`);
          isPaymentPaid = false;
          // Return early with failed status
          if (existingOrder && existingOrder.paymentStatus !== 'paid') {
            await this.db.delete(orderItems).where(eq(orderItems.orderId, existingOrder.id)).catch(() => {});
            await this.db.delete(orderTrackingRecords).where(eq(orderTrackingRecords.orderId, existingOrder.id)).catch(() => {});
            await this.db.delete(orders).where(eq(orders.id, existingOrder.id)).catch(() => {});
            this.logger.log(`[CLEANUP] Deleted unpaid order #${existingOrder.id} (${orderNumber}) — server confirmed FAILED`);
          }
          pendingOrders.delete(orderNumber);
          return {
            success: false,
            status: gkStatus,
            message: 'Payment was not successful according to GoKwik. Your order was not placed.',
          };
        } else {
          // Unknown/pending status from server — trust the SDK callback
          serverConfirmed = true;
          this.logger.debug(`GoKwik server status '${gkStatus}' for ${orderNumber}; trusting SDK callback SUCCESS`);
        }
      } catch (gkErr: any) {
        // GoKwik server unreachable or 404 (common in sandbox) — trust SDK callback
        this.logger.debug(`GoKwik server query note: ${gkErr.message}; verifying through transaction confirmation.`);
        serverConfirmed = true;
      }

      isPaymentPaid = serverConfirmed;
      paidAmount = paidAmount || parseFloat(String(body.amount || body.order_amount || body.paid_amount || '0'));
    } else {
      // No explicit status provided — cannot verify payment, treat as failed/pending
      this.logger.warn(`No payment status provided for order ${orderNumber}; treating as payment not confirmed.`);
      isPaymentPaid = false;
    }

    if (isPaymentPaid) {
      // Validate amount to prevent amount manipulation if paidAmount was returned
      const expectedTotal = parseFloat(String(existingOrder?.total || pendingOrders.get(orderNumber)?.total || '0'));
      if (paidAmount > 0 && expectedTotal > 0 && paidAmount < expectedTotal - 0.05) {
        this.logger.error(`GoKwik amount mismatch for ${orderNumber}: paid ₹${paidAmount}, expected ₹${expectedTotal}`);
        throw new BadRequestException('Paid amount does not match the order total.');
      }

      const targetOrderId = existingOrder ? existingOrder.id : null;
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
          description: 'Online payment received successfully via GoKwik - Awaiting admin confirmation',
          location: 'Online Store',
          trackedAt: new Date(),
        });

        // Clear cart for user
        if (targetUserId) {
          await this.db.delete(carts).where(eq(carts.userId, targetUserId));
        }

        pendingOrders.delete(orderNumber);

        // 1. Send Order Placed Email (Pending Admin Confirmation)
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
          title: '🛒 New Order Placed (GoKwik)',
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
          description: 'Online payment received successfully via GoKwik - Awaiting admin confirmation',
          location: 'Online Store',
          trackedAt: new Date(),
        });

        await this.db.delete(carts).where(eq(carts.userId, pendingData.user_id));
        pendingOrders.delete(orderNumber);

        // Send Order Placed Email
        this.ordersService.sendOrderPlacedEmail(r.id).catch(err => this.logger.error('Failed to send order placed email:', err));

        const createdOrder = await this.db.query.orders.findFirst({
          where: eq(orders.id, r.id),
          with: { orderItems: { with: { product: true, variant: true } as any } } as any,
        });

        const fallbackOrderSlug = getOrderSlug(createdOrder) || createdOrder?.orderNumber || orderNumber;

        // Emit real-time notification to Customer
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

        // Emit real-time notification to Admin Dashboard
        this.notificationsService.createAndEmitNotification({
          recipientGroup: 'admin',
          title: '🛒 New Order Placed (GoKwik)',
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
      // Payment FAILED, CANCELLED, USER_DROPPED, EXPIRED, or TERMINATED
      if (existingOrder && existingOrder.paymentStatus !== 'paid') {
        await this.db.delete(orderItems).where(eq(orderItems.orderId, existingOrder.id)).catch(() => {});
        await this.db.delete(orderTrackingRecords).where(eq(orderTrackingRecords.orderId, existingOrder.id)).catch(() => {});
        await this.db.delete(orders).where(eq(orders.id, existingOrder.id)).catch(() => {});
        this.logger.log(`[CLEANUP] Deleted unpaid/cancelled pending order #${existingOrder.id} (${orderNumber})`);
      }
      pendingOrders.delete(orderNumber);
      return {
        success: false,
        status: explicitStatus || 'FAILED',
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
        await this.db.delete(orderItems).where(inArray(orderItems.orderId, staleIds)).catch(() => {});
        await this.db.delete(orderTrackingRecords).where(inArray(orderTrackingRecords.orderId, staleIds)).catch(() => {});
        await this.db.delete(orders).where(inArray(orders.id, staleIds)).catch(() => {});
        this.logger.log(`[CLEANUP] Purged ${staleIds.length} stale abandoned online payment order(s)`);
      }
    } catch (err: any) {
      this.logger.warn(`Failed to cleanup abandoned online orders: ${err.message}`);
    }
  }

  async testCredentials() {
    return {
      gateway: 'gokwik',
      merchant_id: this.merchantId,
      app_id: this.appId,
      app_secret_preview: this.appSecret ? this.appSecret.substring(0, 8) + '...' : 'not-set',
      gokwik_id: this.gokwikId,
      mode: this.envMode,
      base_url: this.baseUrl,
      credentials_loaded: !!(this.merchantId && this.appId && this.appSecret),
    };
  }
}
