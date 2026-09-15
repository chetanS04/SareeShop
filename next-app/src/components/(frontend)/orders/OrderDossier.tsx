"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Fingerprint,
  Leaf,
  Lock,
  Package,
  Truck,
} from "lucide-react";
import imgPlaceholder from "@/public/imagePlaceholder.png";
import { getImageUrl } from "../../../../utils/imageUtils";
import {
  estimateArrival,
  formatINR,
  formatOrderDate,
  getLifecycle,
  getOrderItems,
  getOrderNumber,
  getShippingParts,
  paymentLabel,
} from "./orderDossierUtils";

type OrderDossierProps = {
  order: any;
  /** Celebration / post-checkout hero */
  confirmed?: boolean;
  trackHref: string;
  exploreHref?: string;
  onExplore?: () => void;
  actions?: React.ReactNode;
  footerExtra?: React.ReactNode;
};

export default function OrderDossier({
  order,
  confirmed = false,
  trackHref,
  exploreHref = "/products",
  onExplore,
  actions,
  footerExtra,
}: OrderDossierProps) {
  const orderNum = getOrderNumber(order);
  const created = order.created_at || order.createdAt;
  const items = getOrderItems(order);
  const lifecycle = getLifecycle(order.status);
  const pay = paymentLabel(
    order.payment_method || order.paymentMethod,
    order.payment_status || order.paymentStatus
  );
  const ship = getShippingParts(order);
  const total = order.total;

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative w-full py-14 md:py-20 overflow-hidden">
        <div
          className="absolute top-8 left-1/2 -translate-x-1/2 w-[min(720px,90vw)] h-[280px] bg-surface-ivory/50 blur-3xl pointer-events-none -z-10"
          aria-hidden
        />
        <div className="max-w-[880px] mx-auto text-center flex flex-col items-center">
          {confirmed && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-ivory mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="label-caps text-[10px] tracking-widest text-body-slate">
                Chapter 01 · Purchase Confirmed
              </span>
            </div>
          )}

          <h1 className="display-hero text-on-surface mb-4">
            {confirmed ? "It's yours." : "Order dossier"}
          </h1>

          <p className="text-base md:text-lg text-body-slate max-w-[620px] mx-auto leading-relaxed mb-6">
            {confirmed ? (
              <>
                Your sartorial order{" "}
                <span className="text-on-surface font-semibold">#{orderNum}</span> is now being
                prepared. A confirmation has been sent to your email.
              </>
            ) : (
              <>
                Archive reference{" "}
                <span className="text-on-surface font-semibold">#{orderNum}</span>
                {" · "}
                {formatOrderDate(created)}
              </>
            )}
          </p>

          <div className="flex items-center gap-3 text-accent-ochre">
            <span className="w-8 h-px bg-accent-ochre/40" />
            <span className="label-caps text-[10px] tracking-[0.25em] font-semibold">
              &ldquo;Wear Yourself.&rdquo;
            </span>
            <span className="w-8 h-px bg-accent-ochre/40" />
          </div>
        </div>
      </section>

      {/* Dossier card */}
      <section className="w-full pb-12 md:pb-16">
        <div className="max-w-[820px] mx-auto bg-surface-subtle border border-border-line overflow-hidden">
          {/* Meta + lifecycle */}
          <div className="bg-surface-ivory/80 p-6 md:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
              <div className="flex flex-col">
                <span className="label-caps text-[10px] text-body-slate mb-1">Order Dossier</span>
                <span className="text-lg font-semibold tracking-tight text-on-surface">
                  #{orderNum}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="label-caps text-[10px] text-body-slate mb-1">Order Date</span>
                <span className="text-lg font-semibold tracking-tight text-on-surface">
                  {formatOrderDate(created)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="label-caps text-[10px] text-body-slate mb-1">Estimated Arrival</span>
                <span className="text-lg font-semibold tracking-tight text-primary">
                  {estimateArrival(created)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="label-caps text-[10px] text-body-slate mb-1">Payment</span>
                <div className="flex items-center gap-1.5 text-on-surface">
                  {pay.paid && (
                    <BadgeCheck className="w-4 h-4 text-accent-ochre shrink-0" aria-hidden />
                  )}
                  <span className="text-sm font-semibold tracking-tight">
                    {pay.base} · {formatINR(total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border-line">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <span className="label-caps text-[10px] text-body-slate tracking-wider">
                  Atelier Prep Lifecycle
                </span>
                <span
                  className={`label-caps text-[10px] font-semibold tracking-wider ${
                    lifecycle.cancelled ? "text-primary" : "text-primary"
                  }`}
                >
                  {lifecycle.cancelled ? "Order Cancelled" : lifecycle.label}
                </span>
              </div>
              <div className="w-full bg-surface-subtle h-2 overflow-hidden flex">
                <div
                  className="bg-primary h-full transition-all duration-700"
                  style={{ width: `${Math.round(lifecycle.progress * 100)}%` }}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-center label-caps text-[9px] text-body-slate">
                {lifecycle.stages.map((stage, i) => {
                  const active = !lifecycle.cancelled && i === lifecycle.index;
                  const past = !lifecycle.cancelled && i < lifecycle.index;
                  return (
                    <span
                      key={stage}
                      className={
                        active
                          ? "text-primary font-semibold"
                          : past
                            ? "text-on-surface font-semibold"
                            : ""
                      }
                    >
                      {stage}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pieces */}
          <div className="p-6 md:p-8 flex flex-col gap-6 border-t border-border-line">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="label-caps text-[10px] tracking-widest text-body-slate">
                Curated Pieces In This Acquisition ({String(items.length).padStart(2, "0")})
              </h2>
              <span className="label-caps text-[10px] text-body-slate tracking-wider">
                Inspected &amp; Documented
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {items.length === 0 ? (
                <div className="py-10 text-center bg-pure-white border border-border-line">
                  <Package className="w-8 h-8 text-body-slate/40 mx-auto mb-2" />
                  <p className="text-sm text-body-slate">No pieces recorded for this dossier.</p>
                </div>
              ) : (
                items.map((item: any) => {
                  const rawImage =
                    item.variant?.image_url ||
                    item.variant?.imageUrl ||
                    item.product?.image_url ||
                    item.product?.imageUrl;
                  const imageSrc = getImageUrl(rawImage) || imgPlaceholder.src;
                  const name = item.product?.name || "Piece";
                  const variant = item.variant?.title || item.variant?.sku || "";
                  const attrs = item.selected_attributes || item.selectedAttributes;
                  const attrLine =
                    attrs && typeof attrs === "object"
                      ? Object.entries(attrs)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")
                      : "";
                  const meta = [variant, attrLine, `Qty: ${String(item.quantity).padStart(2, "0")}`]
                    .filter(Boolean)
                    .join(" · ");

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-pure-white border border-border-line group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-20 h-24 overflow-hidden bg-surface-ivory shrink-0 media-frame">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageSrc}
                            alt={name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = imgPlaceholder.src;
                            }}
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="label-caps text-[10px] tracking-wider text-accent-ochre font-semibold mb-0.5">
                            Archive Piece
                          </span>
                          <h3 className="text-base md:text-lg font-semibold text-on-surface tracking-tight line-clamp-2">
                            {name}
                          </h3>
                          {meta && (
                            <p className="text-xs text-body-slate mt-1 leading-relaxed">{meta}</p>
                          )}
                        </div>
                      </div>
                      <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end gap-1 shrink-0">
                        <span className="text-lg font-semibold tracking-tight text-on-surface">
                          {formatINR(item.total)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Destination + protocol + CTAs */}
          <div className="p-6 md:p-8 bg-surface-ivory/50 border-t border-border-line">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col bg-pure-white p-5 border border-border-line">
                <div className="flex items-center gap-2 mb-3 text-primary">
                  <Truck className="w-5 h-5 shrink-0" aria-hidden />
                  <span className="label-caps text-[10px] tracking-widest text-on-surface">
                    Concierge Destination
                  </span>
                </div>
                <span className="text-lg font-semibold text-on-surface mb-1">{ship.name}</span>
                <p className="text-sm text-body-slate leading-relaxed">
                  {ship.lines.map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < ship.lines.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
                {ship.phone && (
                  <span className="mt-3 label-caps text-[10px] text-body-slate tracking-wider">
                    Contact: {ship.phone}
                  </span>
                )}
                {order.notes && (
                  <p className="mt-3 text-xs text-body-slate border-t border-border-line pt-3">
                    <span className="label-caps text-[9px] block mb-1">Note</span>
                    {order.notes}
                  </p>
                )}
              </div>

              <div className="flex flex-col bg-pure-white p-5 border border-border-line">
                <div className="flex items-center gap-2 mb-3 text-primary">
                  <Leaf className="w-5 h-5 shrink-0" aria-hidden />
                  <span className="label-caps text-[10px] tracking-widest text-on-surface">
                    Archival Preservation Protocol
                  </span>
                </div>
                <span className="text-lg font-semibold text-on-surface mb-1">
                  Signature Packaging
                </span>
                <p className="text-sm text-body-slate leading-relaxed">
                  Your pieces ship in SVastra archival packaging — protective wrap, care guidance,
                  and provenance documentation included with every dispatch.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-accent-ochre">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden />
                  <span className="label-caps text-[10px] font-semibold tracking-wider">
                    Tracked Transit
                  </span>
                </div>
              </div>
            </div>

            {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}

            <div className="mt-8 flex flex-col sm:flex-row items-stretch gap-3">
              <Link
                href={trackHref}
                className="sv-btn-primary flex-1 w-full sm:w-auto gap-2"
              >
                <span>Track Shipment &amp; View Order</span>
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              {onExplore ? (
                <button type="button" onClick={onExplore} className="sv-btn-outline w-full sm:w-auto">
                  Continue Exploring SVastra
                </button>
              ) : (
                <Link href={exploreHref} className="sv-btn-outline w-full sm:w-auto text-center">
                  Continue Exploring SVastra
                </Link>
              )}
            </div>

            {footerExtra}
          </div>
        </div>
      </section>
    </div>
  );
}

export function ClientMembershipTeaser({ email }: { email?: string | null }) {
  if (!email) return null;
  return (
    <section className="w-full pb-16 md:pb-24">
      <div className="max-w-[820px] mx-auto">
        <div className="bg-surface-ivory border border-border-line p-8 md:p-12 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 pointer-events-none opacity-[0.06]">
            <Fingerprint className="w-48 h-48 text-on-surface" aria-hidden />
          </div>
          <div className="max-w-[560px] relative z-10">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-surface-subtle mb-4">
              <Fingerprint className="w-3.5 h-3.5 text-primary" aria-hidden />
              <span className="label-caps text-[10px] tracking-widest text-body-slate">
                Client Membership
              </span>
            </div>
            <h2 className="display-section text-on-surface mb-2">
              Want to make your next visit seamless?
            </h2>
            <p className="text-sm text-body-slate mb-6 leading-relaxed">
              You&apos;re signed in as{" "}
              <span className="text-on-surface font-medium">{email}</span>. Save delivery
              addresses, track fits, and keep your archive with SVastra.
            </p>
            <div className="flex items-center gap-2 text-body-slate">
              <Lock className="w-4 h-4 shrink-0" aria-hidden />
              <span className="label-caps text-[10px] tracking-wider">
                Account secured · Private client protocol
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
