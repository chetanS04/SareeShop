"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  loadShopWhoYouAreFacets,
  type ShopFacetCard,
} from "@/utils/archetypeCatalog";

const FALLBACK = "/svastra/logo-mark.png";

export default function SvastraWhoYouAre() {
  const [facets, setFacets] = useState<ShopFacetCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadShopWhoYouAreFacets(8)
      .then((list) => {
        if (!cancelled) setFacets(list);
      })
      .catch(() => {
        if (!cancelled) setFacets([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="shop-who"
      className="w-full bg-surface-subtle border-b border-border-line scroll-mt-24"
      aria-labelledby="who-title"
    >
      <div className="max-w-site mx-auto site-pad section-y">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-on-surface/15 pb-6 sm:pb-8 mb-8 sm:mb-12 gap-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3 label-caps text-primary">
              <span>Chapter 01</span>
              <span className="text-on-surface/30" aria-hidden="true">
                /
              </span>
              <span className="text-body-slate">Live Catalog</span>
            </div>
            <h2 id="who-title" className="display-section text-on-surface">
              Shop Who You Are
            </h2>
            <p className="text-[15px] sm:text-[17px] leading-[1.6] text-body-slate mt-3">
              Categories from our archive — real weaves, real names, updated from the atelier
              catalog.
            </p>
          </div>
          <Link
            href="/categories"
            className="label-caps text-on-surface hover:text-primary transition-colors flex items-center gap-2 self-start md:self-end shrink-0"
          >
            <span>Explore All Categories</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="border border-border-line bg-surface-ivory aspect-[3/4] animate-pulse"
              />
            ))}
          </div>
        ) : facets.length === 0 ? (
          <div className="border border-border-line bg-surface p-10 text-center">
            <p className="text-body-slate mb-4">No categories in the catalog yet.</p>
            <Link href="/products" className="sv-btn-primary inline-flex">
              Browse The Edit
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
            {facets.map((facet, index) => {
              const src = facet.imageUrl || FALLBACK;
              const roleNo = String(index + 1).padStart(2, "0");
              return (
                <article
                  key={facet.id}
                  className="bg-surface border border-border-line flex flex-col justify-between group hover:border-on-surface transition-colors max-w-md sm:max-w-none mx-auto sm:mx-0 w-full"
                >
                  <div>
                    <div className="media-frame facet-media">
                      <Link
                        href={facet.href}
                        className="absolute inset-0 z-[1]"
                        aria-label={facet.name}
                      />
                      <img
                        alt={facet.name}
                        className="group-hover:scale-105 transition-transform duration-700 object-cover object-top w-full h-full"
                        loading="lazy"
                        decoding="async"
                        width={600}
                        height={800}
                        src={src}
                      />
                      <div className="absolute top-3 left-3 z-[2] bg-surface-dark text-surface px-2 py-1 text-[10px] font-semibold tracking-widest uppercase">
                        {roleNo}
                      </div>
                    </div>
                    <div className="p-5 sm:p-6">
                      <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-primary block mb-2">
                        Category
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold uppercase tracking-[-0.015em]">
                        <Link
                          href={facet.href}
                          className="hover:text-primary transition-colors"
                        >
                          {facet.name}
                        </Link>
                      </h3>
                      {facet.description ? (
                        <p className="text-[14px] leading-[1.6] text-body-slate mt-3 line-clamp-3">
                          {facet.description}
                        </p>
                      ) : null}
                      <p className="text-[11px] tracking-wider uppercase text-body-slate mt-3">
                        {facet.productCount} piece{facet.productCount === 1 ? "" : "s"} in edit
                      </p>
                    </div>
                  </div>
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-border-line/60">
                    <Link
                      href={facet.href}
                      className="pt-4 flex items-center justify-between text-[11px] font-semibold tracking-[0.1em] uppercase group-hover:text-primary transition-colors"
                    >
                      <span>Shop Category</span>
                      <span
                        className="group-hover:translate-x-1 transition-transform"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
