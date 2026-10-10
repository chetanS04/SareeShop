"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Rows3,
  SlidersHorizontal,
  X,
  Home,
} from "lucide-react";
import axios from "../../../../../utils/axios";
import ProductCard from "@/components/(frontend)/ProductCard";
import { categoryDescriptionOrFallback } from "../../../../../utils/textUtils";
import { getCategoryById } from "../../../../../utils/category";

const PRICE_OPTIONS = [
  { id: "all", label: "All Prices" },
  { id: "under1000", label: "Under ₹1,000" },
  { id: "1000to2000", label: "₹1,000 – ₹2,000" },
  { id: "above2000", label: "Above ₹2,000" },
];

const SORT_OPTIONS = [
  { id: "newest", label: "Relevance" },
  { id: "price_low", label: "Price: Low to High" },
  { id: "price_high", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" },
];

const QUICK_TAGS = [
  "Silk",
  "Cotton",
  "Handloom",
  "Festive",
  "Bridal",
  "Party",
  "Traditional",
];

export default function CategoryProductsPage() {
  const params = useParams();
  const slugOrId = (params?.slug || params?.id || "") as string;

  const [category, setCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryDescription, setCategoryDescription] = useState("");
  const [metaLoading, setMetaLoading] = useState(true);

  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [quickTag, setQuickTag] = useState<string | null>(null);
  const [cols, setCols] = useState<3 | 4>(4);
  const [openFilter, setOpenFilter] = useState<string | null>("price");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  const displayTitle = categoryName || "Collection";
  const displayDescription = categoryDescriptionOrFallback(
    categoryDescription,
    "Curated handloom pieces from this collection."
  );

  // Fetch category details
  useEffect(() => {
    if (!slugOrId) return;
    let cancelled = false;

    (async () => {
      setMetaLoading(true);
      try {
        const res = await getCategoryById(slugOrId);
        if (cancelled) return;

        const catData = res?.result || res?.category || res?.data || res;
        if (catData) {
          setCategory(catData);
          setCategoryName(catData.name || "Collection");
          setCategoryId(Number(catData.id));
          setCategoryDescription(catData.description || "");
        }
      } catch (e) {
        console.error("Failed to fetch category details", e);
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slugOrId]);

  // Fetch products
  const fetchProducts = useCallback(
    async (pageToFetch = 1, isAppend = false) => {
      if (!categoryId) return;
      if (isAppend) setLoadingMore(true);
      else setLoading(true);

      try {
        const params: any = {
          category_id: categoryId,
          page: pageToFetch,
          per_page: 20,
        };

        if (priceRange && priceRange !== "all") {
          params.price_range = priceRange;
        }

        if (sortBy) {
          params.sort_by = sortBy;
        }

        if (quickTag) {
          params.search = quickTag;
        }

        const res = await axios.get("/api/products-paginated", { params });
        const resData = res.data;

        if (resData.success || resData.res === "success") {
          const rawData = resData.data;
          const list = Array.isArray(rawData)
            ? rawData
            : Array.isArray(rawData?.products)
            ? rawData.products
            : [];

          const pagination = resData.pagination || resData.data?.pagination;
          const total = pagination?.total ?? list.length;
          const lastPage = pagination?.last_page ?? 1;

          setTotalProducts(total);
          setHasMore(pageToFetch < lastPage && list.length > 0);

          if (isAppend) {
            setProducts((prev) => [...prev, ...list]);
          } else {
            setProducts(list);
          }
          setCurrentPage(pageToFetch);
        } else {
          if (!isAppend) setProducts([]);
          setHasMore(false);
        }
      } catch (err) {
        console.error("Failed to load category products", err);
        if (!isAppend) setProducts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [categoryId, priceRange, sortBy, quickTag]
  );

  // Trigger product fetch
  useEffect(() => {
    if (!metaLoading && categoryId) {
      setCurrentPage(1);
      fetchProducts(1, false);
    }
  }, [metaLoading, categoryId, priceRange, sortBy, quickTag, fetchProducts]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchProducts(currentPage + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, currentPage, fetchProducts]);

  const clearFilters = () => {
    setPriceRange("all");
    setSortBy("newest");
    setQuickTag(null);
  };

  const hasActiveFilters = priceRange !== "all" || sortBy !== "newest" || !!quickTag;

  const filterItemClass = (active: boolean) =>
    `block w-full text-left text-[13px] leading-snug py-2 pl-3 border-l-2 transition-colors ${
      active
        ? "border-primary text-primary font-semibold bg-surface-subtle"
        : "border-transparent text-body-slate hover:text-on-surface hover:border-[rgba(14,14,13,0.2)]"
    }`;

  const FilterSidebar = ({ className = "" }: { className?: string }) => (
    <aside className={`bg-pure-white border border-border-line ${className}`}>
      <div className="px-5 py-4 border-b border-border-line bg-surface-subtle flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-primary" aria-hidden />
          <span className="label-caps text-on-surface">Filter</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="label-caps text-primary hover:text-on-surface"
          >
            Clear
          </button>
        )}
      </div>

      {/* Price */}
      <div className="border-b border-border-line">
        <button
          type="button"
          onClick={() => setOpenFilter((p) => (p === "price" ? null : "price"))}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-on-surface">
            Price Band
          </span>
          {openFilter === "price" ? (
            <ChevronUp className="w-4 h-4 text-body-slate" />
          ) : (
            <ChevronDown className="w-4 h-4 text-body-slate" />
          )}
        </button>
        {openFilter === "price" && (
          <div className="px-5 pb-5 space-y-0.5">
            {PRICE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPriceRange(opt.id)}
                className={filterItemClass(priceRange === opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Tags / Mood */}
      <div className="border-b border-border-line">
        <button
          type="button"
          onClick={() => setOpenFilter((p) => (p === "tags" ? null : "tags"))}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-on-surface">
            Weave & Style
          </span>
          {openFilter === "tags" ? (
            <ChevronUp className="w-4 h-4 text-body-slate" />
          ) : (
            <ChevronDown className="w-4 h-4 text-body-slate" />
          )}
        </button>
        {openFilter === "tags" && (
          <div className="px-5 pb-5 space-y-0.5">
            <button
              type="button"
              onClick={() => setQuickTag(null)}
              className={filterItemClass(quickTag === null)}
            >
              All Styles
            </button>
            {QUICK_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setQuickTag(quickTag === t ? null : t)}
                className={filterItemClass(quickTag === t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="border-b border-border-line bg-surface">
        <div className="max-w-site mx-auto site-pad py-3.5 flex flex-wrap items-center gap-2 label-caps text-body-slate min-w-0">
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Home</span>
          </Link>
          <span className="text-on-surface/25" aria-hidden="true">
            /
          </span>
          <Link href="/categories" className="hover:text-primary transition-colors">
            Categories
          </Link>
          <span className="text-on-surface/25" aria-hidden="true">
            /
          </span>
          <span className="text-primary truncate max-w-[14rem] sm:max-w-none">
            {displayTitle}
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <section className="border-b border-border-line bg-pure-white">
        <div className="max-w-site mx-auto site-pad py-10 sm:py-12 lg:py-14">
          <span className="label-caps text-primary block mb-3">Category · Live Edit</span>
          <h1 className="display-section text-on-surface uppercase break-words">{displayTitle}</h1>

          {displayDescription && (
            <div className="mt-4 max-w-2xl">
              <div
                className={`text-[15px] sm:text-[17px] text-body-slate leading-relaxed prose prose-neutral max-w-none ${
                  !descExpanded ? "line-clamp-2" : ""
                }`}
                dangerouslySetInnerHTML={{ __html: displayDescription }}
              />
              {displayDescription.length > 140 && (
                <button
                  type="button"
                  onClick={() => setDescExpanded((v) => !v)}
                  className="mt-2 label-caps text-primary hover:text-on-surface transition-colors cursor-pointer"
                >
                  {descExpanded ? "Read Less" : "Read More"}
                </button>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-body-slate">
            <span>
              <strong className="font-semibold text-on-surface">{totalProducts}</strong>{" "}
              {totalProducts === 1 ? "Piece" : "Pieces"} available
            </span>
            <span className="text-border-line">·</span>
            <span className="text-body-slate/80">Direct Handloom Catalog</span>
          </div>

          <div className="mt-6 h-px w-16 bg-primary" aria-hidden />
        </div>
      </section>

      {/* Content Layout with Filter Sidebar */}
      <div className="max-w-site mx-auto site-pad py-10 sm:py-12 lg:py-14">
        {/* Mobile Filter Toggle & Controls */}
        <div className="lg:hidden flex items-center justify-between gap-3 pb-6 border-b border-border-line mb-8">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border-line bg-pure-white label-caps text-on-surface cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
            <span>Refine & Filter</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-border-line bg-pure-white text-xs label-caps text-on-surface uppercase focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8 xl:gap-12 items-start">
          {/* Desktop Filter Sidebar */}
          <FilterSidebar className="hidden lg:block sticky top-24" />

          {/* Main Products Grid Area */}
          <div className="min-w-0">
            {/* Desktop Top Toolbar */}
            <div className="hidden lg:flex items-center justify-between pb-6 border-b border-border-line mb-8">
              <span className="text-xs text-body-slate">
                Showing <strong className="text-on-surface">{products.length}</strong> of{" "}
                <strong className="text-on-surface">{totalProducts}</strong> items
              </span>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="label-caps text-body-slate">Sort</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 border border-border-line bg-pure-white text-xs label-caps text-on-surface uppercase focus:outline-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center border border-border-line">
                  <button
                    type="button"
                    onClick={() => setCols(3)}
                    className={`p-1.5 transition-colors ${
                      cols === 3 ? "bg-surface-subtle text-primary" : "text-body-slate hover:text-on-surface"
                    }`}
                    title="3 Columns"
                  >
                    <Rows3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCols(4)}
                    className={`p-1.5 transition-colors ${
                      cols === 4 ? "bg-surface-subtle text-primary" : "text-body-slate hover:text-on-surface"
                    }`}
                    title="4 Columns"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Bar */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-body-slate">Refinements:</span>
                {priceRange !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-surface-subtle border border-border-line text-on-surface">
                    {PRICE_OPTIONS.find((p) => p.id === priceRange)?.label}
                    <button type="button" onClick={() => setPriceRange("all")}>
                      <X className="w-3 h-3 text-body-slate hover:text-primary" />
                    </button>
                  </span>
                )}
                {quickTag && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-surface-subtle border border-border-line text-on-surface">
                    {quickTag}
                    <button type="button" onClick={() => setQuickTag(null)}>
                      <X className="w-3 h-3 text-body-slate hover:text-primary" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-primary hover:underline ml-2"
                >
                  Reset all
                </button>
              </div>
            )}

            {/* Products Grid / State */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse border border-border-line bg-surface-ivory">
                    <div className="aspect-[3/4] bg-surface-subtle" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 w-1/2 bg-surface-subtle" />
                      <div className="h-4 w-3/4 bg-surface-subtle" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 border border-border-line bg-pure-white text-center px-6">
                <span className="label-caps text-primary block mb-3">No Pieces Found</span>
                <h3 className="text-xl font-bold uppercase text-on-surface mb-3">
                  Nothing matches your refinements
                </h3>
                <p className="text-sm text-body-slate max-w-md mx-auto mb-6">
                  Try clearing the price band or weave tag, or explore all our collections.
                </p>
                <button type="button" onClick={clearFilters} className="sv-btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-2 gap-3 sm:gap-6 ${
                  cols === 3 ? "md:grid-cols-3" : "md:grid-cols-3 xl:grid-cols-4"
                }`}
              >
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} compact />
                ))}
              </div>
            )}

            <div ref={observerTargetRef} className="h-8" />

            {loadingMore && (
              <div className="flex items-center justify-center gap-2 py-8">
                <div className="w-5 h-5 border-2 border-border-line border-t-primary animate-spin" />
                <span className="label-caps text-body-slate">Loading more…</span>
              </div>
            )}

            {!hasMore && products.length > 0 && !loadingMore && (
              <div className="mt-12 pt-6 border-t border-border-line text-center">
                <p className="label-caps text-body-slate">End of {displayTitle} Collection</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/50 lg:hidden">
          <div className="w-4/5 max-w-sm bg-pure-white h-full ml-auto flex flex-col">
            <div className="p-4 border-b border-border-line flex items-center justify-between">
              <span className="label-caps text-on-surface">Refine Edit</span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilterSidebar />
            </div>
            <div className="p-4 border-t border-border-line">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full sv-btn-primary text-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
