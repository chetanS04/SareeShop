"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  Truck,
  AlertTriangle,
  Download,
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
  RotateCcw,
  Lock,
} from "lucide-react";
import imgPlaceholder from "@/public/imagePlaceholder.png";
import { getOrders, cancelOrder, downloadOrderInvoice } from "../../../../utils/orderApi";
import { getOrderSlug } from "../../../../utils/slugUtils";
import { generateInvoicePDF } from "@/utils/generateInvoicePDF";
import { getImageUrl } from "../../../../utils/imageUtils";
import Modal from "@/components/(sheared)/Modal";
import ErrorMessage from "@/components/(sheared)/ErrorMessage";
import SuccessMessage from "@/components/(sheared)/SuccessMessage";
import CelebrationEffect from "@/components/(frontend)/CelebrationEffect";
import OrderDossier, {
  ClientMembershipTeaser,
} from "@/components/(frontend)/orders/OrderDossier";
import {
  formatINR,
  formatOrderDate,
  getOrderItems,
  getOrderNumber,
  statusChip,
} from "@/components/(frontend)/orders/orderDossierUtils";
import { useLoader } from "@/context/LoaderContext";
import ZeltonLoader from "@/components/ui/ZeltonLoader";

type Order = {
  id: number;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  shipping_fee: number;
  tax: number;
  total: number;
  shipping_address: string;
  notes: string | null;
  created_at: string;
  order_items: any[];
};

const OrdersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCelebration, setShowCelebration] = useState(false);
  const [showConfirmHero, setShowConfirmHero] = useState(false);
  const { user, loading: authLoading, openAuthModal } = useAuth();

  useEffect(() => {
    if (searchParams?.get("celebrate") === "true") {
      setShowCelebration(true);
      setShowConfirmHero(true);
      const timer = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("celebrate");
        const queryString = params.toString();
        const newPath = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;
        window.history.replaceState(null, "", newPath);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<number | null>(null);
  const { showLoader, hideLoader } = useLoader();

  const handleDownloadInvoice = async (order: any) => {
    try {
      setDownloadingInvoiceId(order.id);
      await downloadOrderInvoice(order.id);
    } catch (err) {
      console.warn("Backend invoice download failed, attempting client-side generation:", err);
      try {
        await generateInvoicePDF(order);
      } catch (fallbackErr) {
        console.error("Client-side PDF generation error:", fallbackErr);
        setErrorMessage("Failed to download invoice. Please try again.");
      }
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        per_page: 12,
      };

      const response = await getOrders(params);

      if (response.success && response.data) {
        const list = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];
        setOrders(list);
        setTotalPages(response.data.last_page || 1);
      } else if (Array.isArray(response.data)) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setErrorMessage("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;

    setCancelLoading(true);
    showLoader();
    try {
      const response = await cancelOrder(orderToCancel.id);
      if (response.success) {
        fetchOrders();
        setSuccessMessage(`Order #${orderToCancel.order_number} cancelled successfully!`);
        setShowCancelModal(false);
        setOrderToCancel(null);
      }
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to cancel order. Please try again."
      );
    } finally {
      setCancelLoading(false);
      hideLoader();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] bg-surface flex items-center justify-center py-20">
        <div className="text-center">
          <ZeltonLoader size="lg" variant="brand" />
          <p className="label-caps text-[10px] text-body-slate mt-4">Loading your archive…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] bg-surface flex items-center justify-center site-pad py-20">
        <div className="max-w-md w-full text-center border border-border-line bg-pure-white p-8 md:p-10">
          <div className="w-14 h-14 bg-surface-ivory text-primary flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <p className="label-caps text-primary mb-2">Private Archive</p>
          <h1 className="display-section text-on-surface mb-3">Sign in to view orders</h1>
          <p className="text-sm text-body-slate mb-8 leading-relaxed">
            Track shipments, open your dossiers, and manage deliveries from your client account.
          </p>
          <button type="button" onClick={() => openAuthModal("login")} className="sv-btn-primary w-full">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const latestOrder = orders[0];
  const showDossier = showConfirmHero && latestOrder && currentPage === 1 && !loading;

  return (
    <div className="min-h-screen bg-surface pb-20">
      {showCelebration && <CelebrationEffect duration={6000} />}
      {errorMessage && (
        <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}
      {successMessage && (
        <SuccessMessage message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}

      {/* Compact checkout-style strip when confirming */}
      {showDossier && (
        <div className="border-b border-border-line bg-surface/95 backdrop-blur-md">
          <div className="max-w-site mx-auto site-pad h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-semibold uppercase tracking-tight text-on-surface">
                SVastra
              </span>
              <span className="hidden sm:inline label-caps text-[10px] text-body-slate pl-3 border-l border-border-line tracking-widest">
                Checkout
              </span>
            </div>
            <div className="flex items-center gap-2 label-caps text-[10px] text-body-slate tracking-wider">
              <Lock className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden />
              <span className="hidden sm:inline">Encrypted Checkout</span>
            </div>
            <Link
              href="/cart"
              className="label-caps text-[10px] text-body-slate hover:text-on-surface transition-colors tracking-wider"
            >
              Return to Bag
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-site mx-auto site-pad">
        {showDossier && (
          <>
            <OrderDossier
              order={latestOrder}
              confirmed
              trackHref={`/orders/${getOrderSlug(latestOrder)}/tracking`}
              onExplore={() => {
                setShowConfirmHero(false);
                document.getElementById("orders-archive")?.scrollIntoView({ behavior: "smooth" });
              }}
              actions={
                <button
                  type="button"
                  onClick={() => handleDownloadInvoice(latestOrder)}
                  disabled={downloadingInvoiceId === latestOrder.id}
                  className="label-caps text-[10px] text-body-slate hover:text-primary inline-flex items-center gap-2 underline underline-offset-4 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Tax Invoice
                </button>
              }
            />
            <ClientMembershipTeaser email={user.email} />
          </>
        )}

        {/* Archive list */}
        <section id="orders-archive" className={showDossier ? "pt-4 pb-8" : "py-10 md:py-14"}>
          <div className="relative flex items-end justify-between gap-4 mb-8 md:mb-10">
            <div>
              {!showDossier && (
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="label-caps text-[10px] text-body-slate hover:text-on-surface inline-flex items-center gap-1.5 mb-4 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}
              <p className="label-caps text-primary mb-2">Client Archive</p>
              <h2 className="display-section text-on-surface">
                {showDossier ? "Your Orders" : "Your Orders"}
              </h2>
              {!loading && (
                <p className="text-sm text-body-slate mt-2">
                  {orders.length} dossier{orders.length === 1 ? "" : "s"} in this view
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 border border-border-line bg-surface-subtle animate-pulse"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="border border-border-line bg-pure-white p-12 text-center max-w-md mx-auto">
              <div className="w-14 h-14 bg-surface-ivory text-body-slate flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-on-surface mb-2">No orders yet</h3>
              <p className="text-sm text-body-slate mb-8">
                Your acquisition archive is empty. Begin with the current collection.
              </p>
              <Link href="/products" className="sv-btn-primary">
                Explore SVastra
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
              {orders.map((order: any) => {
                const orderItemsList = getOrderItems(order);
                const orderNum = getOrderNumber(order);
                const createdDate = order.created_at || order.createdAt;
                const paymentMeth = order.payment_method || order.paymentMethod;
                const chip = statusChip(order.status);
                const retRequests: any[] = order.returnRequests || order.returns || [];
                const hasActiveReturn = retRequests.length > 0;
                const firstReturn = retRequests[0];
                const slug = getOrderSlug(order);

                return (
                  <article
                    key={order.id}
                    className="bg-pure-white border border-border-line flex flex-col overflow-hidden"
                  >
                    <div className="bg-surface-ivory/70 px-4 py-3 border-b border-border-line flex items-center justify-between gap-3">
                      <div className="flex items-center gap-4 flex-wrap text-xs">
                        <div>
                          <p className="label-caps text-[9px] text-body-slate mb-0.5">Placed</p>
                          <p className="font-semibold text-on-surface text-xs">
                            {formatOrderDate(createdDate)}
                          </p>
                        </div>
                        <div className="h-6 w-px bg-border-line hidden sm:block" />
                        <div>
                          <p className="label-caps text-[9px] text-body-slate mb-0.5">Total</p>
                          <p className="font-semibold text-on-surface text-xs">
                            {formatINR(order.total)}
                          </p>
                        </div>
                        <div className="h-6 w-px bg-border-line hidden sm:block" />
                        <div className="hidden sm:block">
                          <p className="label-caps text-[9px] text-body-slate mb-0.5">Payment</p>
                          <p className="font-medium text-on-surface text-xs uppercase">
                            {paymentMeth === "cash_on_delivery" ? "COD" : "Online"}
                          </p>
                        </div>
                      </div>
                      <span className={`label-caps text-[10px] font-semibold shrink-0 ${chip.className}`}>
                        {chip.label}
                      </span>
                    </div>

                    <div className="px-4 py-2 border-b border-border-line flex items-center justify-between text-[11px] text-body-slate bg-surface-subtle/50">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono">#{orderNum}</span>
                        {hasActiveReturn && (
                          <span className="inline-flex items-center gap-1 label-caps text-[9px] text-primary">
                            <RotateCcw className="w-2.5 h-2.5" />
                            Return {(firstReturn.status || "requested").replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                      <span>
                        {orderItemsList.length} piece{orderItemsList.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="p-4 flex-1 divide-y divide-border-line">
                      {orderItemsList.length > 0 ? (
                        orderItemsList.map((item: any) => {
                          const rawImage =
                            item.variant?.image_url ||
                            item.variant?.imageUrl ||
                            item.product?.image_url ||
                            item.product?.imageUrl;
                          const imageSrc = getImageUrl(rawImage) || imgPlaceholder.src;
                          const variantTitle = item.variant?.title || item.variant?.sku;

                          return (
                            <div key={item.id} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
                              <div className="relative w-14 h-[4.5rem] overflow-hidden bg-surface-ivory shrink-0 media-frame">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={imageSrc}
                                  alt={item.product?.name || "Product"}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = imgPlaceholder.src;
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => router.push(`/orders/${slug}`)}
                                  className="text-left text-sm font-semibold text-on-surface line-clamp-1 hover:text-primary transition-colors"
                                >
                                  {item.product?.name || "Product"}
                                </button>
                                <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-body-slate">
                                  {variantTitle && <span>{variantTitle}</span>}
                                  <span>Qty {item.quantity}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0 text-sm font-semibold text-on-surface">
                                {formatINR(item.total)}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-4 text-center text-xs text-body-slate italic">
                          No items found
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-3 bg-surface-ivory/40 border-t border-border-line flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(`/orders/${slug}`)}
                        className="sv-btn-primary !min-h-[40px] !py-2 !px-4 !text-[11px] flex-1 sm:flex-none"
                      >
                        View Dossier
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/orders/${slug}/tracking`)}
                        className="sv-btn-outline !min-h-[40px] !py-2 !px-3.5 !text-[11px] flex-1 sm:flex-none gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Track
                      </button>
                      {hasActiveReturn && (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/orders/${slug}/returns/${firstReturn.returnNumber || firstReturn.return_number || firstReturn.id}`
                            )
                          }
                          className="label-caps text-[10px] text-primary hover:text-on-surface inline-flex items-center gap-1.5 px-2 py-2"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Return
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(order)}
                        disabled={downloadingInvoiceId === order.id}
                        className="ml-auto label-caps text-[10px] text-body-slate hover:text-primary inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {downloadingInvoiceId === order.id ? (
                          <ZeltonLoader size="xs" variant="brand" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        Invoice
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="sv-btn-outline !min-h-[40px] !py-2 !px-4 !text-[11px] disabled:opacity-40"
              >
                Previous
              </button>
              <span className="label-caps text-[10px] text-body-slate">
                Page {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="sv-btn-outline !min-h-[40px] !py-2 !px-4 !text-[11px] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>

      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setOrderToCancel(null);
        }}
        title="Cancel Order"
        width="max-w-md"
      >
        <div className="text-center pt-2">
          <div className="mx-auto flex items-center justify-center w-14 h-14 bg-surface-ivory text-primary mb-3">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-on-surface mb-1">Cancel this order?</h3>
          {orderToCancel && (
            <div className="bg-surface-subtle p-3 my-4 text-left text-xs border border-border-line space-y-1">
              <div className="flex justify-between">
                <span className="text-body-slate">Order</span>
                <span className="font-mono font-semibold text-on-surface">
                  #{orderToCancel.order_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-slate">Total</span>
                <span className="font-semibold text-on-surface">
                  {formatINR(orderToCancel.total)}
                </span>
              </div>
            </div>
          )}
          <p className="text-xs text-body-slate mb-6">This cannot be undone.</p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => {
                setShowCancelModal(false);
                setOrderToCancel(null);
              }}
              disabled={cancelLoading}
              className="sv-btn-outline !min-h-[40px] !py-2 !px-5 !text-[11px]"
            >
              Keep Order
            </button>
            <button
              type="button"
              onClick={handleConfirmCancel}
              disabled={cancelLoading}
              className="sv-btn-primary !min-h-[40px] !py-2 !px-5 !text-[11px] disabled:opacity-50"
            >
              {cancelLoading ? <ZeltonLoader size="xs" variant="white" /> : "Yes, Cancel"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default function OrdersPageWrapper() {
  return (
    <Suspense fallback={null}>
      <OrdersPage />
    </Suspense>
  );
}
