"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "../../../../utils/axios";
import ProductCard from "@/components/(frontend)/ProductCard";
import {
  ArchetypeConfig,
  otherArchetypes,
} from "@/data/archetypes";

type Props = {
  archetype: ArchetypeConfig;
};

function matchCategories(categories: any[], names: string[]) {
  const lowered = names.map((n) => n.toLowerCase());
  const exact = categories.filter((c) =>
    lowered.includes(String(c.name || "").toLowerCase())
  );
  if (exact.length) return exact;

  // Soft match: archetype keyword inside catalog category name
  return categories.filter((c) => {
    const cn = String(c.name || "").toLowerCase();
    return lowered.some((n) => {
      const key = n.replace(/^the\s+/, "").trim();
      return key.length > 2 && (cn.includes(key) || key.includes(cn));
    });
  });
}

export default function ArchetypePageContent({ archetype }: Props) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cols, setCols] = useState<3 | 4>(4);
  const [sortBy, setSortBy] = useState("newest");
  const others = otherArchetypes(archetype.slug);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const catRes = await axios.get("/api/categories-with-products").catch(() =>
          axios.get("/api/categories")
        );
        let cats: any[] = [];
        if (Array.isArray(catRes.data)) cats = catRes.data;
        else if (Array.isArray(catRes.data?.data)) cats = catRes.data.data;

        const pool = cats.filter((c) => !(c.parentId ?? c.parent_id));
        const matched = matchCategories(pool.length ? pool : cats, archetype.categoryNames);
        const matchedIds = new Set(matched.map((c) => Number(c.id)).filter(Boolean));

        let list: any[] = [];

        // Prefer catalog products whose category matches mapped archetype categories
        const allRes = await axios.get("/api/products-paginated?per_page=48&page=1").catch(() => null);
        let all: any[] =
          allRes?.data?.data?.products ||
          allRes?.data?.products ||
          allRes?.data?.data ||
          [];
        if (!Array.isArray(all) || all.length === 0) {
          const fallback = await axios.get("/api/products");
          all = Array.isArray(fallback.data)
            ? fallback.data
            : fallback.data?.data || fallback.data?.products || [];
        }
        all = Array.isArray(all) ? all : [];

        if (matchedIds.size > 0) {
          list = all.filter((p) => {
            const cid = Number(p.category_id ?? p.category?.id ?? 0);
            return matchedIds.has(cid);
          });
        }

        // If an exact archetype category exists in admin, also fetch by id
        if (list.length === 0 && matched[0]?.id) {
          const res = await axios.get(
            `/api/products-paginated?per_page=24&page=1&category_id=${matched[0].id}`
          );
          list =
            res.data?.data?.products ||
            res.data?.products ||
            res.data?.data ||
            [];
        }

        // Deterministic partition so each archetype still gets a distinct edit
        if (!Array.isArray(list) || list.length === 0) {
          const idx = Math.max(
            0,
            ["the-leader", "the-mentor", "the-creator", "the-home-manager"].indexOf(
              archetype.slug
            )
          );
          list = all.filter((_, i) => i % 4 === idx);
          if (list.length === 0) list = all;
        }

        if (!cancelled) setProducts(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Archetype products failed", e);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [archetype]);

  const sorted = useMemo(() => {
    const copy = [...products];
    if (sortBy === "price_low") {
      copy.sort(
        (a, b) =>
          Number(a.best_variant?.sp ?? a.min_price ?? 0) -
          Number(b.best_variant?.sp ?? b.min_price ?? 0)
      );
    } else if (sortBy === "price_high") {
      copy.sort(
        (a, b) =>
          Number(b.best_variant?.sp ?? b.min_price ?? 0) -
          Number(a.best_variant?.sp ?? a.min_price ?? 0)
      );
    }
    return copy;
  }, [products, sortBy]);

  const count = sorted.length;
  const first = sorted.slice(0, 8);
  const second = sorted.slice(8, 12);

  return (
    <div className="w-full bg-surface">
      {/* Breadcrumb */}
      <section className="w-full bg-pure-white border-b border-border-line">
        <div className="max-w-site mx-auto site-pad py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 label-caps text-body-slate">
            <Link href="/#shop-who" className="hover:text-primary transition-colors">
              Shop Who You Are
            </Link>
            <span className="text-on-surface/25">/</span>
            <span className="text-primary">
              {archetype.chapter}: {archetype.name}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 label-caps text-body-slate">
            <span className="text-on-surface font-semibold">
              {loading ? "…" : `${count} Edited Silhouettes`}
            </span>
            <span className="text-on-surface/25">•</span>
            <span>Autumn / Winter Archive</span>
          </div>
        </div>
      </section>

      {/* Role Hero */}
      <section className="w-full bg-surface overflow-hidden border-b border-border-line">
        <div className="max-w-site mx-auto site-pad py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6 flex flex-col gap-7">
              <div>
                <span className="label-caps text-primary block mb-3">
                  Role Study · Archetype {archetype.roleNo}
                </span>
                <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-bold uppercase tracking-[-0.03em] leading-[0.95] text-on-surface mb-3">
                  {archetype.name}
                </h1>
                <p className="text-lg sm:text-xl text-body-slate font-medium tracking-tight">
                  {archetype.tagline}
                </p>
              </div>

              <div className="bg-surface-ivory border border-border-line p-6 sm:p-8 max-w-xl">
                <p className="text-lg sm:text-xl font-medium text-on-surface leading-relaxed tracking-tight">
                  “{archetype.quote}”
                </p>
                <span className="block mt-3 label-caps text-body-slate">{archetype.quoteAttr}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-lg">
                {archetype.specs.map((s) => (
                  <div key={s.label}>
                    <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-body-slate block mb-1">
                      {s.label}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-on-surface block tracking-tight">
                      {s.value}
                    </span>
                    <span className="text-[12px] text-body-slate block mt-0.5">{s.note}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a href="#curated-collection" className="sv-btn-primary">
                  View The Edit ({count || 12})
                </a>
                <a
                  href="#story"
                  className="label-caps text-on-surface hover:text-primary underline underline-offset-8 transition-colors px-2 py-3"
                >
                  Read Her Story
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative w-full aspect-[4/5] bg-surface-ivory overflow-hidden border border-border-line">
                <img
                  src={archetype.heroImg}
                  alt={archetype.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute top-5 left-5 bg-surface-dark text-surface px-3 py-2 label-caps">
                  {archetype.heroBadge}
                </div>
                <div className="absolute bottom-5 left-5 right-5 bg-surface/95 border border-border-line p-4">
                  <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-primary block mb-1">
                    {archetype.heroCaptionTitle}
                  </span>
                  <p className="text-[13px] text-on-surface leading-relaxed">{archetype.heroCaptionBody}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="w-full bg-surface-subtle border-b border-border-line scroll-mt-24">
        <div className="max-w-site mx-auto site-pad py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <span className="label-caps text-primary block mb-3">{archetype.storyEyebrow}</span>
              <h2 className="display-section text-on-surface uppercase mb-4">{archetype.storyTitle}</h2>
              <div className="w-16 h-1 bg-primary mb-6" />
              <p className="text-[16px] text-body-slate leading-relaxed">{archetype.storyBody}</p>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {archetype.storyCards.map((card, i) => (
                <div key={card.title} className="bg-surface border border-border-line p-6 sm:p-8">
                  <div className="w-10 h-10 bg-primary text-surface flex items-center justify-center label-caps mb-5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-on-surface mb-3">
                    {card.title}
                  </h3>
                  <p className="text-[14px] text-body-slate leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Collection */}
      <section id="curated-collection" className="w-full bg-surface scroll-mt-24">
        <div className="max-w-site mx-auto site-pad pt-14 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 border-b border-border-line pb-6">
            <div>
              <span className="label-caps text-body-slate block mb-2">Curated Collection</span>
              <h2 className="display-section text-on-surface uppercase">The {archetype.name.replace(/^The\s+/i, "")} Edit</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex border border-border-line">
                <button
                  type="button"
                  onClick={() => setCols(4)}
                  className={`px-3 py-2 text-[11px] font-semibold tracking-[0.08em] uppercase ${
                    cols === 4 ? "bg-surface-dark text-surface" : "bg-pure-white text-body-slate"
                  }`}
                >
                  4 Col
                </button>
                <button
                  type="button"
                  onClick={() => setCols(3)}
                  className={`px-3 py-2 text-[11px] font-semibold tracking-[0.08em] uppercase border-l border-border-line ${
                    cols === 3 ? "bg-surface-dark text-surface" : "bg-pure-white text-body-slate"
                  }`}
                >
                  3 Col
                </button>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 bg-pure-white border border-border-line text-[11px] font-semibold tracking-[0.06em] uppercase text-on-surface focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="newest">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
              <Link href={`/products`} className="label-caps text-primary hover:text-on-surface">
                All Collections →
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center border border-dashed border-border-line">
              <div className="w-10 h-10 border-2 border-border-line border-t-primary animate-spin mx-auto mb-4" />
              <p className="label-caps text-primary">Loading The Edit</p>
            </div>
          ) : count === 0 ? (
            <div className="py-16 px-6 border border-border-line bg-surface-subtle text-center">
              <span className="label-caps text-primary block mb-3">Archive Quiet</span>
              <h3 className="text-2xl font-bold uppercase mb-3">No pieces in this edit yet</h3>
              <p className="text-body-slate mb-6 max-w-md mx-auto">
                Create a category named “{archetype.name}” in the dashboard and assign products to it.
              </p>
              <Link href="/products" className="sv-btn-primary inline-flex">
                Browse Collections
              </Link>
            </div>
          ) : (
            <>
              <div
                className={`grid gap-4 sm:gap-5 ${
                  cols === 4
                    ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {first.map((p) => (
                  <ProductCard key={p.id} product={p} compact />
                ))}
              </div>

              {second.length > 0 && (
                <>
                  <div className="my-12 lg:my-16 py-12 lg:py-16 bg-surface-dark text-surface site-pad -mx-[clamp(1.25rem,4vw,5rem)] px-[clamp(1.25rem,4vw,5rem)]">
                    <div className="max-w-3xl">
                      <span className="label-caps text-surface/60 block mb-3">Editorial Interlude</span>
                      <h3 className="text-2xl sm:text-4xl font-bold uppercase tracking-[-0.02em] leading-tight mb-4">
                        {archetype.interludeTitle}
                      </h3>
                      <p className="text-[15px] sm:text-[17px] text-surface/75 leading-relaxed">
                        {archetype.interludeBody}
                      </p>
                    </div>
                  </div>
                  <p className="label-caps text-body-slate mb-5">
                    Showing {Math.min(9, count)}–{Math.min(12, count)} of {count}
                  </p>
                  <div
                    className={`grid gap-4 sm:gap-5 ${
                      cols === 4
                        ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    }`}
                  >
                    {second.map((p) => (
                      <ProductCard key={p.id} product={p} compact />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Moods */}
      <section className="w-full bg-surface-subtle border-y border-border-line">
        <div className="max-w-site mx-auto site-pad py-14 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="label-caps text-primary block mb-2">Shop How You Feel</span>
              <h2 className="display-section text-on-surface uppercase">{archetype.moodTitle}</h2>
            </div>
            <Link href="/#shop-feel" className="label-caps text-on-surface hover:text-primary">
              Explore All Emotions →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {archetype.moods.map((m) => (
              <Link
                key={m.label}
                href={m.href}
                className="bg-surface border border-border-line p-6 hover:border-on-surface transition-colors group"
              >
                <span className="label-caps text-primary block mb-2">{m.label}</span>
                <p className="text-[15px] text-body-slate mb-4">{m.desc}</p>
                <span className="text-[11px] font-semibold tracking-[0.1em] uppercase group-hover:text-primary">
                  Enter Mood →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Other archetypes */}
      <section className="w-full bg-surface">
        <div className="max-w-site mx-auto site-pad py-14 lg:py-20">
          <div className="mb-8">
            <span className="label-caps text-primary block mb-2">Identity Multiplicity</span>
            <h2 className="display-section text-on-surface uppercase">
              Discover Another Version Of You
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {others.map((a) => (
              <Link
                key={a.slug}
                href={`/shop/${a.slug}`}
                className="group border border-border-line bg-pure-white hover:border-on-surface transition-colors"
              >
                <div className="aspect-[4/5] overflow-hidden bg-surface-ivory">
                  <img
                    src={a.heroImg}
                    alt={a.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <span className="label-caps text-primary block mb-1">{a.chapter}</span>
                  <h3 className="text-lg font-bold uppercase tracking-tight mb-2">{a.name}</h3>
                  <p className="text-[13px] text-body-slate line-clamp-2 mb-4">{a.blurb}</p>
                  <span className="text-[11px] font-semibold tracking-[0.1em] uppercase group-hover:text-primary">
                    View Chapter →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sign-off */}
      <section className="w-full bg-surface-dark text-surface">
        <div className="max-w-site mx-auto site-pad py-16 lg:py-24 text-center">
          <span className="label-caps text-surface/50 block mb-4">SVastra Ethos</span>
          <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-[-0.03em] mb-6">
            Wear Yourself.
          </h2>
          <Link href="/#manifesto" className="sv-btn-outline !border-surface/30 !text-surface hover:!bg-surface hover:!text-on-surface inline-flex">
            Read The Manifesto
          </Link>
        </div>
      </section>
    </div>
  );
}
