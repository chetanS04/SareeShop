"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "../../../../utils/axios";
import { getImageUrl } from "../../../../utils/imageUtils";
import imgPlaceholder from "@/public/imagePlaceholder.png";

type Category = {
  id: number;
  name: string;
  description?: string | null;
  image?: string | null;
  secondaryImage?: string | null;
  secondary_image?: string | null;
  parentId?: number | null;
  parent_id?: number | null;
  status?: boolean;
  children?: Category[];
};

function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function padIndex(n: number): string {
  return String(n).padStart(2, "0");
}

function makeTag(plainDesc: string, name: string): string {
  if (plainDesc) {
    const first = plainDesc.split(/[.!?]/)[0]?.trim() || "";
    if (first.length >= 8) {
      return first.length > 42 ? `${first.slice(0, 40).trim()}…` : first;
    }
  }
  return `Collection · ${name}`;
}

export default function SvastraWhoYouAre() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await axios.get("/api/categories-with-products");
        let data: Category[] = [];
        if (Array.isArray(res.data)) data = res.data;
        else if (Array.isArray(res.data?.data)) data = res.data.data;

        // Parent / root categories only (same shop hierarchy as Collections)
        const parents = data.filter((c) => {
          const parent = c.parentId ?? c.parent_id ?? null;
          const active = c.status !== false;
          return parent == null && active;
        });

        if (!cancelled) setCategories(parents);
      } catch (err) {
        console.error("Failed to load Shop Who You Are categories", err);
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
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
              <span className="text-body-slate">Your Collections</span>
            </div>
            <h2 id="who-title" className="display-section text-on-surface">
              Shop Who You Are
            </h2>
            <p className="text-[15px] sm:text-[17px] leading-[1.6] text-body-slate mt-3">
              Facets of the same sovereign woman — shop by the collections you curate in your catalogue.
            </p>
          </div>
          <Link
            href="/products"
            className="label-caps text-on-surface hover:text-primary transition-colors flex items-center gap-2 self-start md:self-end shrink-0"
          >
            <span>Explore All Collections</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-surface border border-border-line animate-pulse">
                <div className="media-frame facet-media bg-surface-ivory" />
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="h-2.5 w-1/3 bg-[rgba(14,14,13,0.08)]" />
                  <div className="h-5 w-2/3 bg-[rgba(14,14,13,0.12)]" />
                  <div className="h-3 w-full bg-[rgba(14,14,13,0.06)]" />
                  <div className="h-3 w-5/6 bg-[rgba(14,14,13,0.06)]" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="border border-[rgba(14,14,13,0.12)] bg-surface px-8 py-14 text-center">
            <span className="label-caps text-primary block mb-3">Catalogue</span>
            <h3 className="text-xl font-bold uppercase tracking-[-0.02em] text-on-surface mb-3">
              No collections yet
            </h3>
            <p className="text-[15px] text-body-slate max-w-md mx-auto mb-6 leading-relaxed">
              Add parent categories in the dashboard and they will appear here in this editorial grid.
            </p>
            <Link href="/products" className="sv-btn-outline inline-flex">
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
            {categories.map((cat, index) => {
              const plain = stripHtml(cat.description);
              const tag = makeTag(plain, cat.name);
              const img =
                getImageUrl(cat.image) ||
                getImageUrl(cat.secondaryImage || cat.secondary_image) ||
                (typeof imgPlaceholder === "string" ? imgPlaceholder : imgPlaceholder.src);
              const href = `/products?category_id=${cat.id}`;
              const desc =
                plain ||
                "Enter this collection to browse curated pieces shaped for this facet of you.";

              return (
                <article
                  key={cat.id}
                  className="bg-surface border border-border-line flex flex-col justify-between group hover:border-on-surface transition-colors max-w-md sm:max-w-none mx-auto sm:mx-0 w-full"
                >
                  <div>
                    <div className="media-frame facet-media">
                      <Link href={href} className="absolute inset-0 z-[1]" aria-label={cat.name} />
                      <img
                        alt={cat.name}
                        className="group-hover:scale-105 transition-transform duration-700 object-cover object-top w-full h-full"
                        loading="lazy"
                        decoding="async"
                        width={600}
                        height={800}
                        src={img}
                      />
                      <div className="absolute top-3 left-3 z-[2] bg-surface-dark text-surface px-2 py-1 text-[10px] font-semibold tracking-widest uppercase">
                        {padIndex(index + 1)}
                      </div>
                    </div>
                    <div className="p-5 sm:p-6">
                      <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-primary block mb-2">
                        {tag}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold uppercase tracking-[-0.015em]">
                        <Link href={href} className="hover:text-primary transition-colors">
                          {cat.name}
                        </Link>
                      </h3>
                      <p className="text-[14px] leading-[1.6] text-body-slate mt-3 line-clamp-3">{desc}</p>
                    </div>
                  </div>
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-border-line/60">
                    <Link
                      href={href}
                      className="pt-4 flex items-center justify-between text-[11px] font-semibold tracking-[0.1em] uppercase group-hover:text-primary transition-colors"
                    >
                      <span>Enter Collection</span>
                      <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">
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
