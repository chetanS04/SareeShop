"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLike } from "@/context/LikeContext";
import { useCart } from "@/context/CartContext";
import { extractProductPricing } from "@/utils/pricing";
import { getProductSlug } from "../../../../utils/slugUtils";
import { useAuth } from "@/context/AuthContext";
import {
  Heart,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  X,
  Bookmark,
} from "lucide-react";
import imgPlaceholder from "@/public/imagePlaceholder.png";
import { getUserLikedProducts } from "../../../../utils/likeApi";
import ErrorMessage from "@/components/(sheared)/ErrorMessage";
import SuccessMessage from "@/components/(sheared)/SuccessMessage";
import { useLoader } from "@/context/LoaderContext";

interface LikedProduct {
  id: number;
  name: string;
  description?: string;
  item_code?: string;
  image_url?: string;
  category?: { name: string };
  brand?: { name: string };
  variants: Array<{
    id: number;
    title: string;
    sku: string;
    sp: number;
    mrp?: number;
    stock: number;
    image_url?: string;
    image_json?: string;
  }>;
  min_price?: number;
  likes_count?: number;
}

const basePath = process.env.NEXT_PUBLIC_UPLOAD_BASE || "https://api.zelton.co.in";

const LikesPage = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const { toggleLike, likesLoading } = useLike();
  const { addToCart } = useCart();
  const [likedProducts, setLikedProducts] = useState<LikedProduct[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [baggingId, setBaggingId] = useState<number | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [productToRemove, setProductToRemove] = useState<LikedProduct | null>(null);
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setPageLoading(false);
      return;
    }
    fetchLikedProducts();
  }, [user, authLoading]);

  const fetchLikedProducts = async () => {
    setPageLoading(true);
    try {
      const response = await getUserLikedProducts();
      if (response.res === "success") {
        setLikedProducts(response.liked_products || []);
      }
    } catch (error) {
      console.error("Error fetching liked products:", error);
      setErrorMessage("Failed to load your wishlist. Please try again.");
    } finally {
      setPageLoading(false);
    }
  };

  const confirmRemove = async () => {
    if (!productToRemove) return;
    setRemovingId(productToRemove.id);
    const success = await toggleLike(productToRemove.id);
    if (success) {
      setLikedProducts((prev) => prev.filter((p) => p.id !== productToRemove.id));
      setSuccessMessage("Removed from your archive.");
    } else {
      setErrorMessage("Could not remove this piece. Please try again.");
    }
    setRemovingId(null);
    setShowRemoveModal(false);
    setProductToRemove(null);
  };

  const handleMoveToBag = async (product: LikedProduct) => {
    const variant =
      product.variants?.find((v) => Number(v.stock) > 0) || product.variants?.[0];
    if (!variant?.id) {
      router.push(`/products/${getProductSlug(product)}`);
      return;
    }
    if (Number(variant.stock) <= 0) {
      setErrorMessage("This piece is currently unavailable. Open the product to check options.");
      return;
    }

    setBaggingId(product.id);
    showLoader();
    try {
      const ok = await addToCart(product.id, variant.id, 1);
      if (ok) {
        setSuccessMessage("Moved to your bag.");
      } else {
        setErrorMessage("Could not add to bag. Try from the product page.");
      }
    } catch {
      setErrorMessage("Could not add to bag. Please try again.");
    } finally {
      hideLoader();
      setBaggingId(null);
    }
  };

  const getProductImageUrl = (product: LikedProduct) => {
    if (product.image_url) {
      return product.image_url.startsWith("http")
        ? product.image_url
        : `${basePath}${product.image_url}`;
    }
    if (product.variants?.[0]?.image_url) {
      const vUrl = product.variants[0].image_url;
      return vUrl.startsWith("http") ? vUrl : `${basePath}${vUrl}`;
    }
    return imgPlaceholder.src;
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
          <Heart className="w-10 h-10 text-primary mx-auto mb-5" strokeWidth={1.25} />
          <span className="label-caps text-primary block mb-2">Saved Archive</span>
          <h1 className="display-section text-on-surface">{title}</h1>
          <p className="text-[15px] text-body-slate mt-4 leading-relaxed">{copy}</p>
          <button
            type="button"
            onClick={onClick}
            className="sv-btn-primary mt-8 !min-h-[44px] !py-3 !px-8"
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  );

  if (authLoading || (user && pageLoading)) {
    return (
      <div className="min-h-[60vh] bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-surface-ivory border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="label-caps text-[10px] text-body-slate">Opening your archive…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return emptyState(
      "Sign In to Your Archive",
      "Saved pieces live in your SVastra account. Sign in to revisit the cuts you have marked.",
      "Sign In",
      () => openAuthModal("login"),
    );
  }

  if (likedProducts.length === 0) {
    return emptyState(
      "Your Archive Is Empty",
      "Mark the pieces that speak to you — they will be held here for your next edit.",
      "Explore The Edit",
      () => router.push("/products"),
    );
  }

  const count = likedProducts.length;

  return (
    <div className="min-h-screen bg-surface">
      {errorMessage && (
        <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}
      {successMessage && (
        <SuccessMessage message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}

      <div className="max-w-site mx-auto site-pad py-8 sm:py-12 lg:py-14">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border-line mb-8">
          <div className="flex items-center gap-2 label-caps text-body-slate">
            <Link href="/" className="text-primary hover:text-on-surface transition-colors">
              Shop Who You Are
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-on-surface">Saved Archive</span>
          </div>
          <p className="label-caps text-[10px] text-body-slate hidden sm:block">
            {count} {count === 1 ? "piece" : "pieces"} held
          </p>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10">
          <div>
            <button
              type="button"
              onClick={() => router.back()}
              className="label-caps text-[10px] text-body-slate hover:text-on-surface inline-flex items-center gap-1.5 mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold uppercase tracking-tight text-on-surface leading-none">
                Your Wishlist
              </h1>
              <span className="text-lg sm:text-xl text-body-slate font-light">
                ({count} {count === 1 ? "Item" : "Items"})
              </span>
            </div>
            <p className="text-[14px] text-body-slate mt-3 max-w-xl leading-relaxed">
              Pieces you have marked from the archive — ready to reserve or revisit.
            </p>
          </div>
          <div className="bg-surface-ivory border border-border-line px-5 py-3.5 flex items-center gap-3 self-start md:self-auto">
            <Bookmark className="w-5 h-5 text-primary shrink-0" strokeWidth={1.5} />
            <div>
              <p className="label-caps text-[10px] text-on-surface">Private Client Hold</p>
              <p className="text-[12px] text-body-slate mt-0.5">Saved only for your account</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Line items */}
          <div className="lg:col-span-8 space-y-0 border-t border-border-line">
            {likedProducts.map((product) => {
              const { formattedSp, formattedMrp, discountPct, hasDiscount } =
                extractProductPricing(product);
              const fullName = product.brand?.name
                ? `${product.name}`
                : product.name;
              const hasStock = product.variants?.some((v) => Number(v.stock) > 0) ?? true;
              const variantLabel =
                product.variants?.length > 1
                  ? `${product.variants.length} options`
                  : product.variants?.[0]?.title || "Archive piece";
              const slug = getProductSlug(product);

              return (
                <article
                  key={product.id}
                  className="grid grid-cols-[88px_1fr] sm:grid-cols-[112px_1fr] gap-4 sm:gap-5 py-6 border-b border-border-line"
                >
                  <Link
                    href={`/products/${slug}`}
                    className="relative w-[88px] sm:w-[112px] aspect-[3/4] bg-surface-ivory border border-border-line overflow-hidden media-frame shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getProductImageUrl(product)}
                      alt={fullName}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = imgPlaceholder.src;
                      }}
                    />
                  </Link>

                  <div className="min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {(product.brand?.name || product.category?.name) && (
                          <span className="label-caps text-[10px] text-primary block mb-1">
                            {product.brand?.name || product.category?.name}
                          </span>
                        )}
                        <Link
                          href={`/products/${slug}`}
                          className="text-sm sm:text-base font-semibold uppercase tracking-tight text-on-surface hover:text-primary transition-colors line-clamp-2"
                        >
                          {fullName}
                        </Link>
                        <p className="text-[12px] text-body-slate mt-1.5">{variantLabel}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProductToRemove(product);
                          setShowRemoveModal(true);
                        }}
                        disabled={removingId === product.id || likesLoading}
                        className="p-1.5 text-body-slate hover:text-primary transition-colors shrink-0 disabled:opacity-50"
                        aria-label="Remove from wishlist"
                        title="Remove"
                      >
                        {removingId === product.id ? (
                          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
                      <span className="text-base font-bold text-on-surface">{formattedSp}</span>
                      {hasDiscount && (
                        <span className="text-[12px] text-body-slate line-through">{formattedMrp}</span>
                      )}
                      {hasDiscount && discountPct > 0 && (
                        <span className="label-caps text-[10px] text-primary">{discountPct}% off</span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                      {hasStock ? (
                        <span className="label-caps text-[10px] text-accent-ochre inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          In archive
                        </span>
                      ) : (
                        <span className="label-caps text-[10px] text-body-slate">Made to order</span>
                      )}
                    </div>

                    <div className="mt-auto pt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMoveToBag(product)}
                        disabled={baggingId === product.id}
                        className="sv-btn-primary !min-h-[40px] !py-2 !px-4 !text-[11px] !gap-2 disabled:opacity-50"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {baggingId === product.id ? "Adding…" : "Move to Bag"}
                      </button>
                      <Link
                        href={`/products/${slug}`}
                        className="sv-btn-outline !min-h-[40px] !py-2 !px-4 !text-[11px]"
                      >
                        View Piece
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}

            <div className="pt-6 flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/products"
                className="label-caps text-[10px] text-body-slate hover:text-primary inline-flex items-center gap-1.5 transition-colors"
              >
                Continue exploring
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/cart"
                className="label-caps text-[10px] text-primary hover:text-on-surface inline-flex items-center gap-1.5 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Open bag
              </Link>
            </div>
          </div>

          {/* Side panel */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-surface-ivory border border-[#E4D9C6] p-6 sm:p-7">
              <div className="flex items-center justify-between pb-4 border-b border-on-surface/10 mb-5">
                <h2 className="text-base font-bold uppercase tracking-tight text-on-surface">
                  Archive Summary
                </h2>
                <Heart className="w-4 h-4 text-primary fill-primary" />
              </div>

              <div className="space-y-3.5 pb-5 border-b border-on-surface/10 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-body-slate">Saved pieces</span>
                  <span className="font-semibold text-on-surface">{count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-slate">Hold status</span>
                  <span className="label-caps text-[10px] text-primary font-bold">Private</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-slate">Availability</span>
                  <span className="label-caps text-[10px] text-on-surface">Live catalog</span>
                </div>
              </div>

              <p className="pt-5 pb-6 text-[13px] text-body-slate leading-relaxed">
                Move pieces to your bag when ready, or open each dossier to select the exact weave
                and fit.
              </p>

              <Link
                href="/cart"
                className="sv-btn-primary w-full !min-h-[44px] !py-3 !px-4 !text-[11px] !gap-2"
              >
                <span>Go to Bag</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products"
                className="sv-btn-outline w-full mt-2.5 !min-h-[44px] !py-3 !px-4 !text-[11px] text-center"
              >
                Continue Shopping
              </Link>

              <p className="mt-5 pt-4 border-t border-on-surface/10 text-[12px] text-body-slate leading-snug">
                Saved pieces stay linked to your account across sessions.
              </p>
            </div>

            <div className="bg-surface-subtle border border-border-line px-5 py-4 flex items-center justify-between gap-3">
              <div>
                <p className="label-caps text-[10px] text-on-surface">Dedicated Concierge</p>
                <p className="text-[12px] text-body-slate mt-0.5">Need help with your edit?</p>
              </div>
              <Link
                href="/contact-us"
                className="label-caps text-[10px] text-primary hover:text-on-surface underline underline-offset-4"
              >
                Connect
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {showRemoveModal && productToRemove && (
        <div className="fixed inset-0 bg-on-surface/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-on-surface p-6 sm:p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="label-caps text-primary block mb-1">Confirm</span>
                <h3 className="text-xl font-bold uppercase tracking-tight text-on-surface">
                  Remove Piece
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowRemoveModal(false);
                  setProductToRemove(null);
                }}
                className="p-1 text-body-slate hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[14px] text-body-slate mb-7 leading-relaxed">
              Remove{" "}
              <span className="font-semibold text-on-surface">
                &ldquo;{productToRemove.name}&rdquo;
              </span>{" "}
              from your wishlist?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowRemoveModal(false);
                  setProductToRemove(null);
                }}
                className="sv-btn-outline !min-h-[40px] !py-2 !px-5 !text-[11px]"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                disabled={removingId === productToRemove.id}
                className="sv-btn-primary !min-h-[40px] !py-2 !px-5 !text-[11px] disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LikesPage;
