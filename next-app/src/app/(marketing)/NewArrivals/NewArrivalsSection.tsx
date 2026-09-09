"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchNewArrivalSliders, fetchNewArrivalProducts } from "../../../../utils/newArrivalApi";
import ProductCard from "@/components/(frontend)/ProductCard";
import { getProductSlug } from "../../../../utils/slugUtils";
import { useProductSync, ProductEventData } from "@/context/ProductSyncContext";

const baseUrl = process.env.NEXT_PUBLIC_UPLOAD_BASE || "https://api.zelton.co.in";

type Slider = {
    id: number;
    title?: string | null;
    description?: string;
    image: string;
    link?: string;
    open_in_new_tab?: boolean;
    status: boolean;
    order: number;
};

type Product = {
    id: number;
    name: string;
    image_url: string | null;
    is_new_arrival: boolean;
    brand: { id: number; name: string } | null;
    category: { id: number; name: string } | null;
    best_variant?: {
        id: number;
        sp: string | number;
        mrp: string | number;
        stock: number;
        image_url: string | null;
    } | null;
    min_price?: number;
    max_price?: number;
    average_rating?: string | number;
    reviews_count?: number;
};

export default function NewArrivalsSection() {
    const router = useRouter();

    const [sliders, setSliders] = useState<Slider[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slidersLoading, setSlidersLoading] = useState(true);

    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const isFetchingRef = useRef(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const autoplayRef = useRef<NodeJS.Timeout | null>(null);
    const [isPaused, setIsPaused] = useState(false);

    // Drag-to-scroll
    const isDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const dragScrollLeftRef = useRef(0);
    const hasDraggedRef = useRef(false);
    const [isDragging, setIsDragging] = useState(false);
    const { subscribeToAll } = useProductSync();

    const loadProducts = async (pageNum: number = 1, isAppend: boolean = false) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        if (isAppend) {
            setIsLoadingMore(true);
        } else {
            setProductsLoading(true);
        }

        try {
            const res = await fetchNewArrivalProducts({
                page: pageNum,
                limit: 10,
                per_page: 10,
                paginate: true,
            });

            let list: any[] = [];
            let hasNext = false;

            if (res && res.data && Array.isArray(res.data)) {
                list = res.data;
                hasNext = Boolean(
                    res.has_more ??
                    res.hasNextPage ??
                    res.has_next_page ??
                    (res.last_page ? pageNum < res.last_page : list.length >= 10)
                );
            } else if (Array.isArray(res)) {
                list = res;
                hasNext = list.length >= 10;
            }

            setPage(pageNum);
            setHasMore(hasNext);

            if (isAppend) {
                setProducts((prev) => {
                    const existingIds = new Set(prev.map((p) => p.id));
                    const newItems = list.filter((p) => !existingIds.has(p.id));
                    return [...prev, ...newItems];
                });
            } else {
                setProducts(list);
            }
        } catch (err) {
            console.error("Failed to load new arrivals:", err);
            if (!isAppend) setProducts([]);
            setHasMore(false);
        } finally {
            isFetchingRef.current = false;
            setProductsLoading(false);
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
                if (updatedProd.is_new_arrival === false) {
                    setProducts((prev) => prev.filter((p) => Number(p.id) !== pid));
                } else {
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
            } else if (event.action === "created" && updatedProd?.is_new_arrival) {
                setProducts((prev) => [updatedProd, ...prev]);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [subscribeToAll]);

    useEffect(() => {
        fetchNewArrivalSliders()
            .then((data) => {
                const active = (data || []).filter((s: Slider) =>
                    s.status === true ||
                    String(s.status) === "1" ||
                    String(s.status) === "true"
                );
                setSliders(active);
            })
            .catch(() => { })
            .finally(() => setSlidersLoading(false));

        loadProducts(1, false);
    }, []);

    const startAutoplay = useCallback(() => {
        if (autoplayRef.current) clearInterval(autoplayRef.current);
        autoplayRef.current = setInterval(() => {
            if (!isPaused) {
                setCurrentSlide((p) => (p + 1) % (sliders.length || 1));
            }
        }, 6000);
    }, [sliders.length, isPaused]);

    useEffect(() => {
        if (sliders.length < 2) return;
        startAutoplay();
        return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
    }, [sliders.length, startAutoplay]);

    const scrollProducts = (dir: "left" | "right") => {
        const container = scrollRef.current;
        if (!container) return;

        if (dir === "right") {
            if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 500) {
                loadNextPage();
            }
        }

        container.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
    };

    const handleProductsScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        if (target.scrollLeft + target.clientWidth >= target.scrollWidth - 350) {
            loadNextPage();
        }
    };

    // Mouse drag handlers
    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = scrollRef.current;
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
        const el = scrollRef.current;
        if (!el) return;
        const x = e.pageX - el.offsetLeft;
        const walk = (x - dragStartXRef.current) * 1.5;
        if (Math.abs(x - dragStartXRef.current) > 5) hasDraggedRef.current = true;
        el.scrollLeft = dragScrollLeftRef.current - walk;

        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 350) {
            loadNextPage();
        }
    };

    const onMouseUp = () => { isDraggingRef.current = false; setIsDragging(false); };
    const onMouseLeave = () => { if (isDraggingRef.current) { isDraggingRef.current = false; setIsDragging(false); } };

    const isLoading = slidersLoading || productsLoading;
    const isEmpty = !isLoading && sliders.length === 0 && products.length === 0;

    if (isEmpty) return null;

    // First slider image used as poster if available
    const posterSlide = sliders.length > 0 ? sliders[currentSlide] : null;
    const showProductsSection = productsLoading || products.length > 0;

    return (
        <section className={`bg-white ${showProductsSection ? "pt-6 sm:pt-8 md:pt-10 pb-6 sm:pb-8 md:pb-8" : "pt-6 sm:pt-8 pb-2"}`}>
            {/* ── Edge-to-Edge Full-Width Banner Slider ── */}
            {!slidersLoading && sliders.length > 0 && (
                <div className={`relative w-full aspect-[1791/563] overflow-hidden ${showProductsSection ? "mb-6 sm:mb-8" : "mb-0"} group select-none bg-gray-100`}>
                    {sliders.map((slide, idx) => {
                        const isClickable = !!slide.link;
                        const targetVal = (slide.open_in_new_tab === true || String(slide.open_in_new_tab) === "1" || String(slide.open_in_new_tab) === "true") ? "_blank" : "_self";
                        const isCurrent = idx === currentSlide;
                        return (
                            <div
                                key={slide.id}
                                className={`w-full h-full transition-opacity duration-500 ease-in-out ${isCurrent ? "relative z-10 opacity-100 pointer-events-auto visible" : "absolute top-0 left-0 right-0 bottom-0 z-0 opacity-0 pointer-events-none invisible"}`}
                            >
                                {isClickable ? (
                                    <a href={slide.link} target={targetVal} rel="noopener noreferrer" className="block w-full h-full cursor-pointer">
                                        <img
                                            src={`${baseUrl}${slide.image}`}
                                            alt={slide.title || "New Arrival Banner"}
                                            onError={(e) => {
                                                (e.target as HTMLElement).style.display = "none";
                                            }}
                                            className="w-full h-full object-cover select-none"
                                        />
                                    </a>
                                ) : (
                                    <div className="w-full h-full">
                                        <img
                                            src={`${baseUrl}${slide.image}`}
                                            alt={slide.title || "New Arrival Banner"}
                                            onError={(e) => {
                                                (e.target as HTMLElement).style.display = "none";
                                            }}
                                            className="w-full h-full object-cover select-none"
                                        />
                                    </div>
                                )}
                                {(slide.title || slide.description) && (
                                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none">
                                        {slide.title && <p className="text-white text-base sm:text-lg font-semibold drop-shadow">{slide.title}</p>}
                                        {slide.description && <p className="text-white/80 text-xs sm:text-sm mt-0.5 drop-shadow">{slide.description}</p>}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            {slidersLoading && (
                <div className={`w-full aspect-[1791/563] bg-gray-200 animate-pulse ${showProductsSection ? "mb-6 sm:mb-8" : "mb-0"}`} />
            )}

            {showProductsSection && (
                <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* ── Section Header ── */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-[#0c2340] tracking-normal">
                                New Arrivals
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Trending products loved by customers</p>
                        </div>
                        {products.length > 0 && (
                            <Link
                                href="/new-arrivals"
                                className="group/btn inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#007FFF] hover:text-[#0055CC] transition-colors"
                            >
                                <span>View All</span>
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                            </Link>
                        )}
                    </div>

                    {/* ── Products Horizontal Scroll Slider ── */}
                    {productsLoading ? (
                        <div className="flex gap-5 overflow-hidden py-4">
                            <div className="hidden md:block w-[240px] lg:w-[270px] h-[360px] rounded-2xl bg-gray-100 animate-pulse flex-shrink-0" />
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="w-[175px] sm:w-[210px] md:w-[240px] h-[360px] rounded-2xl bg-gray-100 animate-pulse flex-shrink-0" />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="flex gap-4 sm:gap-5 items-stretch relative group/slider px-1 sm:px-2">
                            {/* 1. Left-most Lifestyle / Poster Card */}
                            <div
                                onClick={() => router.push('/new-arrivals')}
                                className="hidden md:block flex-shrink-0 w-[240px] lg:w-[270px] self-stretch rounded-2xl overflow-hidden relative cursor-pointer group/poster shadow-sm hover:shadow-md transition-all duration-300 min-h-[350px]"
                            >
                                {posterSlide ? (
                                    <img
                                        src={`${baseUrl}${posterSlide.image}`}
                                        alt="New Arrivals"
                                        className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#0c2340] via-[#1a3a5c] to-[#007FFF]" />
                                )}
                                <div className="absolute inset-0 bg-black/25 group-hover/poster:bg-black/35 transition-colors flex items-center justify-center">
                                    <button className="bg-white text-gray-900 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-lg hover:bg-gray-100 transition-all transform group-hover/poster:scale-105 cursor-pointer">
                                        View All
                                    </button>
                                </div>
                            </div>

                            {/* 2. Scrollable Product Cards on Right */}
                            <div className="relative flex-1 min-w-0">
                                {/* Left Scroll Button */}
                                <button
                                    onClick={() => scrollProducts('left')}
                                    className="hidden md:flex absolute -left-5 lg:-left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 lg:w-12 lg:h-12 items-center justify-center bg-white/95 hover:bg-white text-gray-800 shadow-xl rounded-full border border-gray-200 opacity-0 invisible group-hover/slider:opacity-100 group-hover/slider:visible transition-all duration-300 hover:scale-110 cursor-pointer"
                                    aria-label="Scroll left"
                                >
                                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                                </button>

                                {/* Right Scroll Button */}
                                <button
                                    onClick={() => scrollProducts('right')}
                                    className="hidden md:flex absolute -right-5 lg:-right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 lg:w-12 lg:h-12 items-center justify-center bg-white/95 hover:bg-white text-gray-800 shadow-xl rounded-full border border-gray-200 opacity-0 invisible group-hover/slider:opacity-100 group-hover/slider:visible transition-all duration-300 hover:scale-110 cursor-pointer"
                                    aria-label="Scroll right"
                                >
                                    <ChevronRight className="w-6 h-6 text-gray-800" />
                                </button>

                                {/* Product Cards Row */}
                                <div
                                    ref={scrollRef}
                                    onScroll={handleProductsScroll}
                                    onMouseDown={onMouseDown}
                                    onMouseMove={onMouseMove}
                                    onMouseUp={onMouseUp}
                                    onMouseLeave={onMouseLeave}
                                    className={`flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto scrollbar-hide pb-4 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
                                        }`}
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {products.map((product) => (
                                        <div key={product.id} className="flex-shrink-0 w-[175px] sm:w-[210px] md:w-[240px] lg:w-[260px]">
                                            <ProductCard
                                                product={product}
                                                isNew
                                                onClick={() => {
                                                    if (!hasDraggedRef.current) router.push(`/products/${getProductSlug(product)}`);
                                                }}
                                            />
                                        </div>
                                    ))}

                                    {/* Inline loading skeleton cards while sliding to load next 10 products */}
                                    {isLoadingMore && (
                                        Array.from({ length: 3 }).map((_, idx) => (
                                            <div key={`na-skeleton-${idx}`} className="flex-shrink-0 w-[175px] sm:w-[210px] md:w-[240px] lg:w-[260px]">
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
                    ) : null}
                </div>
            )}

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
