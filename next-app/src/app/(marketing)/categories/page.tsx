"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "../../../../utils/axios";
import { getCategorySlug } from "../../../../utils/slugUtils";
import { getImageUrl } from "../../../../utils/imageUtils";

type Category = {
  id: number;
  name: string;
  description?: string;
  secondary_image: string | null;
  link: string | null;
  image: string | null;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-surface pb-20">
      <section className="border-b border-border-line bg-pure-white">
        <div className="max-w-site mx-auto site-pad py-10 sm:py-14">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="label-caps text-body-slate hover:text-primary border border-border-line px-4 py-2 bg-surface"
            >
              ← Back
            </button>
            <Link href="/products" className="label-caps text-primary hover:text-on-surface">
              The Edit →
            </Link>
          </div>
          <span className="label-caps text-primary block mb-2">Catalog</span>
          <h1 className="display-section text-on-surface uppercase">Shop By Category</h1>
          {!loading && (
            <p className="text-[15px] text-body-slate mt-3">
              {categories.length} live categories from the archive
            </p>
          )}
        </div>
      </section>

      <main className="max-w-site mx-auto site-pad pt-8 sm:pt-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-surface-ivory border border-border-line animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 border border-border-line bg-surface-subtle max-w-md mx-auto p-8">
            <h2 className="text-lg font-bold uppercase text-on-surface mb-2">No Categories Found</h2>
            <p className="text-sm text-body-slate mb-6">
              Categories will appear here once added in the dashboard.
            </p>
            <Link href="/" className="sv-btn-primary inline-flex">
              Return Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {categories.map((cat) => {
              const imgSrc = getImageUrl(cat.image) || getImageUrl(cat.secondary_image);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => router.push(`/categories/subcategories/${getCategorySlug(cat)}`)}
                  className="group text-left border border-border-line bg-pure-white hover:border-on-surface transition-colors"
                >
                  <div className="aspect-[3/4] bg-surface-ivory overflow-hidden border-b border-border-line">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-body-slate label-caps">
                        {cat.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="text-[13px] sm:text-sm font-bold uppercase tracking-tight text-on-surface group-hover:text-primary line-clamp-2">
                      {cat.name}
                    </h2>
                    {cat.description && (
                      <p className="text-[12px] text-body-slate mt-2 line-clamp-2">{cat.description}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
