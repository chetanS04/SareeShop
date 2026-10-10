"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Home, ArrowRight } from "lucide-react";
import axios from "../../../../utils/axios";
import { getCategorySlug } from "../../../../utils/slugUtils";
import { getImageUrl } from "../../../../utils/imageUtils";
import { categoryDescriptionOrFallback, sanitizeCategoryDescription } from "../../../../utils/textUtils";

type Category = {
  id: number;
  name: string;
  description?: string;
  secondary_image: string | null;
  link: string | null;
  image: string | null;
  products_count?: number;
  productsCount?: number;
};

const FALLBACK = "/svastra/logo-mark.png";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`/api/categories-with-products`);
        if (Array.isArray(res.data)) setCategories(res.data);
        else if (res.data.success && Array.isArray(res.data.data)) setCategories(res.data.data);
        else if (Array.isArray(res.data?.categories)) setCategories(res.data.categories);
      } catch (e) {
        console.error("Failed to fetch categories", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const totalPieces = categories.reduce(
    (sum, cat) => sum + Number(cat.products_count ?? cat.productsCount ?? 0),
    0
  );

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden pb-16 sm:pb-20">
      {/* Breadcrumb */}
      <div className="border-b border-border-line bg-surface">
        <div className="max-w-site mx-auto site-pad py-3.5 flex flex-wrap items-center gap-2 label-caps text-body-slate min-w-0">
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Home</span>
          </Link>
          <span className="text-on-surface/25" aria-hidden="true">/</span>
          <span className="text-primary">Categories</span>
        </div>
      </div>

      {/* Header */}
      <section className="border-b border-border-line bg-pure-white">
        <div className="max-w-site mx-auto site-pad py-10 sm:py-12 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10">
            <div className="max-w-2xl min-w-0">
              <span className="label-caps text-primary block mb-3">Wear Yourself · Catalog</span>
              <h1 className="display-section text-on-surface uppercase break-words">Shop By Category</h1>
              <p className="text-[15px] sm:text-[17px] text-body-slate mt-4 leading-relaxed max-w-xl">
                Browse sarees by weave, fabric, and occasion. Each category is curated from our live
                handloom collection.
              </p>
              {!loading && categories.length > 0 && (
                <p className="text-[13px] text-body-slate mt-3">
                  <span className="font-semibold text-on-surface">{categories.length}</span>{" "}
                  {categories.length === 1 ? "category" : "categories"}
                  {totalPieces > 0 && (
                    <>
                      {" "}
                      ·{" "}
                      <span className="font-semibold text-on-surface">{totalPieces}</span> pieces
                    </>
                  )}
                </p>
              )}
              <div className="mt-6 h-px w-16 bg-primary" aria-hidden="true" />
            </div>

            <Link
              href="/products"
              className="label-caps text-primary hover:text-on-surface transition-colors inline-flex items-center gap-2 shrink-0 self-start lg:self-end"
            >
              <span>View All Collections</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-site mx-auto site-pad py-10 sm:py-12 lg:py-14 min-w-0">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-border-line bg-surface-ivory animate-pulse">
                <div className="aspect-[3/4] bg-surface-subtle" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-16 bg-surface-subtle" />
                  <div className="h-5 w-3/4 bg-surface-subtle" />
                  <div className="h-10 w-full bg-surface-subtle" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 sm:py-20 border border-border-line bg-surface-subtle max-w-lg mx-auto px-6 sm:px-8">
            <span className="label-caps text-primary block mb-3">Catalog Empty</span>
            <h2 className="text-xl sm:text-2xl font-bold uppercase text-on-surface mb-3">
              No Categories Yet
            </h2>
            <p className="text-[15px] text-body-slate mb-8 leading-relaxed">
              Categories will appear here once added from the dashboard.
            </p>
            <Link href="/" className="sv-btn-primary inline-flex">
              Return Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {categories.map((cat, index) => {
              const imgSrc = getImageUrl(cat.image) || getImageUrl(cat.secondary_image) || FALLBACK;
              const href = `/categories/${getCategorySlug(cat)}`;
              const count = Number(cat.products_count ?? cat.productsCount ?? 0);
              const desc = categoryDescriptionOrFallback(cat.description);
              const roleNo = String(index + 1).padStart(2, "0");
              const shortDesc = sanitizeCategoryDescription(cat.description, 120) || desc;

              return (
                <Link
                  key={cat.id}
                  href={href}
                  className="group bg-surface border border-border-line hover:border-on-surface transition-colors flex flex-col h-full"
                >
                  <div className="media-frame facet-media relative overflow-hidden bg-surface-ivory">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgSrc}
                      alt={cat.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={800}
                    />
                    <div className="absolute top-3 left-3 bg-surface-dark text-surface px-2 py-1 text-[10px] font-semibold tracking-widest uppercase">
                      {roleNo}
                    </div>
                    {count > 0 && (
                      <div className="absolute bottom-3 right-3 bg-surface/95 border border-border-line px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-on-surface">
                        {count} {count === 1 ? "Piece" : "Pieces"}
                      </div>
                    )}
                  </div>

                  <div className="p-5 sm:p-6 flex flex-col flex-1 min-w-0">
                    <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-primary block mb-2">
                      Category
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold uppercase tracking-[-0.015em] text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                      {cat.name}
                    </h2>
                    <p className="text-[14px] leading-[1.6] text-body-slate mt-3 line-clamp-3 flex-1">
                      {shortDesc}
                    </p>

                    <div className="mt-auto pt-5 border-t border-border-line/60 flex items-center justify-between text-[11px] font-semibold tracking-[0.1em] uppercase text-on-surface group-hover:text-primary transition-colors">
                      <span>Shop Now</span>
                      <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
