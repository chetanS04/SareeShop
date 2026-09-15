"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Loader2, Check, Package } from "lucide-react";
import { fetchNewArrivalSliders, fetchNewArrivalProducts, NewArrivalSlider } from "../../../../utils/newArrivalApi";
import ProductCard from "@/components/(frontend)/ProductCard";
import { useProductSync, ProductEventData } from "@/context/ProductSyncContext";

const baseUrl = process.env.NEXT_PUBLIC_UPLOAD_BASE || "https://api.zelton.co.in";
const PAGE_SIZE = 10;

export default function NewArrivalsPage() {
  // Slider state
  const [sliders, setSliders] = useState<NewArrivalSlider[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidersLoading, setSlidersLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const [bannerTouchStart, setBannerTouchStart] = useState<number | null>(null);
  const [bannerTouchEnd, setBannerTouchEnd] = useState<number | null>(null);

  // Products pagination state
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isFetchingRef = useRef(false);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

  // Fetch Sliders on Mount
  useEffect(() => {
    fetchNewArrivalSliders()
      .then((data) => {
        const active = (data || []).filter(
          (s: any) =>
            s.status === true ||
            String(s.status) === "1" ||
            String(s.status) === "true"
        );
        setSliders(active);
      })
      .catch((err) => console.error("Failed to load new arrival sliders:", err))
      .finally(() => setSlidersLoading(false));
  }, []);

  // Fetch Products (Initial & Pagination)
  const loadProducts = async (pageNum: number = 1, isAppend: boolean = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isAppend) {
      setIsLoadingMore(true);
    } else {
      setIsLoadingInitial(true);
    }

    try {
      const res = await fetchNewArrivalProducts({
        page: pageNum,
        limit: PAGE_SIZE,
        per_page: PAGE_SIZE,
        paginate: true,
      });

      let list: any[] = [];
      let total = 0;
      let hasNext = false;

      if (res && res.data && Array.isArray(res.data)) {
        list = res.data;
        total = res.total ?? list.length;
        hasNext = Boolean(
          res.has_next_page ??
          res.hasNextPage ??
          res.has_more ??
          (res.last_page ? pageNum < res.last_page : list.length >= PAGE_SIZE)
        );
      } else if (Array.isArray(res)) {
        list = res;
        total = list.length;
        hasNext = false;
      }

      setHasNextPage(hasNext);
      setPage(pageNum);

      if (isAppend) {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newUnique = list.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newUnique];
        });
      } else {
        setProducts(list);
      }
    } catch (err) {
      console.error("Failed to load new arrival products:", err);
      if (!isAppend) setProducts([]);
      setHasNextPage(false);
    } finally {
      isFetchingRef.current = false;
      setIsLoadingInitial(false);
      setIsLoadingMore(false);
    }
  };

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

  // Initial Load
  useEffect(() => {
    loadProducts(1, false);
  }, []);

  // Next Page Load
  const loadNextPage = useCallback(() => {
    if (!hasNextPage || isLoadingMore || isLoadingInitial || isFetchingRef.current) return;
    loadProducts(page + 1, true);
  }, [hasNextPage, isLoadingMore, isLoadingInitial, page]);

  // Observer for Bottom Sentinel
  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          loadNextPage();
        }
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextPage]);

  // Slider Autoplay (No dots/arrows)
  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      if (!isPaused) {
        setCurrentSlide((p) => (p + 1) % (sliders.length || 1));
      }
    }, 5500);
  }, [sliders.length, isPaused]);

  useEffect(() => {
    if (sliders.length < 2) return;
    startAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [sliders.length, startAutoplay]);

  const prevSlide = () =>
    setCurrentSlide((curr) => (curr === 0 ? sliders.length - 1 : curr - 1));
  const nextSlide = () =>
    setCurrentSlide((curr) => (curr + 1) % (sliders.length || 1));

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* ── Edge-to-Edge Full-Width Banner Slider ── */}
      {slidersLoading ? (
        <div className="w-full aspect-[1791/563] bg-surface-ivory animate-pulse border-b border-border-line" />
      ) : sliders.length > 0 ? (
        <div
          className="relative w-full aspect-[1791/563] overflow-hidden group select-none bg-surface-ivory border-b border-border-line"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={(e) => {
            setBannerTouchEnd(null);
            setBannerTouchStart(e.targetTouches[0].clientX);
          }}
          onTouchMove={(e) => {
            setBannerTouchEnd(e.targetTouches[0].clientX);
          }}
          onTouchEnd={() => {
            if (!bannerTouchStart || !bannerTouchEnd) return;
            const dist = bannerTouchStart - bannerTouchEnd;
            if (dist > 45) {
              nextSlide();
            } else if (dist < -45) {
              prevSlide();
            }
          }}
        >
          {sliders.map((slide, idx) => {
            const isClickable = !!slide.link;
            const targetVal =
              slide.open_in_new_tab === true ||
                String(slide.open_in_new_tab) === "1" ||
                String(slide.open_in_new_tab) === "true"
                ? "_blank"
                : "_self";
            const isCurrent = idx === currentSlide;

            return (
              <div
                key={slide.id}
                className={`w-full h-full transition-opacity duration-500 ease-in-out ${isCurrent
                  ? "relative z-10 opacity-100 pointer-events-auto visible"
                  : "absolute top-0 left-0 right-0 bottom-0 z-0 opacity-0 pointer-events-none invisible"
                  }`}
              >
                {isClickable ? (
                  <a
                    href={slide.link}
                    target={targetVal}
                    rel="noopener noreferrer"
                    className="block w-full h-full cursor-pointer"
                  >
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
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-7 bg-gradient-to-t from-surface-dark/75 via-surface-dark/20 to-transparent pointer-events-none">
                    {slide.title && (
                      <p className="text-surface text-base sm:text-xl font-bold uppercase tracking-tight">
                        {slide.title}
                      </p>
                    )}
                    {slide.description && (
                      <p className="text-surface/80 text-xs sm:text-sm mt-1">
                        {slide.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Slide indicators */}
          {sliders.length > 1 && (
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-7 z-20 flex items-center gap-1.5">
              {sliders.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-[3px] transition-all duration-300 ${
                    i === currentSlide ? "w-6 bg-surface" : "w-2.5 bg-surface/50 hover:bg-surface/80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="max-w-site mx-auto site-pad pt-10 sm:pt-12 lg:pt-14 pb-16 lg:pb-20">
        {/* ── Masthead ── */}
        <nav className="label-caps text-body-slate mb-8 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-on-surface/30" aria-hidden="true">/</span>
          <span className="text-on-surface">New Arrivals</span>
        </nav>

        <header className="mb-8 sm:mb-10 lg:mb-12 max-w-3xl">
          <span className="label-caps text-primary block mb-3">Just Landed</span>
          <h1 className="display-section text-on-surface mb-4">New Arrivals</h1>
          <p className="text-[15px] sm:text-[16px] text-body-slate leading-relaxed max-w-xl">
            The latest handloom weaves to join the collection — fresh cuts, colours and drapes.
          </p>
          <div className="mt-6 h-px w-16 bg-primary" aria-hidden />
        </header>

        {/* ── Products Grid ── */}
        {isLoadingInitial && products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:gap-x-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-pure-white border border-border-line animate-pulse flex flex-col">
                <div className="aspect-[3/4] w-full bg-surface-ivory" />
                <div className="p-3 sm:p-4 flex flex-col gap-2">
                  <div className="h-2.5 bg-[rgba(14,14,13,0.08)] w-1/3" />
                  <div className="h-3.5 bg-[rgba(14,14,13,0.1)] w-3/4" />
                  <div className="h-4 bg-[rgba(14,14,13,0.12)] w-1/2 mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="border border-[rgba(14,14,13,0.12)] bg-pure-white px-8 py-16 text-center max-w-lg mx-auto">
            <Package className="w-12 h-12 text-on-surface/20 mx-auto mb-4" strokeWidth={1} />
            <span className="label-caps text-primary block mb-2">Nothing New Right Now</span>
            <h3 className="text-xl font-bold uppercase tracking-[-0.02em] text-on-surface mb-3">
              No new arrivals yet
            </h3>
            <p className="text-[14px] text-body-slate mb-7 leading-relaxed">
              Check back soon — new pieces are added regularly.
            </p>
            <Link href="/products" className="sv-btn-primary">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:gap-x-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} compact isNew />
            ))}
          </div>
        )}

        {/* Bottom Sentinel for Infinite Scroll */}
        <div ref={bottomSentinelRef} className="h-10 w-full pointer-events-none" />

        {/* Infinite Scroll Bottom Loading State */}
        {isLoadingMore && (
          <div className="flex items-center justify-center gap-2.5 py-8">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="label-caps text-body-slate">Loading more</span>
          </div>
        )}

        {/* All Products Loaded End Indicator */}
        {!hasNextPage && products.length > 0 && !isLoadingInitial && (
          <div className="mt-10 pt-6 border-t border-border-line flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 label-caps text-body-slate">
              <Check className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
              <span>All {products.length} new arrivals loaded</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
