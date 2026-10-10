"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  loadShopHowYouFeelFacets,
  type ShopFacetCard,
} from "@/utils/archetypeCatalog";

const FALLBACK = "/svastra/logo-mark.png";

const DEFAULT_DESC =
  "Pick a mood and explore sarees curated for that moment — from everyday ease to celebration.";

const DEFAULT_POINTS = [
  "Handpicked sarees from our live collection",
  "Comfortable weaves for everyday and special moments",
  "Shipped with care across India",
];

type MoodMeta = {
  subtitle: string;
  specs: { label: string; value: string }[];
};

const MOOD_META: Record<string, MoodMeta> = {
  minimal: {
    subtitle: "Pristine weaves and quiet lines for days that ask for clarity, not noise.",
    specs: [
      { label: "Weave", value: "Kora cotton & muslin" },
      { label: "Occasion", value: "Work & everyday" },
      { label: "Feel", value: "Light & breathable" },
    ],
  },
  brunch: {
    subtitle: "Sunlit ease in featherlight Chanderi and linen — made for slow afternoons.",
    specs: [
      { label: "Weave", value: "Chanderi & linen blends" },
      { label: "Occasion", value: "Day outings" },
      { label: "Feel", value: "Soft & airy" },
    ],
  },
  festive: {
    subtitle: "Celebratory handloom colour without costume — host-ready, rooted, modern.",
    specs: [
      { label: "Weave", value: "Silk & zari accents" },
      { label: "Occasion", value: "Festivals & gatherings" },
      { label: "Feel", value: "Rich & luminous" },
    ],
  },
  travel: {
    subtitle: "Resilient drapes that pack well and hold their poise from morning to evening.",
    specs: [
      { label: "Weave", value: "Tussar & cotton silk" },
      { label: "Occasion", value: "Transit & meetings" },
      { label: "Feel", value: "Easy & unfussy" },
    ],
  },
  celebration: {
    subtitle: "Evening depth and sculpted drape for moments that deserve quiet drama.",
    specs: [
      { label: "Weave", value: "Georgette & silk" },
      { label: "Occasion", value: "Soirées & events" },
      { label: "Feel", value: "Fluid & refined" },
    ],
  },
  power: {
    subtitle: "Structured presence in handloom silk — for days the room follows your lead.",
    specs: [
      { label: "Weave", value: "Raw silk & tussar" },
      { label: "Occasion", value: "Boardroom & stage" },
      { label: "Feel", value: "Weighted & assured" },
    ],
  },
};

const DEFAULT_MOOD_META: MoodMeta = {
  subtitle: "Handloom sarees chosen for how you want to feel — not just where you are going.",
  specs: [
    { label: "Weave", value: "Cotton, silk & linen" },
    { label: "Occasion", value: "Everyday to festive" },
    { label: "Feel", value: "Natural & comfortable" },
  ],
};

function getMoodMeta(name: string): MoodMeta {
  const key = name.toLowerCase().trim();
  return MOOD_META[key] || DEFAULT_MOOD_META;
}

type LookSlide = {
  img: string;
  title: string;
};

