"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchBrands } from "../../../../utils/brand";
import { getBrandSlug } from "../../../../utils/slugUtils";
import { Brand } from "@/common/interface";
import { getImageUrl } from "../../../../utils/imageUtils";

function stripHtml(html: string | undefined | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
}

export default function BrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSort, setActiveSort] = useState<"all" | "az" | "za">("all");

  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true);
        const data = await fetchBrands();
        const list: Brand[] = Array.isArray(data)
          ? data
          : data?.data?.brands || data?.brands || [];
        setBrands(list.filter((brand: Brand) => brand.status));
      } catch (err) {
        console.error("Error fetching brands:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBrands();
  }, []);

  const processedBrands = useMemo(() => {
    let result = brands.filter((brand) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        brand.name?.toLowerCase().includes(q) ||
        brand.description?.toLowerCase().includes(q)
      );
    });
    if (activeSort === "az") {
      result = [...result].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (activeSort === "za") {
      result = [...result].sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    }
    return result;
  }, [brands, searchQuery, activeSort]);

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="border-b border-border-line bg-pure-white">
        <div className="max-w-site mx-auto site-pad py-10 sm:py-14">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="label-caps text-body-slate hover:text-primary border border-border-line px-4 py-2 bg-surface"
            >
              ← Back
            </button>
            <Link href="/products" className="label-caps text-primary">
              The Edit →
            </Link>
          </div>
          <span className="label-caps text-primary block mb-2">Atelier Partners</span>
          <h1 className="display-section text-on-surface uppercase">Official Brands</h1>
          <p className="text-[15px] text-body-slate mt-3 max-w-2xl">
            Authentic weaves and maker houses from the live catalog.
          </p>

          <div className="mt-8 flex flex-col md:flex-row gap-4 pt-6 border-t border-border-line">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands…"
              className="w-full md:max-w-md px-4 py-3 bg-surface border border-border-line text-sm text-on-surface focus:outline-none focus:border-primary"
            />
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "az", "za"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveSort(key)}
                  className={`px-3.5 py-2 text-[11px] font-semibold tracking-[0.08em] uppercase border transition-colors ${
                    activeSort === key
                      ? "bg-surface-dark text-surface border-surface-dark"
                      : "bg-pure-white text-body-slate border-border-line hover:border-on-surface"
                  }`}
                >
                  {key === "all" ? "Default" : key === "az" ? "A → Z" : "Z → A"}
                </button>
              ))}
              {!loading && (
                <span className="label-caps text-primary ml-auto md:ml-2">
                  {processedBrands.length} Brands
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-site mx-auto site-pad pt-8 sm:pt-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-border-line bg-surface-ivory aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : processedBrands.length === 0 ? (
          <div className="border border-border-line bg-surface-subtle text-center py-16 px-6 max-w-lg mx-auto">
            <h2 className="text-xl font-bold uppercase text-on-surface mb-2">No Brands Found</h2>
            <p className="text-sm text-body-slate mb-6">
              {searchQuery
                ? `No brands matched “${searchQuery}”.`
                : "There are currently no active brands listed."}
            </p>
            <button
              type="button"
              onClick={() => (searchQuery ? setSearchQuery("") : router.push("/"))}
              className="sv-btn-primary"
            >
              {searchQuery ? "Clear Search" : "Return Home"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {processedBrands.map((brand) => {
              const bannerUrl = getImageUrl(brand.image1);
              const logoUrl = getImageUrl(brand.image2 || brand.image3);
              const plainDescription = stripHtml(brand.description);
              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => router.push(`/brands/${getBrandSlug(brand)}`)}
                  className="group text-left border border-border-line bg-pure-white hover:border-on-surface transition-colors flex flex-col"
                >
                  <div className="relative h-44 w-full bg-surface-ivory overflow-hidden border-b border-border-line">
                    {bannerUrl ? (
                      <img
                        src={bannerUrl}
                        alt={brand.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center label-caps text-body-slate">
                        {brand.name?.charAt(0) || "B"}
                      </div>
                    )}
                    {(logoUrl || brand.name) && (
                      <div className="absolute bottom-3 left-3 w-12 h-12 bg-surface border border-border-line overflow-hidden flex items-center justify-center">
                        {logoUrl ? (
                          <img src={logoUrl} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <span className="font-bold text-primary">{brand.name?.charAt(0)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-base font-bold uppercase tracking-tight text-on-surface group-hover:text-primary line-clamp-1">
                      {brand.name}
                    </h3>
                    <p className="text-[13px] text-body-slate mt-2 line-clamp-2 flex-1">
                      {plainDescription || "Official maker house"}
                    </p>
                    <span className="label-caps text-primary mt-4">View Brand →</span>
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
