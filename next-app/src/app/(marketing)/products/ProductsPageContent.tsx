"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronUp, Home, ArrowUpRight } from "lucide-react";
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

    const getSelectedCategoryName = () =>
        selectedCategory ? categories.find((cat) => cat.id === selectedCategory)?.name : null;

    const getSelectedSubcategoryName = () =>
        selectedSubcategory ? subcategories.find((sub) => sub.id === selectedSubcategory)?.name : null;

    const processedProducts = Array.isArray(products) ? products : [];
    const hasActiveFilters =
        selectedCategory || selectedSubcategory || priceRange !== "all" || sortBy !== "newest";

    if (loading && products.length === 0) {
        return (
            <div className="min-h-screen bg-surface overflow-x-hidden">
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
        <div className="min-h-screen bg-surface overflow-x-hidden">
            {/* Breadcrumb */}
            <div className="border-b border-border-line bg-surface">
                <div className="max-w-site mx-auto site-pad py-3.5 flex flex-wrap items-center gap-2 label-caps text-body-slate min-w-0">
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
                            <span className="text-primary truncate max-w-[12rem] sm:max-w-none">{getSelectedCategoryName()}</span>
                        </>
                    )}
                    {selectedSubcategory && (
                        <>
                            <span className="text-on-surface/25" aria-hidden="true">
                                /
                            </span>
                            <span className="text-primary truncate max-w-[12rem] sm:max-w-none">{getSelectedSubcategoryName()}</span>
                        </>
                    )}
                </div>
            </div>

            <div className="site-pad pt-8 sm:pt-10 lg:pt-12 pb-16 lg:pb-20">
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
                            ? "Curated handloom pieces from this collection."
                            : "Handloom sarees for work, celebrations, and everyday life."}
                    </p>
                    <div className="mt-6 h-px w-16 bg-primary" aria-hidden />
                </header>

                <div>
                    <div className="min-w-0">
                        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4 mb-8">
                            <p className="text-[13px] text-body-slate">
                                <span className="font-semibold text-on-surface">{totalProducts}</span>{" "}
                                {totalProducts === 1 ? "Piece" : "Pieces"}
                            </p>

                            <div className="flex items-center gap-3">
                                <label htmlFor="collections-sort" className="label-caps text-body-slate shrink-0">
                                    Sort
                                </label>
                                <select
                                    id="collections-sort"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none flex-1 sm:flex-none sm:min-w-[11.5rem] px-4 py-2.5 bg-pure-white border border-[rgba(14,14,13,0.14)] text-[11px] font-semibold tracking-[0.06em] uppercase text-on-surface focus:outline-none focus:border-primary cursor-pointer"
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
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-2.5 gap-y-5 sm:gap-x-4 sm:gap-y-8 lg:gap-x-5">
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
