"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Rows3,
  SlidersHorizontal,
  X,
} from "lucide-react";
import axios from "../../../../../../utils/axios";
import ProductCard from "@/components/(frontend)/ProductCard";

type SubCategory = {
  id: number;
  name: string;
  description?: string;
  secondary_image: string | null;
  link: string | null;
  image: string | null;
  slug?: string;
  products_count?: number;
};

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
  "Georgette",
  "Festive",
  "Bridal",
  "Party",
  "Red",
  "Blue",
  "Pink",
  "Black",
];

function stripHtml(html?: string | null) {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
}

export default function SubCategoriesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const parentIdOrSlug = (params?.slug || params?.id || "") as string;
  const preselectedSub = searchParams?.get("sub");

  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [parentName, setParentName] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [parentDescription, setParentDescription] = useState("");
  const [metaLoading, setMetaLoading] = useState(true);

  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [quickTag, setQuickTag] = useState<string | null>(null);
  const [cols, setCols] = useState<3 | 4>(4);
  const [openFilter, setOpenFilter] = useState<string | null>("categories");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  const activeSub = useMemo(
    () => subcategories.find((s) => s.id === selectedSubcategory) || null,
    [subcategories, selectedSubcategory]
  );

  const displayTitle = activeSub?.name || parentName || "Collection";
  const displayDescription =
    stripHtml(activeSub?.description) || stripHtml(parentDescription) ||
    "Curated handloom pieces from this edit. Refine by category, price, or fabric mood.";

  useEffect(() => {
    if (!parentIdOrSlug) return;
    let cancelled = false;

    (async () => {
      setMetaLoading(true);
      try {
        const res = await axios.get(`/api/subcategories-by-parent`, {
          params: { parent_id: parentIdOrSlug },
        });
        if (cancelled) return;

        const data = res.data || {};
        const subs: SubCategory[] = data.subcategories || [];
        const details = data.parent_category_details;
        const resolvedParentId =
          Number(details?.id) ||
          Number(details?.category_id) ||
          (Number(parentIdOrSlug) > 0 ? Number(parentIdOrSlug) : null);

        setParentName(data.parent_category || details?.name || "Collections");
        setParentId(resolvedParentId);
        setParentDescription(details?.description || "");
        setSubcategories(subs);

        let nextParentId = resolvedParentId;
        if (!nextParentId) {
          try {
            const catsRes = await axios.get("/api/categories-with-products");
            const list = Array.isArray(catsRes.data)
              ? catsRes.data
              : catsRes.data?.data || catsRes.data?.categories || [];
            const slug = String(parentIdOrSlug).toLowerCase();
            const match = list.find((c: any) => {
              const nameSlug = String(c.name || "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
              return nameSlug === slug || String(c.id) === String(parentIdOrSlug);
            });
            if (match?.id) {
              nextParentId = Number(match.id);
              setParentId(nextParentId);
              if (!data.parent_category) setParentName(match.name);
            }
          } catch {
            /* ignore */
          }
        }

        // Default to All (parent) unless a specific sub is requested in the URL
        if (preselectedSub && subs.length > 0) {
          const matched = subs.find(
            (s) =>
              String(s.id) === String(preselectedSub) ||
              s.slug === preselectedSub ||
              s.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "") === preselectedSub.toLowerCase()
          );
          setSelectedSubcategory(matched ? matched.id : null);
        } else {
          setSelectedSubcategory(null);
        }
      } catch (e) {
        console.error("Failed to fetch subcategories", e);
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [parentIdOrSlug, preselectedSub]);

  const fetchProducts = useCallback(
    async (pageToFetch = 1, isAppend = false) => {
      const categoryId = selectedSubcategory || parentId;
      if (!categoryId) {
        setProducts([]);
        setLoading(false);
        return;
      }

      if (isAppend) setLoadingMore(true);
      else setLoading(true);

      try {
        const params: Record<string, string | number> = {
          category_id: categoryId,
          page: pageToFetch,
          per_page: 20,
          sort_by: sortBy,
        };
        if (priceRange !== "all") params.price_range = priceRange;
        if (quickTag) params.search = quickTag;

        const response = await axios.get("/api/products-paginated", { params });
        const rawData = response.data?.data;
        const productList = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.products)
            ? rawData.products
            : [];

        const pagination = response.data?.pagination || rawData?.pagination;
        const total = Number(pagination?.total ?? response.data?.total ?? productList.length) || 0;
        const lastPage = Number(pagination?.last_page ?? 1);

        setTotalProducts(total);
        setHasMore(pageToFetch < lastPage && productList.length > 0);
        setCurrentPage(pageToFetch);
        setProducts((prev) => (isAppend ? [...prev, ...productList] : productList));
      } catch (err) {
        console.error("Error fetching products", err);
        if (!isAppend) {
          setProducts([]);
          setTotalProducts(0);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedSubcategory, parentId, priceRange, sortBy, quickTag]
  );

  useEffect(() => {
    if (metaLoading) return;
    if (!selectedSubcategory && !parentId) {
      setLoading(false);
      return;
    }
    fetchProducts(1, false);
  }, [metaLoading, selectedSubcategory, parentId, priceRange, sortBy, quickTag, fetchProducts]);

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
    setSelectedSubcategory(null); // All
  };

  const hasActiveFilters =
    priceRange !== "all" || sortBy !== "newest" || !!quickTag;

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

      {/* Categories / Subcategories */}
      <div className="border-b border-border-line">
        <button
          type="button"
          onClick={() => setOpenFilter((p) => (p === "categories" ? null : "categories"))}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-on-surface">
            Categories
          </span>
          {openFilter === "categories" ? (
            <ChevronUp className="w-4 h-4 text-body-slate" />
          ) : (
            <ChevronDown className="w-4 h-4 text-body-slate" />
          )}
        </button>
        {openFilter === "categories" && (
          <div className="px-5 pb-5 space-y-0.5 max-h-72 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setSelectedSubcategory(null);
                setQuickTag(null);
              }}
              className={filterItemClass(selectedSubcategory === null)}
            >
              All
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => {
                  setSelectedSubcategory(sub.id);
                  setQuickTag(null);
                }}
                className={filterItemClass(selectedSubcategory === sub.id)}
              >
                {sub.name}
              </button>
            ))}
          </div>
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
            Price
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

      {/* Fabric / mood via search tags */}
      <div className="border-b border-border-line">
        <button
          type="button"
          onClick={() => setOpenFilter((p) => (p === "fabric" ? null : "fabric"))}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-on-surface">
            Fabric & Mood
          </span>
          {openFilter === "fabric" ? (
            <ChevronUp className="w-4 h-4 text-body-slate" />
          ) : (
            <ChevronDown className="w-4 h-4 text-body-slate" />
          )}
        </button>
        {openFilter === "fabric" && (
          <div className="px-5 pb-5 space-y-0.5">
            <button
              type="button"
              onClick={() => setQuickTag(null)}
              className={filterItemClass(quickTag === null)}
            >
              All
            </button>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuickTag(tag)}
                className={filterItemClass(quickTag === tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );

  if (metaLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-border-line border-t-primary animate-spin mx-auto mb-4" />
          <p className="label-caps text-primary">Loading Collection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Breadcrumb */}
      <div className="border-b border-border-line bg-pure-white">
        <div className="max-w-site mx-auto site-pad py-3.5 flex flex-wrap items-center gap-2 label-caps text-body-slate">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span className="text-on-surface/25">/</span>
          <Link href="/categories" className="hover:text-primary transition-colors">
            Categories
          </Link>
          <span className="text-on-surface/25">/</span>
          <span className="text-primary">{parentName}</span>
          {activeSub && (
            <>
              <span className="text-on-surface/25">/</span>
              <span className="text-primary">{activeSub.name}</span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-site mx-auto site-pad pt-8 sm:pt-10 pb-10">
        {/* Intro */}
        <header className="mb-8 max-w-3xl">
          <span className="label-caps text-primary block mb-2">Browse</span>
          <h1 className="display-section text-on-surface uppercase mb-4">{parentName}</h1>
          <p
            className={`text-[14px] sm:text-[15px] text-body-slate leading-relaxed ${
              descExpanded ? "" : "line-clamp-3"
            }`}
          >
            {displayDescription}
          </p>
          {displayDescription.length > 160 && (
            <button
              type="button"
              onClick={() => setDescExpanded((v) => !v)}
              className="label-caps text-primary mt-2 hover:text-on-surface"
            >
              {descExpanded ? "Read Less" : "Read More"}
            </button>
          )}
        </header>

        {/* Quick pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedSubcategory(null);
              setQuickTag(null);
            }}
            className={`px-3.5 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase border transition-colors ${
              !selectedSubcategory && !quickTag
                ? "border-on-surface bg-surface-dark text-surface"
                : "border-border-line bg-pure-white text-body-slate hover:border-on-surface"
            }`}
          >
            All
          </button>
          {subcategories.slice(0, 8).map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => {
                setSelectedSubcategory(sub.id);
                setQuickTag(null);
              }}
              className={`px-3.5 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase border transition-colors ${
                selectedSubcategory === sub.id
                  ? "border-on-surface bg-surface-dark text-surface"
                  : "border-border-line bg-pure-white text-body-slate hover:border-on-surface"
              }`}
            >
              {sub.name}
            </button>
          ))}
          {QUICK_TAGS.slice(0, 6).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setQuickTag((t) => (t === tag ? null : tag))}
              className={`px-3.5 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase border transition-colors ${
                quickTag === tag
                  ? "border-primary text-primary bg-surface-ivory"
                  : "border-border-line bg-pure-white text-body-slate hover:border-on-surface"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="sv-btn-outline w-full"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters & Sort
          </button>
        </div>

        <div className="flex gap-6 xl:gap-10 items-start">
          <div className="hidden lg:block w-[240px] xl:w-[264px] flex-shrink-0 sticky top-24">
            <FilterSidebar />
          </div>

          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-border-line pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-on-surface">
                  {displayTitle}
                </h2>
                <p className="text-[12px] text-body-slate mt-1">
                  {loading && products.length === 0
                    ? "Loading…"
                    : `${totalProducts || products.length} products`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex border border-border-line">
                  <button
                    type="button"
                    onClick={() => setCols(4)}
                    className={`px-3 py-2 ${
                      cols === 4
                        ? "bg-surface-dark text-surface"
                        : "bg-pure-white text-body-slate"
                    }`}
                    aria-label="4 column grid"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCols(3)}
                    className={`px-3 py-2 border-l border-border-line ${
                      cols === 3
                        ? "bg-surface-dark text-surface"
                        : "bg-pure-white text-body-slate"
                    }`}
                    aria-label="3 column grid"
                  >
                    <Rows3 className="w-4 h-4" />
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2.5 bg-pure-white border border-border-line text-[11px] font-semibold tracking-[0.06em] uppercase text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading && products.length === 0 ? (
              <div
                className={`grid gap-3 sm:gap-4 ${
                  cols === 4
                    ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] bg-surface-ivory border border-border-line animate-pulse"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 px-6 border border-border-line bg-surface-subtle text-center">
                <h3 className="text-xl font-bold uppercase mb-2">No Products Found</h3>
                <p className="text-body-slate text-sm mb-6">
                  No pieces match these filters in this collection.
                </p>
                {hasActiveFilters && (
                  <button type="button" onClick={clearFilters} className="sv-btn-primary">
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-3 sm:gap-4 ${
                    cols === 4
                      ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  }`}
                >
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} compact />
                  ))}
                </div>

                <div
                  ref={observerTargetRef}
                  className="w-full py-10 flex flex-col items-center justify-center"
                >
                  {loadingMore && (
                    <div className="flex items-center gap-3 label-caps text-primary">
                      <div className="w-5 h-5 border-2 border-border-line border-t-primary animate-spin" />
                      Loading more…
                    </div>
                  )}
                  {!hasMore && products.length > 0 && (
                    <p className="text-[12px] text-body-slate">End of this edit</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-on-surface/40"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm bg-surface overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border-line">
              <span className="label-caps text-on-surface">Filters</span>
              <button type="button" onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar className="border-0" />
            <div className="p-4 border-t border-border-line">
              <button
                type="button"
                className="sv-btn-primary w-full"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
