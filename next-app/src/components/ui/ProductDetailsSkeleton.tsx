import React from "react";

/**
 * SVastra PDP loading skeleton — canvas cream ground, ivory blocks,
 * sharp corners, no shadows (DESIGN.md).
 */
export default function ProductDetailsSkeleton() {
  const block = "bg-[#F1E5D2]";

  return (
    <div className="w-full bg-[#FFF8F2] min-h-screen animate-pulse">
      {/* ── Breadcrumb Skeleton ── */}
      <div className="bg-[#F9F3EB] border-b border-[#0E0E0D]/10 py-3">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2.5">
          <div className={`w-12 h-3.5 ${block}`} />
          <div className={`w-2.5 h-3 ${block}`} />
          <div className={`w-16 h-3.5 ${block}`} />
          <div className={`w-2.5 h-3 ${block}`} />
          <div className={`w-28 h-3.5 ${block}`} />
          <div className={`w-2.5 h-3 ${block}`} />
          <div className={`w-36 h-3.5 ${block} hidden sm:block`} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE SKELETON (<lg)
      ══════════════════════════════════════════════════════ */}
      <div className="lg:hidden bg-[#FFF8F2]">
        {/* Top strip */}
        <div className="bg-[#0E0E0D] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-[#FFF8F2]/25" />
            <div className="w-48 h-3 bg-[#FFF8F2]/25" />
          </div>
          <div className="w-3 h-3 bg-[#FFF8F2]/25" />
        </div>

        {/* Brand Header & Title */}
        <div className="px-4 pt-4 pb-3 bg-[#FFF8F2] border-b border-[#0E0E0D]/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 ${block} flex-shrink-0`} />
              <div className="space-y-1.5">
                <div className={`w-20 h-3 ${block}`} />
                <div className={`w-16 h-2.5 ${block}`} />
              </div>
            </div>
            <div className={`w-24 h-4 ${block}`} />
          </div>
          <div className={`w-4/5 h-4 ${block}`} />
          <div className={`w-2/3 h-4 ${block}`} />
        </div>

        {/* Main Image */}
        <div className="w-full aspect-[4/5] bg-[#F1E5D2] border-b border-[#0E0E0D]/10 relative flex items-center justify-center">
          <div className="w-28 h-28 bg-[#0E0E0D]/5" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            <div className="w-4 h-[3px] bg-[#0E0E0D]/20" />
            <div className="w-2 h-[3px] bg-[#0E0E0D]/15" />
            <div className="w-2 h-[3px] bg-[#0E0E0D]/15" />
          </div>
        </div>

        {/* Price Box */}
        <div className="px-4 py-4 bg-[#FFF8F2] border-b border-[#0E0E0D]/10 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-28 h-7 ${block}`} />
            <div className={`w-20 h-4 ${block}`} />
            <div className={`w-14 h-4 ${block}`} />
          </div>
          <div className={`w-36 h-3 ${block}`} />
        </div>

        {/* Benefits strip */}
        <div className="px-4 py-4 bg-[#FFF8F2] border-b border-[#0E0E0D]/10">
          <div className="flex gap-6 overflow-x-hidden">
            <div className={`w-12 h-12 ${block} flex-shrink-0`} />
            <div className={`w-12 h-12 ${block} flex-shrink-0`} />
            <div className={`w-12 h-12 ${block} flex-shrink-0`} />
            <div className={`w-12 h-12 ${block} flex-shrink-0`} />
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-5 bg-[#FFF8F2] border-b border-[#0E0E0D]/10 space-y-3">
          <div className={`w-32 h-4 ${block}`} />
          <div className={`w-44 h-3 ${block}`} />
          <div className={`w-20 h-4 ${block}`} />
          <div className="w-full h-12 bg-[#8B1313]/25" />
          <div className="w-full h-12 border border-[#0E0E0D]/20" />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          DESKTOP SKELETON (lg+)
      ══════════════════════════════════════════════════════ */}
      <div className="hidden lg:block bg-[#FFF8F2]">
        <div className="w-full max-w-[1720px] mx-auto px-6 xl:px-8 py-10">
          <div className="flex gap-12 items-start">
            {/* LEFT: Image Column */}
            <div className="w-[420px] xl:w-[480px] 2xl:w-[520px] flex-shrink-0 flex gap-3">
              <div className="flex flex-col gap-2.5 w-[68px] flex-shrink-0">
                <div className={`w-[68px] h-[84px] ${block}`} />
                <div className={`w-[68px] h-[84px] ${block}`} />
                <div className={`w-[68px] h-[84px] ${block}`} />
                <div className={`w-[68px] h-[84px] ${block}`} />
              </div>
              <div className="flex-1 aspect-[4/5] bg-[#F1E5D2] flex items-center justify-center">
                <div className="w-40 h-40 bg-[#0E0E0D]/5" />
              </div>
            </div>

            {/* CENTER: Details */}
            <div className="flex-1 min-w-0 space-y-5">
              <div className={`w-28 h-3.5 ${block}`} />
              <div className="space-y-2">
                <div className={`w-11/12 h-7 ${block}`} />
                <div className={`w-3/4 h-7 ${block}`} />
                <div className="flex items-center gap-2 pt-1">
                  <div className={`w-28 h-4 ${block}`} />
                  <div className={`w-16 h-4 ${block}`} />
                </div>
              </div>

              <div className="border-t border-[#0E0E0D]/10" />

              <div className="space-y-1.5">
                <div className="flex items-baseline gap-3">
                  <div className={`w-36 h-9 ${block}`} />
                  <div className={`w-24 h-4 ${block}`} />
                  <div className={`w-14 h-5 ${block}`} />
                </div>
                <div className={`w-32 h-3.5 ${block}`} />
              </div>

              <div className="flex gap-8 py-4 border-y border-[#0E0E0D]/10">
                <div className={`w-12 h-12 ${block}`} />
                <div className={`w-12 h-12 ${block}`} />
                <div className={`w-12 h-12 ${block}`} />
                <div className={`w-12 h-12 ${block}`} />
              </div>

              <div className="space-y-3">
                <div className={`w-20 h-4 ${block}`} />
                <div className="flex gap-2.5">
                  <div className={`w-16 h-9 ${block}`} />
                  <div className={`w-16 h-9 ${block}`} />
                  <div className={`w-16 h-9 ${block}`} />
                </div>
              </div>

              <div className="pt-4 border-t border-[#0E0E0D]/10 space-y-3">
                <div className={`w-36 h-5 ${block}`} />
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-[#0E0E0D]/10">
                    <div className={`w-32 h-3.5 ${block}`} />
                    <div className={`w-48 h-3.5 ${block}`} />
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#0E0E0D]/10">
                    <div className={`w-28 h-3.5 ${block}`} />
                    <div className={`w-56 h-3.5 ${block}`} />
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#0E0E0D]/10">
                    <div className={`w-36 h-3.5 ${block}`} />
                    <div className={`w-40 h-3.5 ${block}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Buy Box */}
            <div className="w-[250px] xl:w-[270px] flex-shrink-0 bg-white border border-[#0E0E0D]/12 p-5 space-y-4">
              <div className={`w-28 h-6 ${block}`} />
              <div className={`w-20 h-3 ${block}`} />
              <div className="space-y-2 pt-2 border-t border-[#0E0E0D]/10">
                <div className={`w-4/5 h-3 ${block}`} />
                <div className={`w-3/5 h-3 ${block}`} />
                <div className={`w-3/5 h-3 ${block}`} />
              </div>
              <div className="w-full h-11 bg-[#8B1313]/25" />
              <div className="w-full h-11 border border-[#0E0E0D]/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