function sanitizeEditorial(raw: string): string {
  const text = String(raw || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  if (/polo|t-?shirt|ausk|rib knit|full sleeve|men'?s cotton/i.test(text)) return "";
  const sample = text.slice(0, 28);
  if (sample.length >= 12 && text.split(sample).length >= 4) return "";
  return text;
}

function buildPoints(description: string): string[] {
  const clean = sanitizeEditorial(description);
  if (!clean) return DEFAULT_POINTS;
  const parts = clean
    .split(/[.\n|;•]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 18 && s.toLowerCase() !== clean.toLowerCase());
  if (parts.length >= 2) return parts.slice(0, 3).map((p) => p.slice(0, 90));
  return DEFAULT_POINTS;
}

function buildLook(active: ShopFacetCard | null): LookSlide {
  return {
    img: active?.imageUrl || FALLBACK,
    title: active?.name || "Collection highlight",
  };
}

export default function SvastraHowYouFeel() {
  const [facets, setFacets] = useState<ShopFacetCard[]>([]);
  const [loadingTabs, setLoadingTabs] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [look, setLook] = useState<LookSlide>({
    img: FALLBACK,
    title: "Collection highlight",
  });
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
      setLook({ img: FALLBACK, title: "Collection highlight" });
      setLoadingLook(false);
      return;
    }

    setLook(buildLook(active));
    setLoadingLook(false);
  }, [active?.id, active?.imageUrl, active?.name]);

  if (!loadingTabs && facets.length === 0) {
    return null;
  }

  const cleanDesc = sanitizeEditorial(active?.description || "");
  const points = buildPoints(active?.description || "");
  const shopHref = active?.href || "/categories";
  const shopLabel = "Shop Now";
  const tag = active ? `Mood: ${active.name}` : "Mood";
  const title = active?.name || "Capsule";
  const moodMeta = getMoodMeta(active?.name || "");
  const desc = cleanDesc || moodMeta.subtitle || DEFAULT_DESC;
  const pieceCount = Number(active?.productCount ?? 0);

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
            <span className="text-on-surface/30" aria-hidden="true">/</span>
            <span className="text-body-slate">Shop by Mood</span>
          </div>
          <h2 id="feel-title" className="display-section text-on-surface uppercase">
            Shop How You Feel
          </h2>
          <p className="text-[15px] sm:text-[17px] leading-[1.6] text-body-slate mt-3">
            Browse sarees by mood and moment. Select a category and explore pieces that match how
            you feel today.
          </p>
        </div>

        {loadingTabs ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
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
              const num = String(index + 1).padStart(2, "0");
              return (
                <button
                  key={facet.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveId(facet.id)}
                  className={`text-left p-3 sm:p-4 border transition-all min-h-[64px] sm:min-h-[72px] ${
                    isActive
                      ? "bg-surface-dark text-surface border-surface-dark"
                      : "bg-surface-ivory text-on-surface border-border-line hover:bg-surface-dark hover:text-surface hover:border-surface-dark"
                  }`}
                >
                  <span className="text-[10px] tracking-widest block opacity-70 mb-1">
                    {num} // Mood
                  </span>
                  <span className="text-[12px] font-bold tracking-[0.12em] uppercase line-clamp-1">
                    {facet.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="border border-on-surface bg-surface-subtle p-4 sm:p-8 lg:p-10 xl:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-5 space-y-4 sm:space-y-5 min-w-0">
              <div className="inline-block px-3 py-1 bg-primary text-surface text-[11px] font-semibold tracking-[0.14em] uppercase">
                {tag}
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-tight text-on-surface leading-tight break-words">
                {title}
              </h3>
              <p className="text-[15px] sm:text-[17px] leading-[1.65] text-body-slate">
                {desc}
              </p>
              <div className="space-y-2.5 text-[14px] text-on-surface font-medium">
                {points.map((p) => (
                  <div key={p} className="flex items-start gap-3">
                    <span className="text-primary mt-0.5 shrink-0" aria-hidden="true">✓</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-1">
                <Link href={shopHref} className="sv-btn-primary inline-flex items-center justify-center gap-3">
                  <span>{shopLabel}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/categories"
                  className="label-caps text-on-surface hover:text-primary transition-colors inline-flex items-center justify-center gap-2 px-2 py-3"
                >
                  <span>All Categories</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4 min-w-0">
              <div className="bg-surface border border-border-line p-4 sm:p-5 flex-1">
                <span className="label-caps text-primary block mb-3">In This Mood</span>
                <p className="text-[14px] sm:text-[15px] leading-[1.65] text-body-slate">
                  Handloom sarees matched to this mood — natural fabrics, easy drape, and honest
                  pricing on every piece.
                </p>
                {pieceCount > 0 && (
                  <p className="mt-4 pt-4 border-t border-border-line text-[13px] text-on-surface">
                    <span className="font-bold">{pieceCount}</span>{" "}
                    {pieceCount === 1 ? "piece" : "pieces"} in this edit
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-3">
                {moodMeta.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="bg-surface-ivory border border-border-line px-3.5 py-3 sm:px-4 sm:py-3.5"
                  >
                    <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-primary block mb-1">
                      {spec.label}
                    </span>
                    <span className="text-[13px] sm:text-sm font-semibold text-on-surface leading-snug">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 w-full flex justify-center lg:justify-end min-w-0">
              <figure
                className={`relative w-full max-w-[220px] sm:max-w-[260px] lg:max-w-none lg:w-full aspect-[3/4] shrink-0 bg-surface-dark overflow-hidden border border-border-line ${
                  loadingLook ? "animate-pulse" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={`${active?.id || "mood"}-${look.img}`}
                  src={look.img}
                  alt={title}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
                <figcaption className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 bg-surface-dark/85 text-surface text-[10px] font-semibold uppercase tracking-wider">
                  {title}
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
