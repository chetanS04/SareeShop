"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getMostOrderedProducts } from "../../../../utils/product";
import Link from "next/link";
import ProductCard from "@/components/(frontend)/ProductCard";
import { getProductSlug } from "../../../../utils/slugUtils";
import { useProductSync, ProductEventData } from "@/context/ProductSyncContext";

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

const PopularProductsSlider = () => {
    const [products, setProducts] = useState<PopularProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const isFetchingRef = useRef(false);

    const [error, setError] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const router = useRouter();
    const { subscribeToAll } = useProductSync();

    const loadProducts = async (pageNum: number = 1, isAppend: boolean = false) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        if (isAppend) {
            setIsLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await getMostOrderedProducts(10, pageNum);

            if (response.success && response.result) {
                const fetched = response.result.products || (Array.isArray(response.result) ? response.result : []);
                const pagination = response.result.pagination || response.result;
                const hasNext = Boolean(
                    pagination?.has_more ??
                    pagination?.hasNextPage ??
                    pagination?.has_next_page ??
                    (pagination?.last_page ? pageNum < pagination.last_page : fetched.length >= 10)
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

    const loadNextPage = useCallback(() => {
        if (!hasMore || isLoadingMore || isFetchingRef.current) return;
        loadProducts(page + 1, true);
    }, [hasMore, isLoadingMore, page]);

    useEffect(() => {
        const unsubscribe = subscribeToAll((event: ProductEventData) => {
            const updatedProd = event.product;
            const pid = event.productId || (updatedProd?.id ? Number(updatedProd.id) : undefined);
            if (!pid) return;

            if (event.action === "deleted" || (event.action === "status_changed" && event.status === false)) {
                setProducts((prev) => prev.filter((p) => Number(p.id) !== pid));
            } else if (event.action === "updated" && updatedProd) {
                setProducts((prev) =>
                    prev.map((p) => {
                        if (Number(p.id) !== pid) return p;
                        return {
                            ...p,
                            ...updatedProd,
                            name: updatedProd.name ?? p.name,
                            image_url: updatedProd.image_url ?? p.image_url,
                        };
                    })
                );
            }
        });

        return () => {
            unsubscribe();
        };
    }, [subscribeToAll]);

    useEffect(() => {
        loadProducts(1, false);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        if (direction === 'right') {
            if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 500) {
                loadNextPage();
            }
        }

        const scrollAmount = 350;
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    const handleProductsScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        if (target.scrollLeft + target.clientWidth >= target.scrollWidth - 350) {
            loadNextPage();
        }
    };

    // Mouse drag handlers
    const isDraggingRef = useRef(false);
    const hasDraggedRef = useRef(false);
    const dragStartXRef = useRef(0);
    const dragScrollLeftRef = useRef(0);
    const [isDragging, setIsDragging] = useState(false);

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = scrollContainerRef.current;
        if (!el) return;
        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        dragStartXRef.current = e.pageX - el.offsetLeft;
        dragScrollLeftRef.current = el.scrollLeft;
        setIsDragging(true);
    };

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        const el = scrollContainerRef.current;
        if (!el) return;
        const x = e.pageX - el.offsetLeft;
        const walk = (x - dragStartXRef.current) * 1.5;
        if (Math.abs(x - dragStartXRef.current) > 5) hasDraggedRef.current = true;
        el.scrollLeft = dragScrollLeftRef.current - walk;

        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 350) {
            loadNextPage();
        }
    };

    const onMouseUp = () => {
        isDraggingRef.current = false;
        setIsDragging(false);
    };

    const onMouseLeave = () => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false;
            setIsDragging(false);
        }
    };

    // Touch handlers for swipe functionality
    const minSwipeDistance = 45;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > minSwipeDistance) {
            scroll('right');
        } else if (distance < -minSwipeDistance) {
            scroll('left');
        }
    };

    if (loading) {
        return (
            <section className="bg-white pt-2 sm:pt-4 md:pt-4 pb-12 sm:pb-16 md:pb-20">
                <div className="w-full max-w-[1536px] mx-auto px-7 sm:px-4 md:px-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="flex-1">
                            <div className="h-6 sm:h-8 bg-gray-300 rounded w-48 sm:w-64 mb-2 animate-pulse"></div>
                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-56 sm:w-80 animate-pulse"></div>
                        </div>
                        <div className="h-8 w-20 sm:w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>

                    {/* Loading Skeleton - Horizontal Scroll */}
                    <div className="overflow-hidden">
                        <div className="flex gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="flex-shrink-0 w-[175px] sm:w-[210px] md:w-[240px] lg:w-[270px]">
                                    <div className="bg-white rounded-2xl border border-gray-100 p-3 animate-pulse h-[360px] flex flex-col gap-3 shadow-2xs">
                                        <div className="w-full aspect-square bg-gray-200 rounded-xl" />
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                                        <div className="mt-auto h-5 bg-gray-200 rounded w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (error || (!loading && products.length === 0)) {
        return null;
    }

    return (
        <section className="bg-white pt-2 sm:pt-4 md:pt-4 pb-12 sm:pb-16 md:pb-20">
            <div className="w-full max-w-[1536px] mx-auto px-7 sm:px-4 md:px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-[#0c2340] tracking-normal">Popular Products</h2>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Trending products loved by customers</p>
                    </div>
                    {products.length > 0 && (
                        <Link
                            href="/Popular_Products"
                            className="group/btn inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#007FFF] hover:text-[#0055CC] transition-colors"
                        >
                            <span>View All</span>
                            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                        </Link>
                    )}
                </div>

                {products.length > 0 ? (
                    <div className="relative group/slider px-1 sm:px-2">
                        {/* Horizontal Scroll for All Screen Sizes */}
                        <div className="relative">
                            {/* Left Navigation Button - Appears on hover outside cards */}
                            <button
                                onClick={() => scroll('left')}
                                className="hidden md:flex absolute -left-5 lg:-left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 lg:w-12 lg:h-12 items-center justify-center bg-white/95 hover:bg-white text-gray-800 shadow-xl rounded-full border border-gray-200 opacity-0 invisible group-hover/slider:opacity-100 group-hover/slider:visible transition-all duration-300 hover:scale-110 cursor-pointer"
                                aria-label="Scroll left"
                            >
                                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {/* Right Navigation Button - Appears on hover outside cards */}
                            <button
                                onClick={() => scroll('right')}
                                className="hidden md:flex absolute -right-5 lg:-right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 lg:w-12 lg:h-12 items-center justify-center bg-white/95 hover:bg-white text-gray-800 shadow-xl rounded-full border border-gray-200 opacity-0 invisible group-hover/slider:opacity-100 group-hover/slider:visible transition-all duration-300 hover:scale-110 cursor-pointer"
                                aria-label="Scroll right"
                            >
                                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Scrollable Container */}
                            <div
                                ref={scrollContainerRef}
                                onScroll={handleProductsScroll}
                                onMouseDown={onMouseDown}
                                onMouseMove={onMouseMove}
                                onMouseUp={onMouseUp}
                                onMouseLeave={onMouseLeave}
                                onTouchStart={onTouchStart}
                                onTouchMove={onTouchMove}
                                onTouchEnd={onTouchEnd}
                                className={`flex gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto scrollbar-hide pb-2 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
                                    }`}
                                style={{
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                }}
                            >
                                {products.map((product) => (
                                    <div key={product.id} className="flex-shrink-0 w-[175px] sm:w-[210px] md:w-[240px] lg:w-[270px]">
                                        <ProductCard
                                            product={product}
                                            onClick={() => {
                                                if (!hasDraggedRef.current) router.push(`/products/${getProductSlug(product)}`);
                                            }}
                                        />
                                    </div>
                                ))}

                                {/* Inline loading skeleton cards while sliding to load next 10 products */}
                                {isLoadingMore && (
                                    Array.from({ length: 3 }).map((_, idx) => (
                                        <div key={`pop-skeleton-${idx}`} className="flex-shrink-0 w-[175px] sm:w-[210px] md:w-[240px] lg:w-[270px]">
                                            <div className="bg-white rounded-2xl border border-gray-100 p-3 animate-pulse h-[360px] flex flex-col gap-3 shadow-2xs">
                                                <div className="w-full aspect-square bg-gray-200 rounded-xl" />
                                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                                                <div className="mt-auto h-5 bg-gray-200 rounded w-2/3" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-lg font-medium">No popular products yet</p>
                        <p className="text-gray-400 text-sm mt-2">Products will appear here once customers start placing orders</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
};

export default PopularProductsSlider;