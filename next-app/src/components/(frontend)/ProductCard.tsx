"use client";

import React from "react";
import { useRouter } from "next/navigation";
import imgPlaceholder from "@/public/imagePlaceholder.png";
import { extractProductPricing } from "@/utils/pricing";
import { getProductSlug } from "../../../utils/slugUtils";
import { Heart } from "lucide-react";
import { useLike } from "@/context/LikeContext";
import { useAuth } from "@/context/AuthContext";

export interface ProductCardProps {
  product: any;
  onClick?: () => void;
  className?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  hideMetadata?: boolean;
  /** Denser catalog card for Collections grid */
  compact?: boolean;
}

export default function ProductCard({
  product,
  onClick,
  className = "",
  isNew,
  isBestseller,
  hideMetadata = false,
  compact = false,
}: ProductCardProps) {
  const router = useRouter();
  const { isLiked, toggleLike } = useLike();
  const { user, openAuthModal } = useAuth();

  if (!product) return null;

  const isProductLiked = isLiked(product?.id);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (product?.id) {
      await toggleLike(Number(product.id));
    }
  };

  const uploadUrl = process.env.NEXT_PUBLIC_UPLOAD_BASE ?? "https://api.zelton.co.in";

  let rawImg = product.image_url || product.imageUrl;
  if (!rawImg && product.variants && product.variants.length > 0) {
    const firstWithImg = product.variants.find((v: any) => v?.image_url || v?.imageUrl);
    rawImg =
      firstWithImg?.image_url ||
      firstWithImg?.imageUrl ||
      product.variants[0]?.image_url ||
      product.variants[0]?.imageUrl;
  }
  if (!rawImg) {
    rawImg = product.best_variant?.image_url || product.best_variant?.imageUrl;
  }

  const imgSrc = rawImg
    ? rawImg.startsWith("http") || rawImg.startsWith("data:")
      ? rawImg
      : `${uploadUrl}${rawImg.startsWith("/") ? "" : "/"}${rawImg}`
    : imgPlaceholder.src;

  const { discountPct, hasDiscount, formattedSp, formattedMrp } = extractProductPricing(product);

  const rating = parseFloat(
    String(product.average_rating ?? product.rating_summary?.average_rating ?? product.rating ?? 0)
  );
  const reviewsCount = Number(
    product.reviews_count ??
      product.rating_summary?.reviews_count ??
      product.rating_summary?.total_reviews ??
      product.reviewsCount ??
      0
  );
  const variantCount = product.variants?.length || product.variants_count || 0;
  const stock = product.best_variant?.stock ?? product.total_stock ?? 10;
  const showNewBadge = isNew || product.is_new_arrival;
  const showBestsellerBadge = isBestseller || product.is_bestseller;

  const handleClick = (e?: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else {
      const slug = getProductSlug(product);
      if (!slug) return;
      if (e && (e.ctrlKey || e.metaKey || e.button === 1)) {
        window.open(`/products/${slug}`, "_blank", "noopener,noreferrer");
      } else {
        router.push(`/products/${slug}`);
      }
    }
  };

  const formattedReviewCount =
    reviewsCount >= 1000
      ? `${(reviewsCount / 1000).toFixed(1).replace(/\.0$/, "")}K`
      : reviewsCount;

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className={`group/card bg-pure-white cursor-pointer overflow-hidden flex flex-col h-full select-none border border-[rgba(14,14,13,0.1)] hover:border-[rgba(14,14,13,0.22)] transition-colors duration-300 ${className}`}
      >
        <div className="relative w-full aspect-[3/4] bg-surface-ivory overflow-hidden flex-shrink-0">
          <img
            src={imgSrc}
            alt={product.name || "Product"}
            className="w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-105"
            onError={(e: any) => {
              e.target.src = imgPlaceholder.src;
            }}
          />

          {hasDiscount && discountPct > 0 && (
            <span className="absolute top-0 left-0 z-10 bg-primary text-surface text-[10px] font-semibold px-2.5 py-1.5 uppercase tracking-[0.08em]">
              {discountPct}% Off
            </span>
          )}

          <button
            type="button"
            onClick={handleWishlistClick}
            className={`absolute top-2.5 right-2.5 z-20 w-8 h-8 sm:w-9 sm:h-9 bg-pure-white/90 hover:bg-pure-white border border-[rgba(14,14,13,0.1)] flex items-center justify-center transition-opacity duration-200 ${
              isProductLiked
                ? "opacity-100"
                : "opacity-100 sm:opacity-0 sm:group-hover/card:opacity-100 sm:focus-visible:opacity-100"
            }`}
            aria-label={isProductLiked ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                isProductLiked ? "fill-primary text-primary" : "text-on-surface"
              }`}
            />
          </button>

          {showBestsellerBadge && (
            <span className="absolute bottom-0 left-0 z-10 bg-accent-ochre text-surface-dark text-[10px] font-bold px-2.5 py-1.5 uppercase tracking-[0.08em]">
              Bestseller
            </span>
          )}
          {showNewBadge && !showBestsellerBadge && (
            <span className="absolute bottom-0 left-0 z-10 bg-surface-dark text-surface text-[10px] font-bold px-2.5 py-1.5 uppercase tracking-[0.08em]">
              New
            </span>
          )}
        </div>

        <div className="p-3 sm:p-4 flex flex-col gap-1.5 flex-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-body-slate truncate">
            {product.brand?.name || product.category?.name || "Collection"}
          </span>
          <h3 className="text-[13px] sm:text-[14px] font-semibold text-on-surface line-clamp-2 leading-snug transition-colors duration-200 group-hover/card:text-primary">
            {product.name}
          </h3>
          {rating > 0 && (
            <div className="flex items-center gap-1 leading-none">
              <span className="text-accent-ochre text-[11px]">★</span>
              <span className="text-[11px] font-semibold text-on-surface">{rating.toFixed(1)}</span>
              <span className="text-[10px] text-body-slate">({formattedReviewCount})</span>
            </div>
          )}
          <div className="flex items-baseline gap-2 flex-wrap mt-auto pt-1.5">
            <span className="font-bold text-[14px] sm:text-[15px] text-on-surface">{formattedSp}</span>
            {hasDiscount && (
              <span className="line-through text-[11px] text-body-slate">{formattedMrp}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`sv-product-card group/card bg-pure-white border border-border-line hover:border-[rgba(14,14,13,0.22)] transition-colors cursor-pointer overflow-hidden flex flex-col justify-between h-full select-none ${className}`}
    >
      <div className="relative w-full aspect-[3/4] bg-surface-ivory flex items-center justify-center overflow-hidden border-b border-border-line flex-shrink-0">
        <img
          src={imgSrc}
          alt={product.name || "Product"}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e: any) => {
            e.target.src = imgPlaceholder.src;
          }}
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
          {showNewBadge && (
            <span className="bg-primary text-surface text-[10px] font-semibold px-2 py-1 uppercase tracking-wider">
              New
            </span>
          )}
          {showBestsellerBadge && !showNewBadge && (
            <span className="bg-surface-dark text-surface text-[10px] font-semibold px-2 py-1 uppercase tracking-wider">
              Atelier
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 p-2 bg-surface/95 hover:bg-surface border border-border-line transition-all duration-200 z-20 flex items-center justify-center"
          title={isProductLiked ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label={isProductLiked ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isProductLiked ? "fill-primary text-primary" : "text-on-surface hover:text-primary"
            }`}
          />
        </button>

        <div className="absolute bottom-0 inset-x-0 opacity-0 invisible group-hover/card:opacity-100 group-hover/card:visible transition-all duration-300 z-20">
          <span className="block w-full text-center bg-surface-dark/90 text-surface text-[11px] font-semibold tracking-[0.08em] uppercase py-3">
            Select &amp; Reserve
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2 text-[10px] sm:text-[11px] font-semibold tracking-wider text-body-slate uppercase">
            <span className="truncate">{product.brand?.name || product.category?.name || "Collection"}</span>
            {hasDiscount && discountPct > 0 && (
              <span className="text-primary shrink-0">{discountPct}% Off</span>
            )}
          </div>

          <h3 className="text-sm sm:text-base font-bold uppercase tracking-tight text-on-surface line-clamp-2 leading-snug group-hover/card:text-primary transition-colors">
            {product.name}
          </h3>

          {rating > 0 && (
            <div className="flex items-center gap-1.5 select-none flex-wrap">
              <span className="text-[11px] font-bold text-on-surface leading-none">{rating.toFixed(1)}</span>
              <span className="text-accent-ochre text-[11px]">★</span>
              <span className="text-[10px] sm:text-[11px] text-body-slate font-normal">
                ({formattedReviewCount})
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <span className="font-bold text-sm sm:text-base text-on-surface">{formattedSp}</span>
            {hasDiscount && (
              <span className="line-through text-[11px] sm:text-xs text-body-slate font-normal">
                {formattedMrp}
              </span>
            )}
          </div>
        </div>

        {!hideMetadata && (
          <div className="flex pt-3 border-t border-border-line flex-col gap-1 mt-auto">
            <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider font-semibold">
              <span className="text-primary">{stock > 0 ? "In Collection" : "Made to Order"}</span>
              {variantCount > 1 && (
                <span className="text-body-slate">{variantCount} Options</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
