"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  fetchProductsList,
  loadShopHowYouFeelFacets,
  productImageUrl,
  type ShopFacetCard,
} from "@/utils/archetypeCatalog";

const FALLBACK = "/svastra/logo-mark.png";

const DEFAULT_POINTS = [
  "Archive pieces curated from the live atelier catalog",
  "Handloom provenance with documented weave characteristics",
  "Ready for private fitting and concierge dispatch",
];

function buildPoints(description: string): string[] {
  const clean = description.trim();
  if (!clean) return DEFAULT_POINTS;
  const parts = clean
    .split(/[.\n|;•]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 18 && s.toLowerCase() !== clean.toLowerCase());
  if (parts.length >= 2) return parts.slice(0, 3);
  return DEFAULT_POINTS;
}

export default function SvastraHowYouFeel() {
  const [facets, setFacets] = useState<ShopFacetCard[]>([]);
  const [loadingTabs, setLoadingTabs] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [looks, setLooks] = useState<{ img: string; title: string }[]>([]);
  const [loadingLook, setLoadingLook] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingTabs(true);
    loadShopHowYouFeelFacets(4, 6)
      .then((list) => {
        if (cancelled) return;
        setFacets(list);
        if (list.length) setActiveId(list[0].id);
      })
      .catch(() => {
        if (!cancelled) setFacets([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingTabs(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const active = useMemo(
    () => facets.find((f) => f.id === activeId) || facets[0] || null,
    [facets, activeId]
  );

  useEffect(() => {
    if (!active) {
      setLooks([]);
      setLoadingLook(false);
      return;
    }

    let cancelled = false;
    setLoadingLook(true);

    (async () => {
      let list = await fetchProductsList({
        per_page: 4,
        page: 1,
        category_id: active.id,
      });
      if (!list.length) {
        list = await fetchProductsList({ per_page: 4, page: 1 });
      }
      if (cancelled) return;

      const product = list[0];
      setLooks([
        {
          img: productImageUrl(product) || active.imageUrl || FALLBACK,
          title: String(product?.name || active.name || "Archive piece"),
        },
      ]);
      setLoadingLook(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [active?.id, active?.imageUrl, active?.name]);

  if (!loadingTabs && facets.length === 0) {
    return null;
  }

  const points = buildPoints(active?.description || "");
  const shopHref = active?.href || "/categories";
  const shopLabel = active ? `Shop ${active.name} Capsule` : "Shop Capsule";
  const tag = active ? `Frequency: ${active.name}` : "Frequency";
  const title = active?.name || "Capsule";
  const desc =
    active?.description ||
    "Curations driven by inner frequency — select a category from the archive beyond the primary facets.";

  return (
    <section
      id="shop-feel"
      className="w-full bg-surface border-b border-border-line scroll-mt-24"
      aria-labelledby="feel-title"
    >
      <div className="max-w-site mx-auto site-pad section-y">
        <div className="max-w-3xl mb-10 sm:mb-12">
          <div className="flex items-center gap-2 mb-3 label-caps text-primary">
            <span>Chapter 02</span>
            <span className="text-on-surface/30" aria-hidden="true">
              /
            </span>
            <span className="text-body-slate">Affective Frequencies</span>
          </div>
          <h2 id="feel-title" className="display-section text-on-surface uppercase">
            Shop How You Feel
          </h2>
          <p className="text-[15px] sm:text-[17px] leading-[1.6] text-body-slate mt-3">
            Further archive categories — after the primary four facets — curated as frequencies.
            Select a state of being and enter the capsule.
          </p>
        </div>

        {loadingTabs ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[72px] border border-border-line bg-surface-ivory animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div
            className={`grid gap-2 mb-8 ${
              facets.length <= 2
                ? "grid-cols-2"
                : facets.length <= 3
                  ? "grid-cols-2 sm:grid-cols-3"
                  : facets.length <= 4
                    ? "grid-cols-2 sm:grid-cols-4"
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
            }`}
            role="tablist"
          >
            {facets.map((facet, index) => {
              const isActive = active?.id === facet.id;
              const num = String(index + 5).padStart(2, "0");
              return (
                <button
                  key={facet.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveId(facet.id)}
                  className={`text-left p-4 border transition-all ${
                    isActive
                      ? "bg-surface-dark text-surface border-surface-dark"
                      : "bg-surface-ivory text-on-surface border-border-line hover:bg-surface-dark hover:text-surface hover:border-surface-dark"
                  }`}
                >
                  <span className="text-[10px] tracking-widest block opacity-70 mb-1">
                    {num} // Frequency
                  </span>
                  <span className="text-[12px] font-bold tracking-[0.12em] uppercase line-clamp-1">
                    {facet.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Compact plate: copy left + single look flush right */}
        <div className="border border-on-surface bg-surface-subtle overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center gap-3 sm:gap-3.5 p-5 sm:p-6 lg:p-7 lg:pr-8">
              <div className="inline-block self-start px-2.5 py-1 bg-primary text-surface text-[10px] font-semibold tracking-[0.14em] uppercase">
                {tag}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-on-surface leading-tight">
                {title}
              </h3>
              <p className="text-[13px] sm:text-[14px] leading-[1.55] text-body-slate line-clamp-3 max-w-xl">
                {desc}
              </p>
              <div className="space-y-1.5 text-[12px] sm:text-[13px] text-on-surface font-medium">
                {points.map((p) => (
                  <div key={p} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 shrink-0 text-[11px]" aria-hidden="true">
                      ✓
                    </span>
                    <span className="line-clamp-1">{p}</span>
                  </div>
                ))}
              </div>
              <Link
                href={shopHref}
                className="sv-btn-primary inline-flex self-start mt-1 !py-3 !px-5 !text-[10px]"
              >
                {shopLabel}
              </Link>
            </div>

            <div className="lg:col-span-5 relative min-h-[260px] sm:min-h-[300px] lg:min-h-0 border-t lg:border-t-0 lg:border-l border-border-line">
              {looks[0] ? (
                <figure
                  className={`absolute inset-0 overflow-hidden bg-surface-ivory ${
                    loadingLook ? "animate-pulse" : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={looks[0].img}
                    alt={looks[0].title}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                </figure>
              ) : (
                <div className="absolute inset-0 bg-surface-ivory animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
