"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLike } from "@/context/LikeContext";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Bookmark,
  Leaf,
  Hand,
  Ruler,
} from "lucide-react";
import imgPlaceholder from "@/public/imagePlaceholder.png";
import { getProductSlug } from "../../../../utils/slugUtils";
import ErrorMessage from "@/components/(sheared)/ErrorMessage";
import SuccessMessage from "@/components/(sheared)/SuccessMessage";
import { useLoader } from "@/context/LoaderContext";

const basePath = process.env.NEXT_PUBLIC_UPLOAD_BASE || "https://api.zelton.co.in";

const formatINR = (val: number | string) =>
  `₹${Math.round(Number(val) || 0).toLocaleString("en-IN")}`;

const CartPage = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const {
    items,
    count,
    total,
    loading,
    hasInsufficientStockItems,
    getItemStockStatus,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { toggleLike } = useLike();
  const { showLoader, hideLoader } = useLoader();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  const [itemToRemoveName, setItemToRemoveName] = useState("");

  const handleQuantityUpdate = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    showLoader();
    try {
      await updateQuantity(cartItemId, newQuantity);
      setSuccessMessage("Quantity updated.");
    } catch {
      setErrorMessage("Failed to update quantity. Please try again.");
    } finally {
      hideLoader();
    }
  };

  const handleRemoveItemClick = (cartItemId: number, itemName: string) => {
    setItemToRemove(cartItemId);
    setItemToRemoveName(itemName);
    setShowRemoveModal(true);
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;
    showLoader();
    try {
      await removeFromCart(itemToRemove);
      setSuccessMessage("Removed from bag.");
    } catch {
      setErrorMessage("Failed to remove item. Please try again.");
    } finally {
      hideLoader();
      setShowRemoveModal(false);
      setItemToRemove(null);
      setItemToRemoveName("");
    }
  };

  const confirmClearCart = async () => {
    showLoader();
    try {
      await clearCart();
      setSuccessMessage("Bag emptied.");
    } catch {
      setErrorMessage("Failed to empty bag. Please try again.");
    } finally {
      hideLoader();
      setShowClearModal(false);
    }
  };

  const handleCheckoutClick = () => {
    if (hasInsufficientStockItems) {
      setErrorMessage("Update or remove unavailable items before checkout.");
      return;
    }
    router.push("/checkout");
  };

  const handleSingleItemCheckout = (item: any) => {
    const status = getItemStockStatus(item);
    if (status.isUnavailable) {
      setErrorMessage(status.message || "This item is currently unavailable.");
      return;
    }
    router.push(
      `/checkout/single?cartItemId=${item.id}&productId=${item.product.id}&variantId=${item.variant.id}&quantity=${item.quantity}`,
    );
  };

  const handleMoveToWishlist = async (item: any) => {
    showLoader();
    try {
      await toggleLike(item.product.id);
      await removeFromCart(item.id);
      setSuccessMessage("Moved to wishlist.");
    } catch {
      setErrorMessage("Could not move item to wishlist.");
    } finally {
      hideLoader();
    }
  };

  const emptyState = (
    title: string,
    copy: string,
    cta: string,
    onClick: () => void,
  ) => (
    <div className="min-h-[70vh] bg-surface flex items-center">
      <div className="max-w-site mx-auto site-pad w-full py-16">
        <div className="max-w-xl mx-auto text-center border border-border-line bg-surface-ivory px-8 py-14">
          <ShoppingBag className="w-10 h-10 text-primary mx-auto mb-5" strokeWidth={1.25} />
          <span className="label-caps text-primary block mb-2">Editorial Bag</span>
          <h1 className="display-section text-on-surface">{title}</h1>
          <p className="text-[15px] text-body-slate mt-4 leading-relaxed">{copy}</p>
          <button type="button" onClick={onClick} className="sv-btn-primary mt-8 !min-h-[44px] !py-3 !px-8">
            {cta}
          </button>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return emptyState(
      "Sign In to Your Bag",
      "Your selections are held in your SVastra account. Sign in to review reserved pieces.",
      "Sign In",
      () => openAuthModal("login"),
    );
  }

  if (items.length === 0) {
    return emptyState(
      "Your Bag Is Unfilled",
      "No commissions reserved yet. Explore curated editions and timeless textile architectures.",
      "Explore The Edit",
      () => router.push("/products"),
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {errorMessage && <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />}
      {successMessage && <SuccessMessage message={successMessage} onClose={() => setSuccessMessage(null)} />}

      <div className="max-w-site mx-auto site-pad py-8 sm:py-12 lg:py-14">
        {/* Micro breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border-line mb-8">
          <div className="flex items-center gap-2 label-caps text-body-slate">
            <span className="text-primary">Shop Who You Are</span>
            <span className="opacity-40">/</span>
            <span className="text-on-surface">Editorial Bag</span>
          </div>
          <p className="label-caps text-[10px] text-body-slate hidden sm:block">
            {count} {count === 1 ? "edition" : "editions"} reserved
          </p>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10">
          <div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold uppercase tracking-tight text-on-surface leading-none">
                Your Bag
              </h1>
              <span className="text-lg sm:text-xl text-body-slate font-light">
                ({count} {count === 1 ? "Item" : "Items"})
              </span>
            </div>
            <p className="text-[14px] text-body-slate mt-3 max-w-xl leading-relaxed">
              Sartorial commissions curated under bespoke handloom guidelines.
            </p>
          </div>
          <div className="bg-surface-ivory border border-border-line px-5 py-3.5 flex items-center gap-3 self-start md:self-auto">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" strokeWidth={1.5} />
            <div>
              <p className="label-caps text-[10px] text-on-surface">Complimentary Shipping</p>
              <p className="text-[12px] text-body-slate mt-0.5">Included on eligible orders</p>
            </div>
          </div>
        </div>

        {hasInsufficientStockItems && (
          <div className="bg-surface-ivory border border-primary p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="label-caps text-primary">Unavailable Items Detected</h4>
              <p className="text-[13px] text-body-slate mt-1.5 leading-relaxed">
                Update quantities or remove out-of-stock pieces before checkout.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT — line items */}
          <div className="lg:col-span-8 space-y-8">
            <div className="divide-y divide-border-line border-t border-border-line">
              {items.map((item) => {
                const stockInfo = getItemStockStatus(item);
                const rawImg =
                  item.variant?.image_url || item.product?.image_url || "";
                const imgSrc = !rawImg
                  ? imgPlaceholder.src
                  : String(rawImg).startsWith("http") || String(rawImg).startsWith("data:")
                    ? String(rawImg)
                    : `${basePath}${rawImg}`;
                const href = `/products/${getProductSlug(item.product)}?variantId=${item.variant.id}`;

                const returnable =
                  (item.variant as any)?.is_returnable ??
                  (item.variant as any)?.isReturnable ??
                  true;
                const returnDays =
                  (item.variant as any)?.return_window_days ??
                  (item.variant as any)?.returnWindowDays ??
                  7;
                const shippingCharge = Number(
                  (item.variant as any)?.shipping_charges ??
                    (item.variant as any)?.shippingCharges ??
                    0,
                );
                const blurb = String((item.product as any)?.description || "")
                  .replace(/<[^>]+>/g, "")
                  .trim();

                return (
                  <article
                    key={item.id}
                    className={`py-6 first:pt-5 ${stockInfo.isOutOfStock ? "opacity-90" : ""}`}
                  >
                    <div className="grid grid-cols-[96px_1fr] sm:grid-cols-[128px_1fr] gap-4 sm:gap-6 items-start">
                      <Link
                        href={href}
                        className="relative w-[96px] sm:w-[128px] aspect-[3/4] bg-surface-ivory border border-border-line overflow-hidden block shrink-0 media-frame"
                      >
                        <Image
                          src={imgSrc}
                          alt={item.product?.name || "Product"}
                          fill
                          unoptimized
                          className={`object-cover object-top ${stockInfo.isOutOfStock ? "opacity-55 grayscale" : ""}`}
                        />
                      </Link>

                      <div className="min-w-0 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                          {item.product?.category_name ? (
                            <span className="label-caps text-[10px] text-primary font-bold">
                              {item.product.category_name}
                            </span>
                          ) : (
                            <span className="label-caps text-[10px] text-primary font-bold">In Archive</span>
                          )}
                          <span className="text-[17px] font-semibold text-on-surface tracking-tight whitespace-nowrap">
                            {formatINR(item.total)}
                          </span>
                        </div>

                        <Link href={href}>
                          <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-on-surface leading-snug hover:text-primary transition-colors line-clamp-2">
                            {item.product?.name}
                          </h2>
                        </Link>

                        {blurb ? (
                          <p className="text-[13px] text-body-slate leading-relaxed line-clamp-2">
                            {blurb}
                          </p>
                        ) : null}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 py-3 border-y border-border-line text-[12px] text-body-slate">
                          <p>
                            <span className="text-on-surface font-medium">Variant:</span>{" "}
                            {item.variant?.title || "Standard"}
                          </p>
                          {item.variant?.sku && (
                            <p>
                              <span className="text-on-surface font-medium">SKU:</span> {item.variant.sku}
                            </p>
                          )}
                          {item.selected_attributes &&
                            Object.entries(item.selected_attributes).map(([k, v]) => (
                              <p key={k}>
                                <span className="text-on-surface font-medium">{k}:</span> {v}
                              </p>
                            ))}
                          <p>
                            <span className="text-on-surface font-medium">Unit:</span> {formatINR(item.price)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {stockInfo.isOutOfStock ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-surface bg-primary px-2.5 py-1">
                              <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                            </span>
                          ) : stockInfo.isInsufficientStock ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-on-surface bg-accent-ochre px-2.5 py-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> {stockInfo.message}
                            </span>
                          ) : (
                            <span className="label-caps text-[10px] text-accent-ochre inline-flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> In archive
                            </span>
                          )}
                          {returnable ? (
                            <span className="label-caps text-[10px] text-body-slate">
                              {returnDays}d returns
                            </span>
                          ) : (
                            <span className="label-caps text-[10px] text-primary">Non-returnable</span>
                          )}
                          <span className="label-caps text-[10px] text-body-slate">
                            {shippingCharge > 0
                              ? `+ ${formatINR(shippingCharge * item.quantity)} delivery`
                              : "Free delivery"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-on-surface bg-surface">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || loading}
                                className="w-9 h-9 flex items-center justify-center hover:bg-surface-ivory disabled:opacity-40 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-10 text-center text-[12px] font-semibold">{item.quantity}</span>
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                                disabled={
                                  item.quantity >= stockInfo.availableStock ||
                                  stockInfo.availableStock <= 0 ||
                                  loading
                                }
                                className="w-9 h-9 flex items-center justify-center hover:bg-surface-ivory disabled:opacity-40 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="label-caps text-[10px] text-body-slate">
                              {stockInfo.availableStock} available
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 label-caps text-[10px]">
                            <button
                              type="button"
                              onClick={() => handleMoveToWishlist(item)}
                              disabled={loading}
                              className="inline-flex items-center gap-1 text-on-surface hover:text-primary underline underline-offset-4 decoration-border-line hover:decoration-primary transition-colors"
                            >
                              <Bookmark className="w-3.5 h-3.5" /> Wishlist
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSingleItemCheckout(item)}
                              disabled={loading || stockInfo.isUnavailable}
                              className="text-on-surface hover:text-primary transition-colors disabled:opacity-40"
                            >
                              Buy Now
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItemClick(item.id, item.product?.name || "Item")}
                              disabled={loading}
                              className="inline-flex items-center gap-1 text-body-slate hover:text-primary transition-colors"
                            >
                              <X className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Assurance strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-border-line">
              {[
                { icon: Leaf, title: "Ethical Fiber", copy: "Natural handloom weaves — no synthetic shortcuts." },
                { icon: Hand, title: "Weaver Archive", copy: "Crafted with master guilds across India." },
                { icon: Ruler, title: "Easy Returns", copy: "Straightforward returns on eligible pieces." },
              ].map(({ icon: Icon, title, copy }) => (
                <div key={title} className="space-y-1.5">
                  <p className="label-caps text-[10px] text-on-surface flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                    {title}
                  </p>
                  <p className="text-[12px] text-body-slate leading-relaxed">{copy}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="label-caps text-[10px] text-body-slate hover:text-primary inline-flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Empty the Bag
            </button>
          </div>

          {/* RIGHT — order summary */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-surface-ivory border border-[#E4D9C6] p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-on-surface/10 mb-5">
                <h2 className="text-base font-bold uppercase tracking-tight text-on-surface">Order Summary</h2>
                <span className="label-caps text-[9px] text-body-slate">INR</span>
              </div>

              <div className="space-y-3.5 pb-5 border-b border-on-surface/10 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-body-slate">Subtotal</span>
                  <span className="font-semibold text-on-surface">{formatINR(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-slate">Archival Packaging</span>
                  <span className="label-caps text-[10px] text-primary font-bold">Complimentary</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-slate">Shipping</span>
                  <span className="label-caps text-[10px] text-primary font-bold">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-slate">Duties &amp; Taxes</span>
                  <span className="label-caps text-[9px] text-body-slate">Included</span>
                </div>
              </div>

              <div className="pt-5 pb-6 flex justify-between items-baseline gap-3">
                <div>
                  <span className="text-base font-bold uppercase tracking-tight text-on-surface block">Total Payable</span>
                  <span className="label-caps text-[9px] text-body-slate">GST included</span>
                </div>
                <span className="text-xl font-bold text-on-surface tracking-tight">{formatINR(total)}</span>
              </div>

              {hasInsufficientStockItems && (
                <div className="mb-4 p-3 bg-surface border border-primary text-[12px] text-primary flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Checkout disabled until unavailable items are fixed.</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckoutClick}
                disabled={loading || hasInsufficientStockItems}
                className="sv-btn-primary w-full !min-h-[44px] !py-3 !px-4 !text-[11px] !gap-2 disabled:opacity-50"
              >
                <span>{hasInsufficientStockItems ? "Fix Bag Items" : "Proceed to Checkout"}</span>
                {!hasInsufficientStockItems && <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => router.push("/products")}
                className="sv-btn-outline w-full mt-2.5 !min-h-[44px] !py-3 !px-4 !text-[11px]"
              >
                Continue Shopping
              </button>

              <p className="mt-5 pt-4 border-t border-on-surface/10 text-[12px] text-body-slate leading-snug">
                White-glove returns available on eligible pieces after delivery.
              </p>
            </div>

            <div className="bg-surface-subtle border border-border-line px-5 py-4 flex items-center justify-between gap-3">
              <div>
                <p className="label-caps text-[10px] text-on-surface">Dedicated Concierge</p>
                <p className="text-[12px] text-body-slate mt-0.5">Need help with your edit?</p>
              </div>
              <Link href="/contact-us" className="label-caps text-[10px] text-primary hover:text-on-surface underline underline-offset-4">
                Connect
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Remove modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-on-surface/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-on-surface p-6 sm:p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="label-caps text-primary block mb-1">Confirm</span>
                <h3 className="text-xl font-bold uppercase tracking-tight text-on-surface">Remove Item</h3>
              </div>
              <button type="button" onClick={() => setShowRemoveModal(false)} className="p-1 text-body-slate hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[14px] text-body-slate mb-7 leading-relaxed">
              Remove <span className="font-semibold text-on-surface">&ldquo;{itemToRemoveName}&rdquo;</span> from your bag?
            </p>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowRemoveModal(false)} className="sv-btn-outline !min-h-[42px] !py-2.5 !px-5 !text-[11px]">
                Cancel
              </button>
              <button type="button" onClick={confirmRemoveItem} disabled={loading} className="sv-btn-primary !min-h-[42px] !py-2.5 !px-5 !text-[11px] disabled:opacity-50">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-on-surface/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-on-surface p-6 sm:p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="label-caps text-primary block mb-1">Confirm</span>
                <h3 className="text-xl font-bold uppercase tracking-tight text-on-surface">Empty the Bag</h3>
              </div>
              <button type="button" onClick={() => setShowClearModal(false)} className="p-1 text-body-slate hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[14px] text-body-slate mb-7 leading-relaxed">
              Clear all {count} items from your bag? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowClearModal(false)} className="sv-btn-outline !min-h-[42px] !py-2.5 !px-5 !text-[11px]">
                Cancel
              </button>
              <button type="button" onClick={confirmClearCart} disabled={loading} className="sv-btn-primary !min-h-[42px] !py-2.5 !px-5 !text-[11px] disabled:opacity-50">
                Empty Bag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
