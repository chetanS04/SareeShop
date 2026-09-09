"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, X, Home, SlidersHorizontal, ArrowUpRight } from "lucide-react";
import axios from "../../../../utils/axios";
import ProductCard from "@/components/(frontend)/ProductCard";
import { useProductSync, ProductEventData } from "@/context/ProductSyncContext";

type Product = {
    id: number;
    name: string;
    description: string;
    image_url: string;
    min_price: number;
    max_price: number;
    average_rating: number;
    reviews_count: number;
    brand: { id: number; name: string } | null;
    category: { id: number; name: string } | null;
    variants: any[];
    best_variant: {
        id: number;
        sp: number;
        mrp: number | null;
        stock: number;
        image_url: string | null;
    } | null;
};

type Category = {
    id: number;
    name: string;
    parent_id: number | null;
    image?: string;
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

const ProductsPage = () => {
    const searchParams = useSearchParams();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        searchParams.get("category_id") ? parseInt(searchParams.get("category_id")!) : null
    );
    const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(
        searchParams.get("subcategory_id") ? parseInt(searchParams.get("subcategory_id")!) : null
    );

    const [sortBy, setSortBy] = useState<string>("newest");
    const [priceRange, setPriceRange] = useState<string>("all");

    const [openFilter, setOpenFilter] = useState<string | null>("categories");
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const observerTargetRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 500);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const { subscribeToAll } = useProductSync();

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    useEffect(() => {
        const unsubscribe = subscribeToAll((event: ProductEventData) => {
            const updatedProd = event.product;
            const pid = event.productId || (updatedProd?.id ? Number(updatedProd.id) : undefined);
            if (!pid) return;

            if (event.action === "deleted" || (event.action === "status_changed" && event.status === false)) {
                setProducts((prev) => prev.filter((p) => Number(p.id) !== pid));
                setTotalProducts((prev) => Math.max(0, prev - 1));
            } else if (event.action === "updated" && updatedProd) {
                setProducts((prev) =>
                    prev.map((p) => {
                        if (Number(p.id) !== pid) return p;
                        return {
                            ...p,
                            ...updatedProd,
                            name: updatedProd.name ?? p.name,
                            image_url: updatedProd.image_url ?? p.image_url,
                            variants: updatedProd.variants ?? p.variants,
                        };
                    })
                );
            } else if (event.action === "created") {
                if (currentPage === 1) fetchProducts(1, false);
            }
        });
        return () => unsubscribe();
    }, [subscribeToAll, currentPage]);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        fetchProducts(1, false);
    }, [selectedCategory, selectedSubcategory, priceRange, sortBy]);

    const loadCategories = async () => {
        try {
            const response = await axios.get("/api/categories-with-products");
            let data: any[] = [];
            if (Array.isArray(response.data)) data = response.data;
            else if (response.data?.success && Array.isArray(response.data?.data)) data = response.data.data;
            setCategories(data);

            const allSubs: Category[] = [];
            data.forEach((cat) => {
                if (Array.isArray(cat.children)) {
                    cat.children.forEach((sub: any) => {
                        allSubs.push({
                            id: sub.id,
                            name: sub.name,
                            parent_id: cat.id,
                            image: sub.image,
                        });
                    });
                }
            });
            setSubcategories(allSubs);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const fetchProducts = async (pageToFetch = 1, isAppend = false) => {
        if (isAppend) setLoadingMore(true);
        else setLoading(true);

        try {
            const params: any = { page: pageToFetch, per_page: 20 };
            if (searchQuery) params.search = searchQuery;
            if (selectedSubcategory) params.category_id = selectedSubcategory;
            else if (selectedCategory) params.category_id = selectedCategory;
            if (priceRange && priceRange !== "all") params.price_range = priceRange;
            if (sortBy) params.sort_by = sortBy;

            const response = await axios.get("/api/products-paginated", { params });

            if (response.data.success || response.data.res === "success") {
                const rawData = response.data.data;
                const productList = Array.isArray(rawData)
                    ? rawData
                    : Array.isArray(rawData?.products)
                      ? rawData.products
                      : [];

                const pagination = response.data.pagination;
                const totalPagesCount = pagination?.last_page ?? 1;
                setTotalProducts(pagination?.total ?? productList.length);
                setHasMore(pageToFetch < totalPagesCount && productList.length > 0);

                if (isAppend) setProducts((prev) => [...prev, ...productList]);
                else setProducts(productList);
                setCurrentPage(pageToFetch);
            } else {
                if (!isAppend) setProducts([]);
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
            if (!isAppend) setProducts([]);
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

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
    }, [hasMore, loading, loadingMore, currentPage, selectedCategory, selectedSubcategory, priceRange, sortBy, searchQuery]);

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setPriceRange("all");
        setSortBy("newest");
        setCurrentPage(1);
        fetchProducts(1, false);
    };

    const getFilteredSubcategories = () => {
        if (!selectedCategory) return [];
        return subcategories.filter((sub) => sub.parent_id === selectedCategory);
    };

    const getSelectedCategoryName = () =>
        selectedCategory ? categories.find((cat) => cat.id === selectedCategory)?.name : null;

    const getSelectedSubcategoryName = () =>
        selectedSubcategory ? subcategories.find((sub) => sub.id === selectedSubcategory)?.name : null;

    const processedProducts = Array.isArray(products) ? products : [];
    const quickTags = categories;
    const hasActiveFilters =
        selectedCategory || selectedSubcategory || priceRange !== "all" || sortBy !== "newest";

    const toggleFilter = (key: string) => {
        setOpenFilter((prev) => (prev === key ? null : key));
    };

    const filterItemClass = (active: boolean) =>
        `block w-full text-left text-[13px] leading-snug py-2 pl-3 border-l-2 transition-colors ${
            active
                ? "border-primary text-primary font-semibold bg-surface-subtle"
                : "border-transparent text-body-slate hover:text-on-surface hover:border-[rgba(14,14,13,0.2)]"
        }`;

    const FilterSidebar = ({ className = "" }: { className?: string }) => (
        <aside className={`bg-pure-white border border-[rgba(14,14,13,0.1)] ${className}`}>
            <div className="px-5 py-4 border-b border-border-line bg-surface-subtle flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-primary" aria-hidden />
                    <span className="label-caps text-on-surface">Refine</span>
                </div>
                {hasActiveFilters && (
                    <button type="button" onClick={clearFilters} className="label-caps text-primary hover:text-on-surface">
                        Clear
                    </button>
                )}
            </div>

            {/* Categories */}
            <div className="border-b border-border-line">
                <button
                    type="button"
                    onClick={() => toggleFilter("categories")}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-on-surface">Categories</span>
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
                                setSelectedCategory(null);
                                setSelectedSubcategory(null);
                            }}
                            className={filterItemClass(!selectedCategory)}
                        >
                            All Collections
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                    setSelectedCategory(cat.id);
                                    setSelectedSubcategory(null);
                                }}
                                className={filterItemClass(selectedCategory === cat.id && !selectedSubcategory)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Subcategories when parent selected */}
            {selectedCategory && getFilteredSubcategories().length > 0 && (
                <div className="border-b border-border-line">
                    <button
                        type="button"
                        onClick={() => toggleFilter("subcategories")}
                        className="w-full flex items-center justify-between px-5 py-4 text-left"
                    >
                        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-on-surface">Subcategories</span>
                        {openFilter === "subcategories" ? (
                            <ChevronUp className="w-4 h-4 text-body-slate" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-body-slate" />
                        )}
                    </button>
                    {openFilter === "subcategories" && (
                        <div className="px-5 pb-5 space-y-0.5 max-h-48 overflow-y-auto">
                            {getFilteredSubcategories().map((sub) => (
                                <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => setSelectedSubcategory(sub.id === selectedSubcategory ? null : sub.id)}
                                    className={filterItemClass(selectedSubcategory === sub.id)}
                                >
                                    {sub.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Price */}
            <div className="border-b border-border-line">
                <button
                    type="button"
                    onClick={() => toggleFilter("price")}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-on-surface">Price</span>
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

            {/* Discount hint */}
            <div>
                <button
                    type="button"
                    onClick={() => toggleFilter("discount")}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-on-surface">Offers</span>
                    {openFilter === "discount" ? (
                        <ChevronUp className="w-4 h-4 text-body-slate" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-body-slate" />
                    )}
                </button>
                {openFilter === "discount" && (
                    <div className="px-5 pb-5">
                        <p className="text-[13px] text-body-slate leading-relaxed pl-3 border-l-2 border-accent-ochre/60">
                            Sale pieces carry a primary off-badge on the card when an offer is live.
                        </p>
                    </div>
                )}
            </div>
        </aside>
    );

    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen bg-surface">
                <div className="max-w-site mx-auto site-pad section-y">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-2 border-border-line border-t-primary animate-spin" />
                        <p className="label-caps text-primary">Loading Collections</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface">
            {/* Breadcrumb */}
            <div className="border-b border-border-line bg-surface">
                <div className="max-w-site mx-auto site-pad py-3.5 flex flex-wrap items-center gap-2 label-caps text-body-slate">
                    <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5" />
                        <span>Home</span>
                    </Link>
                    <span className="text-on-surface/25" aria-hidden="true">
                        /
                    </span>
                    <Link href="/products" className="hover:text-primary transition-colors">
                        Collections
                    </Link>
                    {selectedCategory && (
                        <>
                            <span className="text-on-surface/25" aria-hidden="true">
                                /
                            </span>
                            <span className="text-primary">{getSelectedCategoryName()}</span>
                        </>
                    )}
                    {selectedSubcategory && (
                        <>
                            <span className="text-on-surface/25" aria-hidden="true">
                                /
                            </span>
                            <span className="text-primary">{getSelectedSubcategoryName()}</span>
                        </>
                    )}
                </div>
            </div>

            <div className="max-w-site mx-auto site-pad pt-10 sm:pt-12 lg:pt-14 pb-16 lg:pb-20">
                {/* Page header */}
                <header className="mb-8 sm:mb-10 lg:mb-12 max-w-3xl">
                    <span className="label-caps text-primary block mb-3">Wear Yourself · Shop</span>
                    <h1 className="display-section text-on-surface mb-4">
                        {selectedSubcategory
                            ? getSelectedSubcategoryName()
                            : selectedCategory
                              ? getSelectedCategoryName()
                              : "Collections"}
                    </h1>
                    <p className="text-[15px] sm:text-[16px] text-body-slate leading-relaxed max-w-xl">
                        {selectedCategory || selectedSubcategory
                            ? "Curated handloom pieces from this edit. Refine by price or clear filters to browse the full archive."
                            : "Architectural Indian handlooms — browse by collection, price, and mood."}
                    </p>
                    <div className="mt-6 h-px w-16 bg-primary" aria-hidden />
                </header>

                <div className="flex gap-8 lg:gap-12 items-start">
                    {/* Left filters — desktop */}
                    <div className="hidden lg:block w-[248px] xl:w-[272px] flex-shrink-0 sticky top-24">
                        <FilterSidebar />
                    </div>

                    {/* Main */}
                    <div className="flex-1 min-w-0">
                        {/* Collection tabs — underline style */}
                        {quickTags.length > 0 && (
                            <div className="mb-7 border-b border-border-line overflow-x-auto scrollHide">
                                <div className="flex items-stretch gap-0 min-w-min">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedCategory(null);
                                            setSelectedSubcategory(null);
                                        }}
                                        className={`relative shrink-0 px-4 sm:px-5 py-3 text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors ${
                                            !selectedCategory
                                                ? "text-on-surface"
                                                : "text-body-slate hover:text-on-surface"
                                        }`}
                                    >
                                        All
                                        {!selectedCategory && (
                                            <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-primary" />
                                        )}
                                    </button>
                                    {quickTags.map((cat) => {
                                        const active = selectedCategory === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                title={cat.name}
                                                onClick={() => {
                                                    if (active) {
                                                        setSelectedCategory(null);
                                                        setSelectedSubcategory(null);
                                                    } else {
                                                        setSelectedCategory(cat.id);
                                                        setSelectedSubcategory(null);
                                                    }
                                                }}
                                                className={`relative shrink-0 px-4 sm:px-5 py-3 text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors max-w-[11rem] truncate ${
                                                    active
                                                        ? "text-on-surface"
                                                        : "text-body-slate hover:text-on-surface"
                                                }`}
                                            >
                                                {cat.name}
                                                {active && (
                                                    <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-primary" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Toolbar */}
                        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3 flex-wrap">
                                <button
                                    type="button"
                                    className="lg:hidden label-caps px-4 py-2.5 border border-[rgba(14,14,13,0.14)] bg-pure-white text-on-surface inline-flex items-center gap-2"
                                    onClick={() => setMobileFiltersOpen(true)}
                                >
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    Refine
                                </button>
                                <div>
                                    <p className="label-caps text-body-slate mb-1">Showing</p>
                                    <p className="text-[15px] font-semibold text-on-surface tracking-tight">
                                        {totalProducts} {totalProducts === 1 ? "Piece" : "Pieces"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <label htmlFor="collections-sort" className="label-caps text-body-slate">
                                    Sort
                                </label>
                                <select
                                    id="collections-sort"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none min-w-[11.5rem] px-4 py-2.5 bg-pure-white border border-[rgba(14,14,13,0.14)] text-[11px] font-semibold tracking-[0.06em] uppercase text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <option key={opt.id} value={opt.id}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Grid / empty */}
                        {loading ? (
                            <div className="text-center py-24 border border-dashed border-[rgba(14,14,13,0.12)] bg-pure-white">
                                <div className="w-10 h-10 border-2 border-border-line border-t-primary animate-spin mx-auto mb-4" />
                                <p className="label-caps text-primary">Loading Collections</p>
                            </div>
                        ) : processedProducts.length === 0 ? (
                            <div className="border border-[rgba(14,14,13,0.12)] bg-pure-white">
                                <div className="grid lg:grid-cols-[1.1fr_0.9fr] min-h-[22rem]">
                                    <div className="flex flex-col justify-center px-7 sm:px-10 lg:px-12 py-12 sm:py-14 border-b lg:border-b-0 lg:border-r border-[rgba(14,14,13,0.1)]">
                                        <span className="label-caps text-primary block mb-4">
                                            {hasActiveFilters ? "No Match In This Edit" : "Archive Quiet For Now"}
                                        </span>
                                        <h3 className="text-[28px] sm:text-[34px] font-bold tracking-[-0.025em] leading-[1.15] text-on-surface mb-4">
                                            {hasActiveFilters ? "Nothing matches these filters" : "No pieces listed yet"}
                                        </h3>
                                        <p className="text-[15px] text-body-slate leading-relaxed mb-8 max-w-md">
                                            {hasActiveFilters
                                                ? "Adjust the price band, switch collection, or reset refinements to see the full shop."
                                                : "Add products from the dashboard and they will appear here in this collection layout."}
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            {hasActiveFilters ? (
                                                <>
                                                    <button type="button" onClick={clearFilters} className="sv-btn-primary">
                                                        Reset Filters
                                                    </button>
                                                    <Link href="/products" className="sv-btn-outline inline-flex items-center gap-2">
                                                        View All Collections
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </Link>
                                                </>
                                            ) : (
                                                <Link href="/" className="sv-btn-primary inline-flex items-center gap-2">
                                                    Back to Home
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-surface-subtle px-7 sm:px-8 py-10 flex flex-col justify-center">
                                        <p className="label-caps text-body-slate mb-5">Coming Into Frame</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[0, 1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className="aspect-[3/4] border border-[rgba(14,14,13,0.1)] bg-surface-ivory/80 relative overflow-hidden"
                                                >
                                                    <div className="absolute inset-x-3 bottom-3 space-y-2">
                                                        <div className="h-1.5 w-1/3 bg-[rgba(14,14,13,0.12)]" />
                                                        <div className="h-2 w-2/3 bg-[rgba(14,14,13,0.16)]" />
                                                        <div className="h-1.5 w-1/4 bg-[rgba(139,19,19,0.25)]" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                                {processedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} compact />
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

                        {!hasMore && processedProducts.length > 0 && !loadingMore && (
                            <div className="mt-10 pt-6 border-t border-border-line text-center">
                                <p className="label-caps text-body-slate">End of this collection</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile filter drawer */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-[70] lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-surface-dark/50"
                        aria-label="Close filters"
                        onClick={() => setMobileFiltersOpen(false)}
                    />
                    <div className="absolute top-0 left-0 h-full w-[min(20rem,90vw)] bg-surface overflow-y-auto p-4 border-r border-border-line">
                        <div className="flex items-center justify-between mb-4">
                            <span className="label-caps text-primary">Refine</span>
                            <button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <FilterSidebar />
                        <button
                            type="button"
                            className="sv-btn-primary w-full mt-4"
                            onClick={() => setMobileFiltersOpen(false)}
                        >
                            Show Results
                        </button>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={scrollToTop}
                aria-label="Scroll to top"
                className={`fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 p-3 bg-surface-dark hover:bg-primary text-surface border border-on-surface transition-all duration-300 ${
                    showScrollTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-8 pointer-events-none"
                }`}
            >
                <ChevronUp className="w-5 h-5" />
            </button>
        </div>
    );
};

export default ProductsPage;
