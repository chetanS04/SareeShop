import React from "react";

export default function ProductDetailsSkeleton() {
  return (
    <div className="w-full bg-surface min-h-screen animate-pulse">
      {/* ── Breadcrumb Skeleton ── */}
      <div className="bg-surface-subtle/50 border-b border-border-line py-3">
        <div className="max-w-site mx-auto site-pad flex items-center gap-2.5">
          <div className="w-12 h-3 bg-surface-ivory" />
          <div className="w-2.5 h-3 bg-surface-ivory" />
          <div className="w-16 h-3 bg-surface-ivory" />
          <div className="w-2.5 h-3 bg-surface-ivory" />
          <div className="w-28 h-3 bg-surface-ivory" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE SKELETON (<lg)
      ══════════════════════════════════════════════════════ */}
      <div className="lg:hidden">
        {/* Brand Header & Title Skeleton */}
        <div className="px-4 sm:px-6 pt-5 pb-4 bg-surface border-b border-border-line space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-24 h-3 bg-surface-ivory" />
            <div className="w-16 h-4 bg-surface-ivory" />
          </div>
          <div className="w-4/5 h-6 bg-surface-ivory" />
          <div className="w-2/3 h-6 bg-surface-ivory" />
          <div className="w-24 h-3 bg-surface-ivory" />
        </div>

        {/* Main Image Carousel Skeleton */}
        <div className="w-full aspect-[3/4] bg-surface-ivory border-b border-border-line relative flex items-center justify-center">
          <div className="w-32 h-32 bg-surface-subtle/60" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            <div className="w-6 h-1 bg-surface-dark/20" />
            <div className="w-2 h-1 bg-surface-dark/10" />
            <div className="w-2 h-1 bg-surface-dark/10" />
          </div>
        </div>

        {/* Price Skeleton */}
        <div className="px-4 sm:px-6 py-4 bg-surface border-b border-border-line space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-32 h-7 bg-surface-ivory" />
            <div className="w-20 h-4 bg-surface-ivory" />
            <div className="w-14 h-4 bg-primary/20" />
          </div>
          <div className="w-48 h-3 bg-surface-ivory" />
        </div>

        {/* Assurance Strip Skeleton */}
        <div className="px-4 sm:px-6 py-3.5 bg-surface-subtle/70 border-b border-border-line">
          <div className="flex gap-3 overflow-x-hidden">
            <div className="w-40 h-12 bg-pure-white border border-border-line flex-shrink-0" />
            <div className="w-40 h-12 bg-pure-white border border-border-line flex-shrink-0" />
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="px-4 sm:px-6 py-4 bg-pure-white border-b border-border-line space-y-3">
          <div className="w-full h-12 bg-primary/20" />
          <div className="w-full h-12 bg-surface-dark/20" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          DESKTOP SKELETON (lg+)
      ══════════════════════════════════════════════════════ */}
      <div className="hidden lg:block">
        <div className="max-w-site mx-auto site-pad py-10">
          <div className="grid grid-cols-12 gap-8 xl:gap-10 items-start">
            {/* ── LEFT: Sticky Image Column Skeleton (5 Cols) ── */}
            <div className="col-span-6 xl:col-span-5 flex gap-4">
              {/* Vertical thumbnails */}
              <div className="flex flex-col gap-2.5 w-[64px] xl:w-[72px] flex-shrink-0">
                <div className="w-full aspect-[3/4] bg-surface-ivory border border-border-line" />
                <div className="w-full aspect-[3/4] bg-surface-ivory border border-border-line" />
                <div className="w-full aspect-[3/4] bg-surface-ivory border border-border-line" />
                <div className="w-full aspect-[3/4] bg-surface-ivory border border-border-line" />
              </div>

              {/* Large Main Image Preview */}
              <div className="flex-1 aspect-[3/4] bg-surface-ivory border border-border-line flex items-center justify-center p-8">
                <div className="w-48 h-48 bg-surface-subtle/60" />
              </div>
            </div>

            {/* ── CENTER: Product Details Skeleton (4 Cols) ── */}
            <div className="col-span-6 xl:col-span-4 space-y-6">
              {/* Brand & Title */}
              <div className="space-y-2">
                <div className="w-24 h-3 bg-surface-ivory" />
                <div className="w-11/12 h-7 bg-surface-ivory" />
                <div className="w-3/4 h-7 bg-surface-ivory" />
                <div className="w-32 h-4 bg-surface-ivory pt-1" />
              </div>

              <div className="border-t border-border-line" />

              {/* Price block */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <div className="w-36 h-8 bg-surface-ivory" />
                  <div className="w-24 h-4 bg-surface-ivory" />
                  <div className="w-14 h-4 bg-primary/20" />
                </div>
                <div className="w-44 h-3 bg-surface-ivory" />
              </div>

              {/* Assurance strip */}
              <div className="p-3.5 bg-surface-subtle/70 border border-border-line flex gap-3">
                <div className="w-1/2 h-10 bg-pure-white border border-border-line" />
                <div className="w-1/2 h-10 bg-pure-white border border-border-line" />
              </div>

              {/* Variant Selector Skeleton */}
              <div className="space-y-2.5">
                <div className="w-20 h-3 bg-surface-ivory" />
                <div className="flex gap-2">
                  <div className="w-16 h-20 bg-pure-white border border-border-line" />
                  <div className="w-16 h-20 bg-pure-white border border-border-line" />
                  <div className="w-16 h-20 bg-pure-white border border-border-line" />
                </div>
              </div>

              {/* Description Skeleton */}
              <div className="pt-4 border-t border-border-line space-y-2">
                <div className="w-28 h-3.5 bg-surface-ivory" />
                <div className="w-full h-3 bg-surface-ivory" />
                <div className="w-5/6 h-3 bg-surface-ivory" />
                <div className="w-4/6 h-3 bg-surface-ivory" />
              </div>
            </div>

            {/* ── RIGHT: Buy Box Skeleton (3 Cols) ── */}
            <div className="col-span-12 xl:col-span-3 bg-pure-white border border-border-line p-5 space-y-4">
              <div className="border-b border-border-line pb-3 space-y-2">
                <div className="w-20 h-3 bg-surface-ivory" />
                <div className="w-32 h-6 bg-surface-ivory" />
                <div className="w-40 h-2.5 bg-surface-ivory" />
              </div>
              <div className="space-y-2 pt-1">
                <div className="w-4/5 h-3 bg-surface-ivory" />
                <div className="w-3/5 h-3 bg-surface-ivory" />
              </div>
              <div className="w-full h-12 bg-primary/20" />
              <div className="w-full h-12 bg-surface-dark/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
