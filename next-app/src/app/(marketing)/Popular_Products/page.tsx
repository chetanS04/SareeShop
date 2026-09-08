"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Loader2, Check } from "lucide-react";
import { getMostOrderedProducts } from "../../../../utils/product";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/(frontend)/ProductCard";
import { getProductSlug } from "../../../../utils/slugUtils";

interface PopularProduct {
    id: number;
    name: string;
    description: string;
    image_url: string | null;
    category: {
        id: number;
        name: string;
    } | null;
    brand: {
        id: number;
        name: string;
    } | null;
    price_range: {
        min: string | number;
        max: string | number;
        currency: string;
    };
    total_stock: number;
    likes_count: number;
    variants_count: number;
    best_variant: {
        id: number;
        title?: string | null;
        sku?: string;
        sp: string | number;
        mrp: string | number;
        stock: number;
        image_url: string | null;
    } | null;
    total_ordered_quantity: number;
    total_orders_count: number;
    total_revenue: number;
    average_rating: string | number;
    reviews_count: number;
    created_at: string;
}

const PAGE_SIZE = 12;

const Popular_Products = () => {
    const router = useRouter();
    const [products, setProducts] = useState<PopularProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isFetchingRef = useRef(false);
    const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

    const loadProducts = async (pageNum: number = 1, isAppend: boolean = false) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        if (isAppend) {
            setIsLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await getMostOrderedProducts(PAGE_SIZE, pageNum);

            if (response.success && response.result) {
                const fetched = response.result.products || (Array.isArray(response.result) ? response.result : []);
                const pagination = response.result.pagination || response.result;
                const hasNext = Boolean(
                    pagination?.has_more ??
                    pagination?.hasNextPage ??
                    pagination?.has_next_page ??
                    (pagination?.last_page ? pageNum < pagination.last_page : fetched.length >= PAGE_SIZE)
                );

                setPage(pageNum);
                setHasMore(hasNext);

                if (isAppend) {
                    setProducts((prev) => {
                        const existingIds = new Set(prev.map((p) => p.id));
                        const newItems = fetched.filter((p: any) => !existingIds.has(p.id));
                        return [...prev, ...newItems];
                    });
                } else {
                    setProducts(fetched);
                }
            } else {
                if (!isAppend) setError(response.message || "Failed to fetch popular products");
                setHasMore(false);
            }
        } catch (err) {
            if (!isAppend) setError("An error occurred while fetching products");
            console.error("Error fetching popular products:", err);
            setHasMore(false);
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        loadProducts(1, false);
    }, []);

    const loadNextPage = useCallback(() => {
        if (!hasMore || isLoadingMore || loading || isFetchingRef.current) return;
        loadProducts(page + 1, true);
    }, [hasMore, isLoadingMore, loading, page]);

    // Bottom sentinel observer for infinite scroll
    useEffect(() => {
        const sentinel = bottomSentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadNextPage();
                }
            },
            { root: null, rootMargin: "300px", threshold: 0.1 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadNextPage]);

    if (loading && products.length === 0) {
        return (
            <section className="py-8 sm:py-12 md:py-16 bg-[#FAFAFA] min-h-screen">
                <div className="container mx-auto px-4 md:px-8">
                    {/* Skeleton Header */}
                    <div className="mb-6 sm:mb-8 md:mb-12">
                        <div className="h-7 sm:h-9 bg-gray-200 rounded-lg w-64 sm:w-80 mb-2 animate-pulse" />
                        <div className="h-4 bg-gray-100 rounded w-72 sm:w-96 animate-pulse" />
                    </div>

                    {/* Skeleton Product Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-2xl border border-gray-100 p-3 animate-pulse space-y-3 shadow-2xs">
                                <div className="w-full aspect-square bg-gray-200 rounded-xl" />
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                                <div className="h-5 bg-gray-200 rounded w-2/3 mt-2" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error && products.length === 0) {
        return (
            <section className="py-8 sm:py-12 md:py-16 min-h-screen bg-[#FAFAFA]">
                <div className="container mx-auto px-4 md:px-8">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 md:mb-12">Most Ordered Products</h2>
                    <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl shadow-xs max-w-lg mx-auto">
                        <p className="text-red-500 mb-4 text-sm sm:text-base font-medium">{error}</p>
                        <button
                            onClick={() => loadProducts(1, false)}
                            style={{ backgroundColor: 'var(--theme-blue, #007FFF)', color: '#FFFAFB' }}
                            className="px-6 py-2.5 text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8 sm:py-12 md:py-16 min-h-screen bg-[#FAFAFA]">
            <div className="container mx-auto px-4 md:px-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 md:mb-12">
                    <div>
                        <div className="flex items-center gap-3 sm:gap-4 mb-1 sm:mb-2">
                            <button
                                onClick={() => router.back()}
                                className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-full text-gray-600 hover:text-[#007FFF] transition-colors cursor-pointer shadow-xs"
                                aria-label="Go back"
                            >
                                <FaArrowLeft className="w-4 h-4" />
                            </button>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Most Ordered Products</h1>
                        </div>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 ml-0 sm:ml-12">
                            Based on actual customer order volume and trending items
                        </p>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onClick={() => router.push(`/products/${getProductSlug(product)}`)}
                        />
                    ))}
                </div>

                {/* Bottom Sentinel for Infinite Scroll */}
                <div ref={bottomSentinelRef} className="h-10 w-full pointer-events-none" />

                {/* Loading More Spinner */}
                {isLoadingMore && (
                    <div className="flex items-center justify-center gap-2.5 py-8 text-sm text-gray-600">
                        <Loader2 className="w-5 h-5 animate-spin text-[#007FFF]" />
                        <span className="font-semibold text-gray-700">Loading more popular products...</span>
                    </div>
                )}

                {/* End of results indicator */}
                {!hasMore && products.length > 0 && (
                    <div className="flex items-center justify-center py-8 text-xs sm:text-sm text-gray-500">
                        <span className="bg-white px-4 py-1.5 rounded-full border border-gray-200 text-gray-600 font-semibold shadow-2xs flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>All {products.length} popular products loaded</span>
                        </span>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Popular_Products;