"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
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

function StarRating({ rating, count }: { rating: number; count: number }) {
    const full = Math.floor(rating);
    const half = rating % 1 !== 0;
    if (rating <= 0) return null;
    return (
        <div className="flex items-center gap-1">
            <div className="flex text-accent-ochre text-[10px]">
                {Array.from({ length: full }).map((_, i) => <FaStar key={i} />)}
                {half && <FaStarHalfAlt />}
                {Array.from({ length: 5 - full - (half ? 1 : 0) }).map((_, i) => (
                    <FaStar key={`e${i}`} className="text-surface-ivory" />
                ))}
            </div>
            {count > 0 && <span className="text-[10px] text-body-slate">({count})</span>}
        </div>
    );
}

export default function NewArrivalsSection() {
    const router = useRouter();

    const [sliders, setSliders] = useState<Slider[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slidersLoading, setSlidersLoading] = useState(true);

    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);

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
                const active = data.filter((s: Slider) =>
                    s.status === true ||
                    String(s.status) === "1" ||
                    String(s.status) === "true"
                );
                setSliders(active);
            })
            .catch(() => { })
            .finally(() => setSlidersLoading(false));

        fetchNewArrivalProducts()
            .then((res) => setProducts(res.data || []))
            .catch(() => { })
            .finally(() => setProductsLoading(false));
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
        scrollRef.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
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
    };
    const onMouseUp = () => { isDraggingRef.current = false; setIsDragging(false); };
    const onMouseLeave = () => { if (isDraggingRef.current) { isDraggingRef.current = false; setIsDragging(false); } };

    const formatPrice = (p?: number | null) => {
        if (p === null || p === undefined || isNaN(Number(p))) return "₹0";
        return `₹${Number(p).toLocaleString('en-IN')}`;
    };

    const isLoading = slidersLoading || productsLoading;
    const isEmpty = !isLoading && sliders.length === 0 && products.length === 0;

    if (isEmpty) return null;

    // First slider image used as poster if available
    const posterSlide = sliders.length > 0 ? sliders[currentSlide] : null;
    const showProductsSection = productsLoading || products.length > 0;

    return (
        <section className={`bg-surface ${showProductsSection ? "pt-6 sm:pt-8 md:pt-10 pb-6 sm:pb-8 md:pb-8" : "pt-6 sm:pt-8 pb-2"}`}>
            {/* ── Edge-to-Edge Full-Width Banner Slider (Full Size, No Space Left/Right) ── */}
            {!slidersLoading && sliders.length > 0 && (
                <div className={`relative w-full aspect-[1791/563] overflow-hidden ${showProductsSection ? "mb-6 sm:mb-8" : "mb-0"} group select-none bg-surface-ivory`}>
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
                                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-on-surface/70 via-on-surface/20 to-transparent pointer-events-none">
                                        {slide.title && <p className="text-surface text-base sm:text-lg font-semibold uppercase tracking-tight">{slide.title}</p>}
                                        {slide.description && <p className="text-surface/80 text-xs sm:text-sm mt-0.5">{slide.description}</p>}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            {slidersLoading && (
                <div className={`w-full aspect-[1791/563] bg-surface-ivory animate-pulse ${showProductsSection ? "mb-6 sm:mb-8" : "mb-0"}`} />
            )}

            {showProductsSection && (
                <div className="w-full max-w-site mx-auto site-pad">
                    {/* ── Section Header ── */}
                    <div className="mb-6 pb-5 border-b border-border-line flex items-end justify-between gap-4">
                        <div>
                            <span className="label-caps text-primary block mb-2">Just Landed</span>
                            <h2 className="display-section text-on-surface">
                                New In
                            </h2>
                        </div>
                        {products.length > 0 && (
                            <Link
                                href="/new-arrivals"
                                className="group/btn inline-flex items-center gap-2 label-caps text-on-surface hover:text-primary transition-colors"
                            >
                                <span>View All</span>
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                            </Link>
                        )}
                    </div>

                    {/* ── Products Horizontal Scroll Slider (Static Poster on Web, Clean Scroll on Mobile) ── */}
                    {productsLoading ? (
                        <div className="flex gap-5 overflow-hidden py-4">
                            <div className="hidden md:block w-[240px] lg:w-[270px] h-[360px] bg-surface-ivory animate-pulse flex-shrink-0" />
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="w-[175px] sm:w-[210px] md:w-[240px] h-[360px] bg-surface-ivory animate-pulse flex-shrink-0" />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="flex gap-4 sm:gap-5 items-stretch relative group/slider px-1 sm:px-2">
                            {/* 1. Left-most Lifestyle / Poster Card (Static on Web View, hidden on mobile) */}
                            <div
                                onClick={() => router.push('/new-arrivals')}
                                className="hidden md:block flex-shrink-0 w-[240px] lg:w-[270px] self-stretch overflow-hidden relative cursor-pointer group/poster border border-border-line bg-surface-ivory transition-colors duration-300 min-h-[350px]"
                            >
                                {posterSlide ? (
                                    <img
                                        src={`${baseUrl}${posterSlide.image}`}
                                        alt="New Arrivals"
                                        className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-surface-dark" />
                                )}
                                <div className="absolute inset-0 bg-surface-dark/30 group-hover/poster:bg-surface-dark/45 transition-colors flex items-center justify-center">
                                    <button className="bg-surface text-on-surface text-[11px] font-semibold tracking-[0.12em] uppercase px-6 py-3 border border-on-surface hover:bg-surface-dark hover:text-surface transition-colors">
                                        View All
                                    </button>
                                </div>
                            </div>

                            {/* 2. Scrollable Product Cards on Right */}
                            <div className="relative flex-1 min-w-0">
                                {/* Left Scroll Button - Appears on hover outside cards on desktop */}
                                <button
                                    onClick={() => scrollProducts('left')}
                                    className="hidden md:flex absolute -left-5 lg:-left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 lg:w-12 lg:h-12 items-center justify-center bg-pure-white hover:bg-surface-dark hover:text-surface text-on-surface border border-border-line opacity-0 invisible group-hover/slider:opacity-100 group-hover/slider:visible transition-all duration-300"
                                    aria-label="Scroll left"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>

                                {/* Right Scroll Button - Appears on hover outside cards on desktop */}
                                <button
                                    onClick={() => scrollProducts('right')}
                                    className="hidden md:flex absolute -right-5 lg:-right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 lg:w-12 lg:h-12 items-center justify-center bg-pure-white hover:bg-surface-dark hover:text-surface text-on-surface border border-border-line opacity-0 invisible group-hover/slider:opacity-100 group-hover/slider:visible transition-all duration-300"
                                    aria-label="Scroll right"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>

                                {/* Product Cards Row */}
                                <div
                                    ref={scrollRef}
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
