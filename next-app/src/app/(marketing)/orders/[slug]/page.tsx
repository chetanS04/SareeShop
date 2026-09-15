"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Download,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { getOrder, downloadOrderInvoice } from "../../../../../utils/orderApi";
import { returnApi } from "../../../../../utils/returnApi";
import { generateInvoicePDF } from "@/utils/generateInvoicePDF";
import ErrorMessage from "@/components/(sheared)/ErrorMessage";
import SuccessMessage from "@/components/(sheared)/SuccessMessage";
import ReturnRequestModal from "@/components/returns/ReturnRequestModal";
import OrderDossier from "@/components/(frontend)/orders/OrderDossier";
import { formatINR } from "@/components/(frontend)/orders/orderDossierUtils";
import { getOrderSlug } from "../../../../../utils/slugUtils";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.slug || params?.id || "") as string;

  const [order, setOrder] = useState<any>(null);
  const [eligibility, setEligibility] = useState<any>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const handleDownloadInvoice = async () => {
    if (!order) return;
    try {
      setDownloadingInvoice(true);
      await downloadOrderInvoice(order.id);
    } catch (err) {
      console.warn("Backend PDF download failed, fallback to client generation:", err);
      try {
        await generateInvoicePDF(order);
      } catch (fallbackErr) {
        console.error("Client PDF generation error:", fallbackErr);
        setErrorMessage("Failed to download invoice. Please try again.");
      }
    } finally {
      setDownloadingInvoice(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await getOrder(orderId);
      if (response.success) {
        setOrder(response.data);
        try {
          const eligRes = await returnApi.checkEligibility(response.data.id);
          setEligibility(eligRes);
        } catch (e) {
          console.warn("Could not check return eligibility:", e);
        }
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setErrorMessage("Failed to load order details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-surface flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-surface-ivory border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="label-caps text-[10px] text-body-slate">Opening dossier…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] bg-surface flex items-center justify-center site-pad py-20">
        <div className="bg-pure-white border border-border-line p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="display-section text-on-surface mb-2">Order not found</h3>
          <p className="text-sm text-body-slate mb-8 leading-relaxed">
            This dossier does not exist or you do not have permission to view it.
          </p>
          <button type="button" onClick={() => router.push("/orders")} className="sv-btn-primary">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const isDelivered =
    ["delivered", "completed"].includes((order.status || "").toLowerCase()) ||
    (order.delhivery_status || "").toLowerCase().includes("delivered");
  const existingReturns =
    order.returnRequests && order.returnRequests.length > 0
      ? order.returnRequests
      : order.returns && order.returns.length > 0
        ? order.returns
        : eligibility?.existingReturns || [];
  const hasEligibleItems = eligibility?.items && eligibility.items.length > 0;
  const slug = getOrderSlug(order) || order.slug || order.order_number || order.id;

  const subtotal = Number(order.subtotal || 0);
  const shipping = Number(order.shipping_fee ?? order.shippingFee ?? 0);
  const tax = Number(order.tax || 0);
  const total = Number(order.total || 0);

  return (
    <div className="min-h-screen bg-surface pb-16">
      {errorMessage && (
        <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}
      {successMessage && (
        <SuccessMessage message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}

      <div className="max-w-site mx-auto site-pad pt-6">
        <button
          type="button"
          onClick={() => router.push("/orders")}
          className="label-caps text-[10px] text-body-slate hover:text-on-surface inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Orders
        </button>
      </div>

      {existingReturns.length > 0 && (
        <div className="max-w-[820px] mx-auto site-pad mt-6">
          <div className="border border-border-line bg-surface-ivory p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pure-white text-primary flex items-center justify-center border border-border-line">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-on-surface text-sm">
                  Return / Exchange in Progress
                </h4>
                <p className="text-xs text-body-slate mt-0.5">
                  Request #
                  {existingReturns[0].returnNumber || existingReturns[0].return_number} ·{" "}
                  {(existingReturns[0].status || "").replace(/_/g, " ").toUpperCase()}
                </p>
              </div>
            </div>
            <Link
              href={`/orders/${slug}/returns/${existingReturns[0].returnNumber || existingReturns[0].return_number || existingReturns[0].id}`}
              className="sv-btn-outline !min-h-[40px] !py-2 !px-4 !text-[11px] gap-1.5"
            >
              Track Return
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-site mx-auto site-pad">
        <OrderDossier
          order={order}
          confirmed={["pending", "confirmed"].includes((order.status || "").toLowerCase())}
          trackHref={`/orders/${slug}/tracking`}
          exploreHref="/products"
          actions={
            <>
              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
                className="label-caps text-[10px] text-body-slate hover:text-primary inline-flex items-center gap-2 underline underline-offset-4 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {downloadingInvoice ? "Preparing invoice…" : "Download Tax Invoice"}
              </button>
              {existingReturns.length > 0 ? (
                <Link
                  href={`/orders/${slug}/returns/${existingReturns[0].returnNumber || existingReturns[0].return_number || existingReturns[0].id}`}
                  className="label-caps text-[10px] text-primary hover:text-on-surface inline-flex items-center gap-2 underline underline-offset-4"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  View Return Request
                </Link>
              ) : isDelivered && hasEligibleItems ? (
                <button
                  type="button"
                  onClick={() => setShowReturnModal(true)}
                  className="label-caps text-[10px] text-primary hover:text-on-surface inline-flex items-center gap-2 underline underline-offset-4"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Return / Exchange
                </button>
              ) : null}
            </>
          }
          footerExtra={
            <div className="mt-8 pt-6 border-t border-border-line">
              <h3 className="label-caps text-[10px] text-body-slate tracking-widest mb-4">
                Order Summary
              </h3>
              <div className="space-y-2 text-sm max-w-sm">
                <div className="flex justify-between text-body-slate">
                  <span>Subtotal</span>
                  <span className="font-semibold text-on-surface">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-body-slate">
                  <span>Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? "text-primary" : "text-on-surface"}`}>
                    {shipping === 0 ? "Complimentary" : formatINR(shipping)}
                  </span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-body-slate">
                    <span>Tax</span>
                    <span className="font-semibold text-on-surface">{formatINR(tax)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border-line text-base font-bold text-on-surface">
                  <span>Total</span>
                  <span className="text-primary">{formatINR(total)}</span>
                </div>
              </div>
            </div>
          }
        />
      </div>

      {showReturnModal && eligibility && (
        <ReturnRequestModal
          order={order}
          eligibility={eligibility}
          onClose={() => setShowReturnModal(false)}
          onSuccess={(returnReq) => {
            setShowReturnModal(false);
            setSuccessMessage("Return request submitted successfully! Redirecting...");
            router.push(
              `/orders/${slug}/returns/${returnReq.returnNumber || returnReq.id}`
            );
          }}
        />
      )}
    </div>
  );
}
