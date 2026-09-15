"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import imgPlaceholder from "@/public/imagePlaceholder.png";
import axios from "../../../../../utils/axios";
import { ProductDetail, ProductVariant } from "@/common/interface";
import { ChevronDown, ChevronUp, Package, ShoppingCart, Plus, Minus, Heart, ShoppingBag, X, ChevronLeft, ChevronRight, Share2, MapPin, ShieldCheck, Check, Truck, RotateCcw, Banknote, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLike } from "@/context/LikeContext";
import { useProductSync, ProductEventData } from "@/context/ProductSyncContext";
import ProductReviews from "@/components/reviews/ProductReviews";
import ProductRatingDisplay from "@/components/ui/ProductRatingDisplay";
import { getSimilarProducts } from "../../../../../utils/similarProducts";
import { useLoader } from "@/context/LoaderContext";
import { calculateDiscount, getPricing, getProductGstRate } from "@/utils/pricing";
import ProductCard from "@/components/(frontend)/ProductCard";
import ProductDetailsSkeleton from "@/components/ui/ProductDetailsSkeleton";

import { getImageUrl } from "../../../../../utils/imageUtils";
import { getBrandSlug, getProductSlug } from "../../../../../utils/slugUtils";

const ServiceBenefitsStrip = ({
    variant,
    brand
}: {
    variant: ProductVariant | null;
    brand?: { name: string } | null;
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const isReturnable = variant
        ? ((variant as any).is_returnable !== undefined
            ? ((variant as any).is_returnable === true || (variant as any).is_returnable === 1 || String((variant as any).is_returnable) === '1' || String((variant as any).is_returnable) === 'true')
            : (variant as any).isReturnable !== undefined
            ? ((variant as any).isReturnable === true || (variant as any).isReturnable === 1 || String((variant as any).isReturnable) === '1' || String((variant as any).isReturnable) === 'true')
            : true)
        : false;

    const returnDays = Number(variant?.return_window_days ?? (variant as any)?.returnWindowDays ?? 7);

    const isCodAllowed = variant
        ? ((variant as any).is_cod_allowed !== undefined
            ? ((variant as any).is_cod_allowed === true || (variant as any).is_cod_allowed === 1 || String((variant as any).is_cod_allowed) === '1' || String((variant as any).is_cod_allowed) === 'true')
            : (variant as any).isCodAllowed !== undefined
            ? ((variant as any).isCodAllowed === true || (variant as any).isCodAllowed === 1 || String((variant as any).isCodAllowed) === '1' || String((variant as any).isCodAllowed) === 'true')
            : true)
        : false;

    const shippingCharges = Number(variant?.shipping_charges ?? (variant as any)?.shippingCharges ?? 0);
    const isFreeDelivery = shippingCharges === 0;

    const benefits: { id: string; title: string; icon: React.ReactNode }[] = [];
    const iconCls = "w-[22px] h-[22px] text-[#4A4742]";

    // 1. Return & Exchange (Strictly when isReturnable is true AND returnDays > 0)
    if (isReturnable && returnDays > 0) {
        benefits.push({
            id: 'return',
            title: `${returnDays} Day Return & Exchange`,
            icon: (
                <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12a8 8 0 0 1 14.93-4M20 12a8 8 0 0 1-14.93 4" />
                    <polyline points="19 8 19 4 15 4" />
                    <rect x="8" y="8.5" width="8" height="7" />
                    <line x1="8" y1="11" x2="16" y2="11" />
                </svg>
            ),
        });
    }

    // 2. Pay on Delivery
    if (isCodAllowed) {
        benefits.push({
            id: 'cod',
            title: 'Pay on Delivery',
            icon: (
                <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="16" height="10" />
                    <circle cx="10" cy="10" r="2.5" />
                    <path d="M6 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3" />
                </svg>
            ),
        });
    }

    // 3. Free Delivery
    if (isFreeDelivery) {
        benefits.push({
            id: 'free_delivery',
            title: 'Complimentary Delivery',
            icon: (
                <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="6" width="13" height="11" />
                    <polygon points="14 9 19 9 22 13 22 17 14 17 14 9" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="17.5" cy="18.5" r="2.5" />
                </svg>
            ),
        });
    }

    // 4. Brand Assured
    if (brand?.name) {
        benefits.push({
            id: 'brand',
            title: `${brand.name} Assured`,
            icon: (
                <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9H3.5a1.5 1.5 0 0 1-1.5-1.5V5h4" />
                    <path d="M18 9h2.5a1.5 1.5 0 0 0 1.5-1.5V5h-4" />
                    <path d="M4 5h16v4a6 6 0 0 1-12 0V5z" />
                    <path d="M12 15v4" />
                    <path d="M8 19h8" />
                    <polygon points="12 7.5 13 9.5 15.2 9.8 13.6 11.3 14 13.5 12 12.4 10 13.5 10.4 11.3 8.8 9.8 11 9.5 12 7.5" fill="#D19E3D" stroke="none" />
                </svg>
            ),
        });
    }

    // 5. Secure transaction
    benefits.push({
        id: 'secure',
        title: 'Secure Transaction',
        icon: (
            <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
        ),
    });

    const updateScrollButtons = useCallback(() => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 6);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }, []);

    useEffect(() => {
        updateScrollButtons();
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('scroll', updateScrollButtons, { passive: true });
            window.addEventListener('resize', updateScrollButtons);
        }
        return () => {
            if (el) el.removeEventListener('scroll', updateScrollButtons);
            window.removeEventListener('resize', updateScrollButtons);
        };
    }, [updateScrollButtons, benefits.length]);

    const handleScroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollOffset = direction === 'left' ? -200 : 200;
        scrollRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
        setTimeout(updateScrollButtons, 350);
    };

    if (benefits.length === 0) return null;

    return (
        <div className="relative border-y border-[#0E0E0D]/10 py-4 my-4">
            <div className="relative flex items-center">
                {/* Left Navigation Button */}
                {canScrollLeft && (
                    <button
                        type="button"
                        onClick={() => handleScroll('left')}
                        className="flex absolute -left-1 top-1/2 -translate-y-1/2 w-7 h-10 bg-[#FFF8F2] hover:bg-[#F1E5D2] border border-[#0E0E0D]/15 items-center justify-center text-[#4A4742] hover:text-[#0E0E0D] transition-colors z-20 cursor-pointer"
                        aria-label="Scroll benefits left"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}

                {/* Benefits List */}
                <div
                    ref={scrollRef}
                    className="flex items-start gap-5 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth w-full px-1 py-1 select-none"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {benefits.map((b) => (
                        <div
                            key={b.id}
                            className="flex flex-col items-center text-center flex-shrink-0 w-[84px] sm:w-[92px] cursor-default group select-none"
                        >
                            <div className="w-12 h-12 bg-[#FFFFFF] border border-[#0E0E0D]/12 flex items-center justify-center transition-colors duration-200 group-hover:border-[#8B1313]">
                                {b.icon}
                            </div>
                            <span className="label-caps text-[10px] sm:text-[10.5px] text-[#4A4742] leading-tight mt-2 min-h-[28px] line-clamp-2">
                                {b.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Right Navigation Button */}
                {canScrollRight && (
                    <button
                        type="button"
                        onClick={() => handleScroll('right')}
                        className="flex absolute -right-1 top-1/2 -translate-y-1/2 w-7 h-10 bg-[#FFF8F2] hover:bg-[#F1E5D2] border border-[#0E0E0D]/15 items-center justify-center text-[#4A4742] hover:text-[#0E0E0D] transition-colors z-20 cursor-pointer"
                        aria-label="Scroll benefits right"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

const ProductPage = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = (params?.slug || params?.id || "") as string;

    const paramVariantId = searchParams.get("variantId") || searchParams.get("variant");
    const paramSku = searchParams.get("sku");

    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [productNotFound, setProductNotFound] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: string }>({});
    const [isSpecsOpen, setIsSpecsOpen] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState<string>("");
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [zoomPanelPos, setZoomPanelPos] = useState({ top: 0, left: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [liveRatingSummary, setLiveRatingSummary] = useState<{
        average_rating: number;
        total_reviews: number;
        rating_distribution: { [key: number]: number };
    } | null>(null);
    const [isUpdatingRating, setIsUpdatingRating] = useState(false);
    const [similarProducts, setSimilarProducts] = useState<ProductDetail[]>([]);
    const [loadingSimilar, setLoadingSimilar] = useState(false);
    const [similarPagination, setSimilarPagination] = useState({
        current_page: 1,
        has_more: false,
        total: 0
    });
    const [mobileCarouselIndex, setMobileCarouselIndex] = useState(0);
    const [mobTouchStart, setMobTouchStart] = useState<number | null>(null);
    const [mobTouchEnd, setMobTouchEnd] = useState<number | null>(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const observerTargetRef = useRef<HTMLDivElement | null>(null);
    const isFetchingSimilarRef = useRef(false);

    // Track scroll position to show/hide scroll-to-top button
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 700) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        if (!isLightboxOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsLightboxOpen(false);
            } else if (e.key === "ArrowLeft") {
                setLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
            } else if (e.key === "ArrowRight") {
                setLightboxIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isLightboxOpen, galleryImages.length]);

    const { addToCart, loading: cartLoading } = useCart();
    const { user, openAuthModal } = useAuth();
    const { toggleLike, isLiked, likesLoading } = useLike();
    const { showLoader, hideLoader } = useLoader();
    const { subscribeToProduct } = useProductSync();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.zelton.co.in/api";
    const baseUrl = process.env.NEXT_PUBLIC_UPLOAD_BASE || "https://api.zelton.co.in";

    const resolveUrl = (path: string | null | undefined): string | null => {
        if (!path) return null;
        return getImageUrl(path) || (path.startsWith("http") ? path : `${baseUrl}${path}`);
    };

    const fetchLiveRatingSummary = async (showLoading = false) => {
        if (!id) return;
        try {
            if (showLoading) setIsUpdatingRating(true);
            const res = await axios.get(`/api/get-product/${id}`);
            if (res.data.res === "success" && res.data.product?.rating_summary) {
                setLiveRatingSummary(res.data.product.rating_summary);
            }
        } catch (error) {
            console.error("Error fetching live rating summary:", error);
        } finally {
            if (showLoading) {
                setTimeout(() => setIsUpdatingRating(false), 500);
            }
        }
    };

    const fetchProduct = useCallback(async (showLoadingSpinner = true) => {
        if (!id) return;
        if (showLoadingSpinner) {
            setPageLoading(true);
            setProductNotFound(false);
            showLoader();
        }
        try {
            const res = await axios.get(`/api/get-product/${id}`);
            if (res.data.res === "success" && res.data.product) {
                const rawProd = res.data.product;

                const mainImgUrl = rawProd.image_url || rawProd.imageUrl;
                const imgJsonRaw = rawProd.image_json || rawProd.imageJson;
                const featJsonRaw = rawProd.feature_json || rawProd.featureJson;
                const detJsonRaw = rawProd.detail_json || rawProd.detailJson;

                const activeVariants = (rawProd.variants || [])
                    .filter((v: any) => v.status === true || v.status === 1 || v.status === undefined)
                    .map((v: any) => {
                        const vImgUrl = v.image_url || v.imageUrl;
                        const vImgJson = v.image_json || v.imageJson;
                        const codRaw = v.is_cod_allowed !== undefined ? v.is_cod_allowed : v.isCodAllowed;
                        const retRaw = v.is_returnable !== undefined ? v.is_returnable : v.isReturnable;
                        const retDaysRaw = v.return_window_days !== undefined ? v.return_window_days : v.returnWindowDays;
                        const shipRaw = v.shipping_charges !== undefined ? v.shipping_charges : v.shippingCharges;

                        return {
                            ...v,
                            is_cod_allowed: codRaw !== undefined ? (codRaw === true || codRaw === 1 || String(codRaw) === '1' || String(codRaw) === 'true') : true,
                            isCodAllowed: codRaw !== undefined ? (codRaw === true || codRaw === 1 || String(codRaw) === '1' || String(codRaw) === 'true') : true,
                            is_returnable: retRaw !== undefined ? (retRaw === true || retRaw === 1 || String(retRaw) === '1' || String(retRaw) === 'true') : true,
                            isReturnable: retRaw !== undefined ? (retRaw === true || retRaw === 1 || String(retRaw) === '1' || String(retRaw) === 'true') : true,
                            return_window_days: retDaysRaw !== undefined && retDaysRaw !== null ? Number(retDaysRaw) : 7,
                            returnWindowDays: retDaysRaw !== undefined && retDaysRaw !== null ? Number(retDaysRaw) : 7,
                            shipping_charges: shipRaw !== undefined && shipRaw !== null ? Number(shipRaw) : 0,
                            shippingCharges: shipRaw !== undefined && shipRaw !== null ? Number(shipRaw) : 0,
                            image_url: resolveUrl(vImgUrl),
                            image_json: vImgJson ? (typeof vImgJson === "string" ? vImgJson : JSON.stringify(vImgJson)) : null,
                            attribute_values: v.attribute_values || v.attributeValues || [],
                        };
                    });

                if (activeVariants.length === 0) {
                    router.push("/products");
                    return;
                }

                const prod: ProductDetail = {
                    ...rawProd,
                    image_url: resolveUrl(mainImgUrl),
                    image_json: imgJsonRaw ? (typeof imgJsonRaw === "string" ? imgJsonRaw : JSON.stringify(imgJsonRaw)) : null,
                    feature_json: featJsonRaw ? (typeof featJsonRaw === "string" ? featJsonRaw : JSON.stringify(featJsonRaw)) : null,
                    detail_json: detJsonRaw ? (typeof detJsonRaw === "string" ? detJsonRaw : JSON.stringify(detJsonRaw)) : null,
                    item_attributes: rawProd.item_attributes || rawProd.itemAttributes || [],
                    product_attribute_values: rawProd.product_attribute_values || rawProd.productAttributeValues || [],
                    item_code: rawProd.item_code || rawProd.itemCode || null,
                    variants: activeVariants,
                };

                if (prod.brand?.image1) prod.brand.image1 = resolveUrl(prod.brand.image1) || undefined;
                if (prod.category?.image) prod.category.image = resolveUrl(prod.category.image) || undefined;

                // Select target variant from URL param (variantId or sku) if available, else retain current or first variant
                let targetVariant: ProductVariant | null = null;
                if (selectedVariant) {
                    targetVariant = activeVariants.find((v: any) => String(v.id) === String(selectedVariant.id)) || null;
                }
                if (!targetVariant && paramVariantId) {
                    targetVariant = activeVariants.find((v: any) => String(v.id) === String(paramVariantId)) || null;
                }
                if (!targetVariant && paramSku) {
                    targetVariant = activeVariants.find((v: any) => v.sku === paramSku) || null;
                }
                if (!targetVariant) {
                    targetVariant = activeVariants[0];
                }

                const productImages: string[] = prod.image_json
                    ? (typeof prod.image_json === "string" ? JSON.parse(prod.image_json) : prod.image_json)
                        .map((path: string) => resolveUrl(path))
                        .filter(Boolean) as string[]
                    : (prod.image_url ? [prod.image_url] : []);

                const variantImages: string[] = targetVariant?.image_json
                    ? (typeof targetVariant.image_json === "string" ? JSON.parse(targetVariant.image_json) : targetVariant.image_json)
                        .map((path: string) => resolveUrl(path))
                        .filter(Boolean) as string[]
                    : (targetVariant?.image_url ? [targetVariant.image_url] : []);

                const gallery = [
                    ...(productImages.length ? productImages : []),
                    ...(variantImages.length ? variantImages : []),
                ];

                setProduct(prod);
                setSelectedVariant(targetVariant || null);
                setMainImage(targetVariant?.image_url || productImages[0] || prod.image_url || imgPlaceholder.src);
                setGalleryImages(gallery.length ? gallery : [imgPlaceholder.src]);

                // Pre-select initial variant options based on targetVariant
                const initialOpts: { [key: number]: string } = {};
                if (targetVariant && targetVariant.attribute_values) {
                    targetVariant.attribute_values.forEach((av: any) => {
                        const attrId = Number(av.attribute_id || av.attributeId || av.attribute?.id);
                        if (attrId && av.value) {
                            initialOpts[attrId] = av.value;
                        }
                    });
                }
                setSelectedOptions(initialOpts);

                // Set initial rating summary
                if (prod.rating_summary) {
                    setLiveRatingSummary(prod.rating_summary);
                }

                // Fetch similar products (Page 1)
                fetchSimilarProducts(prod.id, 1, false);
            } else {
                setProductNotFound(true);
            }
        } catch (e) {
            console.error("Product not found or unavailable:", e);
            setProductNotFound(true);
        } finally {
            setPageLoading(false);
            if (showLoadingSpinner) hideLoader();
        }
    }, [id, paramVariantId, paramSku]);

    useEffect(() => {
        setPageLoading(true);
        setProductNotFound(false);
        fetchProduct(true);
    }, [id, paramVariantId, paramSku]);

    // Real-time synchronization for Product details page
    useEffect(() => {
        const prodIdentifier = product?.id ? Number(product.id) : id;
        if (!prodIdentifier) return;

        const unsubscribe = subscribeToProduct(prodIdentifier, (event: ProductEventData) => {
            console.log(`⚡ [ProductDetailsPage] Real-time event received for product (${prodIdentifier}):`, event.action);
            if (event.action === "deleted" || (event.action === "status_changed" && event.status === false)) {
                alert("This piece is no longer active or has been archived.");
                router.push("/products");
            } else if (event.action === "updated" || event.action === "status_changed" || event.action === "stock_updated") {
                fetchProduct(false);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [product?.id, id, subscribeToProduct, fetchProduct, router]);

    const fetchSimilarProducts = async (productId: number, pageNum: number = 1, isAppend: boolean = false) => {
        if (isFetchingSimilarRef.current) return;
        isFetchingSimilarRef.current = true;
        setLoadingSimilar(true);
        try {
            const response = await getSimilarProducts(productId, pageNum, 10);
            const rawList = response.products || [];
            const processedProducts = rawList.map((prod: ProductDetail) => ({
                ...prod,
                image_url: prod.image_url ? (prod.image_url.startsWith('http') ? prod.image_url : `${baseUrl}${prod.image_url}`) : null,
                variants: prod.variants?.map((v: ProductVariant) => ({
                    ...v,
                    image_url: v.image_url ? (v.image_url.startsWith('http') ? v.image_url : `${baseUrl}${v.image_url}`) : null,
                })) || [],
            }));

            if (isAppend) {
                setSimilarProducts((prev) => {
                    const existingIds = new Set(prev.map((p) => p.id));
                    const newUnique = processedProducts.filter((p) => !existingIds.has(p.id));
                    return [...prev, ...newUnique];
                });
            } else {
                setSimilarProducts(processedProducts);
            }

            setSimilarPagination(response.pagination);
        } catch (error) {
            console.error('Error fetching similar products:', error);
            if (!isAppend) setSimilarProducts([]);
        } finally {
            isFetchingSimilarRef.current = false;
            setLoadingSimilar(false);
        }
    };

    const loadNextSimilarPage = useCallback(() => {
        if (!similarPagination.has_more || loadingSimilar || isFetchingSimilarRef.current || !product) return;
        fetchSimilarProducts(product.id, similarPagination.current_page + 1, true);
    }, [similarPagination.has_more, similarPagination.current_page, loadingSimilar, product]);

    // Automatic infinite scroll on scroll down
    useEffect(() => {
        const target = observerTargetRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadNextSimilarPage();
                }
            },
            { threshold: 0.1, rootMargin: '300px' }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [loadNextSimilarPage]);

    useEffect(() => {
        if (!product || !selectedVariant) return;

        const variantImages: string[] =
            selectedVariant.image_json
                ? (typeof selectedVariant.image_json === "string" ? JSON.parse(selectedVariant.image_json) : selectedVariant.image_json)
                    .map((path: string) => resolveUrl(path))
                    .filter(Boolean) as string[]
                : (selectedVariant.image_url ? [selectedVariant.image_url] : []);

        const productImages: string[] =
            product.image_json
                ? (typeof product.image_json === "string" ? JSON.parse(product.image_json) : product.image_json)
                    .map((path: string) => resolveUrl(path))
                    .filter(Boolean) as string[]
                : (product.image_url ? [product.image_url] : []);

        const gallery = [...productImages, ...variantImages];

        setGalleryImages(gallery.length ? gallery : [imgPlaceholder.src]);
        setMainImage(selectedVariant.image_url || gallery[0] || imgPlaceholder.src);
    }, [selectedVariant, product]);

    useEffect(() => {
        if (!product) return;
        const matched = (product.variants || []).find((v) => {
            if (!v.attribute_values) return false;
            return (product.item_attributes || []).every((ia: any) => {
                const attrId = Number(ia.attribute_id ?? ia.attributeId ?? ia.attribute?.id);
                const selectedVal = selectedOptions[attrId];
                return (
                    !selectedVal ||
                    (v.attribute_values || []).some((av: any) => {
                        const aId = Number(av?.attribute_id ?? av?.attributeId ?? av?.attribute?.id);
                        return aId === attrId && av.value === selectedVal;
                    }) || false
                );
            });
        });

        if (matched) setSelectedVariant(matched);
    }, [selectedOptions, product]);

    // Reset "Go to Cart" button to "Add to Cart" immediately whenever variant or attribute options change
    useEffect(() => {
        setIsInCart(false);
    }, [selectedOptions, selectedVariant?.id]);

    // Auto-revert "Go to Cart" button back to "Add to Cart" after 3.5 seconds
    useEffect(() => {
        if (!isInCart) return;
        const timer = setTimeout(() => {
            setIsInCart(false);
        }, 3500);
        return () => clearTimeout(timer);
    }, [isInCart]);

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
                setToastMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    useEffect(() => {
        if (!id) return;

        const interval = setInterval(() => {
            fetchLiveRatingSummary();
        }, 30000);

        const handleFocus = () => {
            fetchLiveRatingSummary();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, [id]);

    useEffect(() => {
        const handleRatingUpdate = () => {
            fetchLiveRatingSummary();
        };

        window.addEventListener('reviewUpdated', handleRatingUpdate);
        window.addEventListener('reviewSubmitted', handleRatingUpdate);
        window.addEventListener('reviewDeleted', handleRatingUpdate);

        return () => {
            window.removeEventListener('reviewUpdated', handleRatingUpdate);
            window.removeEventListener('reviewSubmitted', handleRatingUpdate);
            window.removeEventListener('reviewDeleted', handleRatingUpdate);
        };
    }, []);

    const handleAddToCart = async () => {
        if (!user) {
            openAuthModal('login');
            return;
        }

        if (!selectedVariant) {
            alert('Please select all required drape options');
            return;
        }

        if (selectedVariant.stock < quantity) {
            alert(`Only ${selectedVariant.stock} items available in this edition`);
            return;
        }

        setAddingToCart(true);

        const success = await addToCart(
            product!.id,
            Number(selectedVariant.id),
            quantity,
            selectedOptions
        );

        if (success) {
            setToastMessage('Piece reserved in your atelier bag!');
            setShowToast(true);
            setIsInCart(true);
        }

        setAddingToCart(false);
    };

    const handleViewCart = () => {
        router.push('/cart');
    };

    const increaseQuantity = () => {
        if (selectedVariant && quantity < selectedVariant.stock) {
            setQuantity(prev => prev + 1);
            setIsInCart(false);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
            setIsInCart(false);
        }
    };

    const handleLike = async () => {
        if (!user) {
            openAuthModal('login');
            return;
        }

        if (!product) return;

        const success = await toggleLike(product.id);
        if (success) {
            const message = isLiked(product.id)
                ? 'Removed from wishlist!'
                : 'Added to your wishlist!';
            setToastMessage(message);
            setShowToast(true);
        }
    };

    const handleShare = () => {
        if (typeof window !== "undefined") {
            if (navigator.share) {
                navigator.share({
                    title: product?.name || "SVastra Collection",
                    url: window.location.href,
                }).catch(() => { });
            } else {
                navigator.clipboard.writeText(window.location.href);
                setToastMessage("Piece link copied to clipboard!");
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        }
    };

    const getEstimatedDeliveryDate = () => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x, y });
        setZoomPanelPos({
            top: rect.top,
            left: rect.right + 20,
        });
    };

    const formatSpecificationKey = (key: string): string => {
        if (!key) return '';
        return key
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[_-]/g, ' ')
            .replace(/\s+/g, ' ')
            .split(' ')
            .filter(Boolean)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .trim();
    };

    if (pageLoading && !product) {
        return <ProductDetailsSkeleton />;
    }

    if (productNotFound || !product) {
        return (
            <div className="min-h-screen bg-[#FFF8F2]">
                <div className="max-w-site mx-auto site-pad py-24">
                    <div className="text-center">
                        <div className="w-16 h-16 text-[#4A4742] mx-auto mb-6">
                            <Package className="w-full h-full" strokeWidth={1} />
                        </div>
                        <p className="label-caps text-[11px] text-[#8B1313] mb-3">Not Found</p>
                        <h1 className="display-section text-[#0E0E0D] mb-3">This Piece Isn&apos;t Available</h1>
                        <p className="text-[15px] text-[#4A4742] mb-8">The product you&apos;re looking for doesn&apos;t exist or has been retired from the collection.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="sv-btn-primary"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const featRaw = product.feature_json || (product as any).featureJson;
    const detRaw = product.detail_json || (product as any).detailJson;

    const features: string[] = featRaw
        ? (typeof featRaw === 'string' ? JSON.parse(featRaw) : featRaw)
        : [];
    const details: { key: string; value: string }[] = detRaw
        ? (typeof detRaw === 'string' ? JSON.parse(detRaw) : detRaw)
        : [];

    const attributeOptions: Record<number, string[]> = {};
    (product.item_attributes || []).forEach((ia: any) => {
        const attrId = Number(ia.attribute_id ?? ia.attributeId ?? ia.attribute?.id);
        const values = new Set<string>();
        (product.variants || []).forEach((variant) => {
            (variant.attribute_values || []).forEach((av: any) => {
                const aId = Number(av?.attribute_id ?? av?.attributeId ?? av?.attribute?.id);
                if (aId === attrId && av?.value) values.add(av.value);
            });
        });
        if (attrId) {
            attributeOptions[attrId] = Array.from(values);
        }
    });
    const productGstRate = getProductGstRate(product);

    const variantPricing = selectedVariant
        ? getPricing(selectedVariant.mrp, (selectedVariant as any).baseSp ?? selectedVariant.sp, productGstRate)
        : null;

    const discountPct = variantPricing ? variantPricing.discountPct : 0;

    // Handler for hierarchical option selection
    const handleOptionClick = (attrIndex: number, clickedAttrId: number, val: string) => {
        if (!product) return;
        const itemAttrs = product.item_attributes || [];

        // If clicking the First Attribute (e.g. Color / Fabric)
        if (attrIndex === 0) {
            const nextOptions: Record<number, string> = { [clickedAttrId]: val };

            const variantsWithVal = (product.variants || []).filter((v) => {
                return (v.attribute_values || []).some((av: any) => {
                    const aId = Number(av?.attribute_id ?? av?.attributeId ?? av?.attribute?.id);
                    return aId === clickedAttrId && av.value === val;
                });
            });

            let targetVariant = variantsWithVal.find((v) => {
                if ((v.stock ?? 0) <= 0) return false;
                return itemAttrs.slice(1).every((ia: any) => {
                    const subAttrId = Number(ia.attribute_id ?? ia.attributeId ?? ia.attribute?.id);
                    const currentVal = selectedOptions[subAttrId];
                    if (!currentVal) return true;
                    return (v.attribute_values || []).some((av: any) => {
                        const aId = Number(av?.attribute_id ?? av?.attributeId ?? av?.attribute?.id);
                        return aId === subAttrId && av.value === currentVal;
                    });
                });
            });

            if (!targetVariant) {
                targetVariant = variantsWithVal.find((v) => (v.stock ?? 0) > 0) || variantsWithVal[0];
            }

            if (targetVariant && targetVariant.attribute_values) {
                targetVariant.attribute_values.forEach((av: any) => {
                    const aId = Number(av?.attribute_id ?? av?.attributeId ?? av?.attribute?.id);
                    if (aId && av.value) {
                        nextOptions[aId] = av.value;
                    }
                });
                setSelectedVariant(targetVariant);
            }

            setSelectedOptions(nextOptions);
            return;
        }

        // If clicking a Subsequent Attribute (e.g. Blouse Size, Length)
        const nextOptions: Record<number, string> = { ...selectedOptions, [clickedAttrId]: val };

        const matched = (product.variants || []).find((v) => {
            if (!v.attribute_values) return false;
            return itemAttrs.every((ia: any) => {
                const aId = Number(ia.attribute_id ?? ia.attributeId ?? ia.attribute?.id);
                const chosenVal = nextOptions[aId];
                if (!chosenVal) return true;
                return (v.attribute_values || []).some((av: any) => {
                    const avId = Number(av?.attribute_id ?? av?.attributeId ?? av?.attribute?.id);
                    return avId === aId && av.value === chosenVal;
                });
            });
        });

        if (matched) {
            setSelectedVariant(matched);
        }
        setSelectedOptions(nextOptions);
    };

    const findAttrValMeta = (attrId: number, val: string) => {
        for (const v of product.variants || []) {
            for (const av of (v.attribute_values || (v as any).attributeValues || [])) {
                const aId = Number(av?.attribute_id ?? (av as any)?.attributeId ?? (av as any)?.attribute?.id);
                if (aId === attrId && av?.value === val) {
                    return av;
                }
            }
        }
        
        for (const pav of (product.product_attribute_values || (product as any).productAttributeValues || [])) {
            const aId = Number(pav?.attribute_id ?? (pav as any)?.attributeId ?? (pav as any)?.attribute?.id);
            const avObj = pav?.attribute_value || (pav as any)?.attributeValue;
            if (aId === attrId && avObj?.value === val) {
                return avObj;
            }
        }
        return null;
    };

    // Shared architectural variant selector block
    const renderVariantSelectors = () => (
        (product.item_attributes || []).length > 0 && (
            <div className="space-y-4 pt-1">
                {(product.item_attributes || []).map((ia: any, attrIndex: number) => {
                    const attrId = Number(ia.attribute_id ?? ia.attributeId ?? ia.attribute?.id);
                    const isFirstAttr = attrIndex === 0;

                    const isImageSwatch = Boolean(
                        ia.has_images ||
                        ia.hasImages ||
                        attributeOptions[attrId]?.some((val) => {
                            const av = findAttrValMeta(attrId, val);
                            return (av?.show_image || av?.showImage) && Boolean(av?.image);
                        })
                    );

                    return (
                        <div key={attrId}>
                            <p className="label-caps text-[11px] text-[#4A4742] mb-2.5">
                                {ia.attribute?.name}:{' '}
                                <span className="text-[#0E0E0D] font-semibold normal-case tracking-normal">{selectedOptions[attrId] || '—'}</span>
                            </p>
                            <div className="flex flex-wrap gap-2.5">
                                {attributeOptions[attrId]?.map((val) => {
                                    let isAvailable = false;

                                    if (isFirstAttr) {
                                        isAvailable = (product.variants || []).some((variant) => {
                                            if (!variant.attribute_values) return false;
                                            const hasColorVal = (variant.attribute_values || []).some((av: any) => {
                                                const aId = Number(av?.attribute_id ?? av?.attributeId ?? av?.attribute?.id);
                                                return aId === attrId && av.value === val;
                                            });
                                            return hasColorVal && (variant.stock ?? 0) > 0;
                                        });
                                    } else {
                                        isAvailable = (product.variants || []).some((variant) => {
                                            if (!variant.attribute_values) return false;
                                            const matchesPreceding = (product.item_attributes || [])
                                                .slice(0, attrIndex)
                                                .every((prevIa: any) => {
                                                    const prevAttrId = Number(prevIa.attribute_id ?? prevIa.attributeId ?? prevIa.attribute?.id);
                                                    const prevVal = selectedOptions[prevAttrId];
                                                    if (!prevVal) return true;
                                                    return (variant.attribute_values || []).some((av: any) => {
                                                        const aId = Number(av?.attribute_id ?? av?.attributeId ?? av?.attribute?.id);
                                                        return aId === prevAttrId && av.value === prevVal;
                                                    });
                                                });

                                            const hasCurrentVal = (variant.attribute_values || []).some((av: any) => {
                                                const aId = Number(av?.attribute_id ?? av?.attributeId ?? av?.attribute?.id);
                                                return aId === attrId && av.value === val;
                                            });

                                            return matchesPreceding && hasCurrentVal && (variant.stock ?? 0) > 0;
                                        });
                                    }

                                    const isSelected = selectedOptions[attrId] === val;
                                    const isDisabled = !isAvailable;

                                    const avMeta = findAttrValMeta(attrId, val);
                                    const isValShowImage = Boolean(avMeta?.show_image || (avMeta as any)?.showImage);
                                    const rawImg = isValShowImage ? (avMeta?.image || null) : null;

                                    let matchingVariant: any = null;
                                    if (isFirstAttr) {
                                        matchingVariant = (product.variants || []).find((v) => {
                                            const hasColorVal = (v.attribute_values || []).some((av: any) => {
                                                const aId = Number(av?.attribute_id ?? (av as any)?.attributeId ?? (av as any)?.attribute?.id);
                                                return aId === attrId && av.value === val;
                                            });
                                            if (!hasColorVal) return false;
                                            return (product.item_attributes || []).slice(1).every((subIa: any) => {
                                                const subAId = Number(subIa.attribute_id ?? (subIa as any)?.attributeId ?? (subIa as any)?.attribute?.id);
                                                const curSubVal = selectedOptions[subAId];
                                                if (!curSubVal) return true;
                                                return (v.attribute_values || []).some((av: any) => {
                                                    const aId = Number(av?.attribute_id ?? (av as any)?.attributeId ?? (av as any)?.attribute?.id);
                                                    return aId === subAId && av.value === curSubVal;
                                                });
                                            });
                                        }) || (product.variants || []).find((v) => {
                                            return (v.attribute_values || []).some((av: any) => {
                                                const aId = Number(av?.attribute_id ?? (av as any)?.attributeId ?? (av as any)?.attribute?.id);
                                                return aId === attrId && av.value === val;
                                            });
                                        });
                                    } else {
                                        matchingVariant = (product.variants || []).find((v) => {
                                            if (!v.attribute_values) return false;
                                            const matchesPreceding = (product.item_attributes || [])
                                                .slice(0, attrIndex)
                                                .every((prevIa: any) => {
                                                    const prevAttrId = Number(prevIa.attribute_id ?? (prevIa as any)?.attributeId ?? (prevIa as any)?.attribute?.id);
                                                    const prevVal = selectedOptions[prevAttrId];
                                                    if (!prevVal) return true;
                                                    return (v.attribute_values || []).some((av: any) => {
                                                        const aId = Number(av?.attribute_id ?? (av as any)?.attributeId ?? (av as any)?.attribute?.id);
                                                        return aId === prevAttrId && av.value === prevVal;
                                                    });
                                                });
                                            const hasCurrentVal = (v.attribute_values || []).some((av: any) => {
                                                const aId = Number(av?.attribute_id ?? (av as any)?.attributeId ?? (av as any)?.attribute?.id);
                                                return aId === attrId && av.value === val;
                                            });
                                            return matchesPreceding && hasCurrentVal;
                                        });
                                    }

                                    const swatchImg = isValShowImage
                                        ? (resolveUrl(rawImg) || ((ia.has_images || (ia as any).hasImages) && matchingVariant?.image_url ? resolveUrl(matchingVariant.image_url) : null))
                                        : null;

                                    const optionPricing = matchingVariant
                                        ? getPricing(matchingVariant.mrp, (matchingVariant as any).baseSp ?? matchingVariant.sp, productGstRate)
                                        : null;

                                    if (isImageSwatch) {
                                        return (
                                            <button
                                                key={val}
                                                type="button"
                                                aria-disabled={isDisabled}
                                                onClick={() => {
                                                    if (isDisabled) return;
                                                    handleOptionClick(attrIndex, attrId, val);
                                                }}
                                                title={isDisabled ? `${val} (Archived / Unavailable)` : `${val}${optionPricing ? ` - ₹${Math.round(optionPricing.sp).toLocaleString('en-IN')}` : ''}`}
                                                style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                                                className={`group relative flex flex-col items-center justify-between border transition-colors duration-150 select-none overflow-hidden bg-white w-[74px] sm:w-[82px] p-1 ${
                                                    isSelected
                                                        ? 'border-2 border-[#8B1313]'
                                                        : isDisabled
                                                        ? 'border-dashed border-[#0E0E0D]/15 bg-[#F9F3EB] opacity-60 !cursor-not-allowed hover:border-[#0E0E0D]/15'
                                                        : 'border-[#0E0E0D]/15 hover:border-[#0E0E0D]'
                                                }`}
                                            >
                                                {/* Swatch Image or Text Thumbnail Container */}
                                                <div className="w-full h-16 sm:h-[68px] flex items-center justify-center overflow-hidden bg-white p-0.5">
                                                    {swatchImg ? (
                                                        <img
                                                            src={swatchImg}
                                                            alt={val}
                                                            className={`w-full h-full object-cover transition-transform duration-200 ${
                                                                isDisabled ? 'opacity-40 grayscale' : 'group-hover:scale-105'
                                                            }`}
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-[#F9F3EB] text-[11px] font-semibold text-[#4A4742] border border-[#0E0E0D]/10 px-1 text-center">
                                                            {val}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Bottom Price or Label Bar */}
                                                <div className="w-full pt-1 pb-0.5 px-0.5 text-center border-t border-[#0E0E0D]/10">
                                                    {optionPricing ? (
                                                        <div className="flex flex-col items-center justify-center leading-none">
                                                            <span className={`text-[11px] font-bold ${isSelected ? 'text-[#8B1313]' : 'text-[#0E0E0D]'} leading-tight`}>
                                                                ₹{Math.round(optionPricing.sp).toLocaleString('en-IN')}
                                                            </span>
                                                            {optionPricing.mrp > optionPricing.sp && (
                                                                <span className="text-[9px] text-[#4A4742]/60 line-through leading-none mt-0.5">
                                                                    ₹{Math.round(optionPricing.mrp).toLocaleString('en-IN')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-medium text-[#4A4742] truncate block max-w-full">
                                                            {val}
                                                        </span>
                                                    )}
                                                </div>

                                                {isDisabled && (
                                                    <svg
                                                        className="absolute inset-0 w-full h-full pointer-events-none text-[#8B1313]/60"
                                                        preserveAspectRatio="none"
                                                        viewBox="0 0 100 100"
                                                    >
                                                        <line
                                                            x1="0"
                                                            y1="100"
                                                            x2="100"
                                                            y2="0"
                                                            stroke="currentColor"
                                                            strokeWidth="2.5"
                                                            strokeDasharray="4 2"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        );
                                    }

                                    return (
                                        <button
                                            key={val}
                                            type="button"
                                            aria-disabled={isDisabled}
                                            onClick={() => {
                                                if (isDisabled) return;
                                                handleOptionClick(attrIndex, attrId, val);
                                            }}
                                            title={isDisabled ? `${val} (Archived / Unavailable)` : val}
                                            style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                                            className={`relative overflow-hidden px-4 py-2 border text-[13px] font-medium tracking-[0.02em] transition-colors duration-150 select-none ${isSelected
                                                ? 'border-2 border-[#8B1313] bg-[#F1E5D2] text-[#8B1313] font-semibold cursor-pointer'
                                                : isDisabled
                                                ? 'border-[#0E0E0D]/12 bg-[#F9F3EB] text-[#4A4742]/40 !cursor-not-allowed border-dashed hover:border-[#0E0E0D]/12'
                                                : 'border-[#0E0E0D]/15 bg-white text-[#0E0E0D] hover:border-[#8B1313] hover:text-[#8B1313] cursor-pointer'
                                                }`}
                                        >
                                            <span className={isDisabled ? 'opacity-40 pointer-events-none' : ''}>{val}</span>

                                            {isDisabled && (
                                                <svg
                                                    className="absolute inset-0 w-full h-full pointer-events-none text-[#8B1313]/60"
                                                    preserveAspectRatio="none"
                                                    viewBox="0 0 100 100"
                                                >
                                                    <line
                                                        x1="0"
                                                        y1="100"
                                                        x2="100"
                                                        y2="0"
                                                        stroke="currentColor"
                                                        strokeWidth="2.5"
                                                        strokeDasharray="4 2"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        )
    );

    // Shared SVastra action buttons — compact, matched heights
    const renderActionButtons = (fullWidth = false) => (
        selectedVariant && (
            <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
                <button
                    onClick={() => {
                        if (!user) { openAuthModal('login'); return; }
                        if (selectedVariant && selectedVariant.stock > 0)
                            router.push(`/checkout/single?productId=${product!.id}&variantId=${selectedVariant.id}&quantity=${quantity}`);
                    }}
                    disabled={selectedVariant.stock === 0}
                    className="sv-btn-primary w-full !min-h-[42px] !py-2.5 !px-3 !text-[11px] !gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {!user ? 'Login to Order' : selectedVariant.stock === 0 ? 'Archived' : (
                        <>
                            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                            <span>Instant Checkout</span>
                        </>
                    )}
                </button>

                <button
                    onClick={isInCart ? handleViewCart : handleAddToCart}
                    disabled={selectedVariant.stock === 0 || addingToCart || cartLoading}
                    className="sv-btn-outline w-full !min-h-[42px] !py-2.5 !px-3 !text-[11px] !gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {addingToCart || cartLoading ? (
                        <><div className="w-3.5 h-3.5 border-2 border-on-surface/30 border-t-on-surface rounded-full animate-spin" />Adding…</>
                    ) : isInCart ? (
                        <><ShoppingCart className="w-3.5 h-3.5 shrink-0" />Go to Bag</>
                    ) : selectedVariant.stock > 0 ? (
                        <><ShoppingCart className="w-3.5 h-3.5 shrink-0" />Add to Bag</>
                    ) : 'Out of Stock'}
                </button>
            </div>
        )
    );

    const renderPrice = (large = false) => (
        selectedVariant && variantPricing && (
            <div>
                <div className={`flex items-baseline gap-2.5 flex-wrap ${large ? 'mb-1' : ''}`}>
                    <span className={`font-semibold text-[#0E0E0D] tracking-tight ${large ? 'text-[2rem] leading-none' : 'text-2xl'}`}>
                        <span className={`align-top font-normal ${large ? 'text-base leading-7' : 'text-sm leading-6'}`}>₹</span>
                        {Math.round(variantPricing.sp).toLocaleString('en-IN')}
                    </span>
                    {variantPricing.mrp > variantPricing.sp && (
                        <span className="text-[13px] text-[#4A4742]">M.R.P. <span className="line-through">₹{Math.round(Number(variantPricing.mrp)).toLocaleString('en-IN')}</span></span>
                    )}
                    {variantPricing.hasDiscount && (
                        <span className="label-caps text-[10px] text-[#8B1313] border border-[#8B1313] px-1.5 py-0.5">
                            {variantPricing.discountPct}% Off
                        </span>
                    )}
                </div>
                {variantPricing.hasDiscount && large && (
                    <p className="text-[13px] text-[#4A4742] mt-1">You save ₹{Math.round(variantPricing.savingsAmount).toLocaleString('en-IN')} ({variantPricing.discountPct}%)</p>
                )}
                <p className="label-caps text-[10px] text-[#4A4742] mt-1.5">
                    Inclusive of all taxes
                </p>
            </div>
        )
    );



    // helper: shared specs table
    const renderSpecs = () => (
        details.length > 0 && (
            <div className="border-t border-[#0E0E0D]/12 w-full">
                <button
                    type="button"
                    onClick={() => setIsSpecsOpen(!isSpecsOpen)}
                    className="w-full flex items-center justify-between py-4 bg-transparent transition-colors text-left select-none cursor-pointer border-b border-[#0E0E0D]/12"
                >
                    <h2 className="display-section !text-lg sm:!text-xl text-[#0E0E0D]">
                        Details &amp; Craft
                    </h2>
                    <ChevronDown className={`w-5 h-5 text-[#0E0E0D] transition-transform duration-300 ${isSpecsOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${isSpecsOpen ? 'max-h-[3000px] opacity-100 py-3' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <table className="w-full text-xs sm:text-sm text-left border-collapse">
                        <tbody>
                            {details.map((d: any, idx: number) => (
                                <tr key={idx} className="border-b border-[#0E0E0D]/10">
                                    <td className="py-3 sm:py-3.5 pr-4 label-caps text-[10.5px] !tracking-[0.06em] text-[#4A4742] w-[38%] sm:w-[35%] align-top leading-relaxed">
                                        {formatSpecificationKey(d.key)}
                                    </td>
                                    <td className="py-3 sm:py-3.5 pl-2 text-[#0E0E0D] w-[62%] sm:w-[65%] align-top leading-relaxed font-normal">
                                        {d.value}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    );

    // Quantity selector
    const renderQuantity = () => (
        selectedVariant && selectedVariant.stock > 0 && (
            <div className="flex items-center gap-3">
                <span className="label-caps text-[11px] text-[#4A4742]">Qty</span>
                <div className="flex items-center border border-[#0E0E0D]/20">
                    <button onClick={decreaseQuantity} disabled={quantity <= 1}
                        className="px-3 py-2 text-[#4A4742] hover:bg-[#F1E5D2] disabled:opacity-40 transition-colors">
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-4 py-2 text-sm font-semibold border-x border-[#0E0E0D]/20 min-w-[44px] text-center">{quantity}</span>
                    <button onClick={increaseQuantity} disabled={quantity >= selectedVariant.stock}
                        className="px-3 py-2 text-[#4A4742] hover:bg-[#F1E5D2] disabled:opacity-40 transition-colors">
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>
        )
    );

    // Stock indicator badge
    const renderStock = () => (
        selectedVariant && (
            <p className={`label-caps text-[11px] flex items-center gap-1.5 ${selectedVariant.stock > 0 ? 'text-[#4A4742]' : 'text-[#8B1313]'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selectedVariant.stock > 0 ? 'bg-[#D19E3D]' : 'bg-[#8B1313]'}`} />
                {selectedVariant.stock > 0
                    ? selectedVariant.stock <= 5 ? `Only ${selectedVariant.stock} Left` : 'In Stock'
                    : 'Currently Unavailable'}
            </p>
        )
    );

    return (
        <div className="w-full bg-[#FFF8F2] min-h-screen">
            {/* Toast */}
            {showToast && toastMessage && (
                <div className="fixed top-6 right-6 z-[99999] px-6 py-4 label-caps text-[11px] bg-[#0E0E0D] text-[#FFF8F2] border border-[#0E0E0D]">
                    {toastMessage}
                </div>
            )}

            {/* Desktop Zoom panel */}
            {isHovering && (
                <div
                    className="hidden xl:block fixed w-[500px] h-[560px] border border-[#0E0E0D]/20 overflow-hidden bg-white pointer-events-none"
                    style={{ top: zoomPanelPos.top, left: zoomPanelPos.left, zIndex: 99998 }}
                >
                    <div
                        className="relative w-[400%] h-[400%]"
                        style={{ transform: `translate(-${Math.max(0, Math.min(76, zoomPosition.x - 14))}%, -${Math.max(0, Math.min(76, zoomPosition.y - 14))}%)` }}
                    >
                        <Image
                            src={mainImage || imgPlaceholder.src}
                            alt={`${product?.name ?? ''} – High Resolution Detail`}
                            fill
                            className="object-cover"
                            quality={100}
                            unoptimized
                        />
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════
                MOBILE LAYOUT (SVastra Editorial - Visible on <lg)
            ══════════════════════════════════════════════════════ */}
            <div className="lg:hidden">
                {/* 1. Brand & Title Header */}
                <div className="px-4 sm:px-6 pt-5 pb-4 bg-surface border-b border-border-line">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        {product.brand ? (
                            <Link
                                href={`/brands/${getBrandSlug(product.brand)}`}
                                className="label-caps text-primary hover:text-on-surface transition-colors"
                            >
                                {product.brand.name} · Atelier Edit
                            </Link>
                        ) : (
                            <span className="label-caps text-primary">SVastra Curated</span>
                        )}

                        {/* Live Rating Header */}
                        {(((liveRatingSummary || product.rating_summary)?.total_reviews || 0) > 0 && ((liveRatingSummary || product.rating_summary)?.average_rating || 0) > 0) && (
                            <div
                                className="flex items-center gap-1.5 cursor-pointer bg-surface-ivory px-2 py-1 border border-border-line"
                                onClick={() => router.push(`/products/${product?.slug || getProductSlug(product) || id}/reviews`)}
                            >
                                <div className="flex text-[#D19E3D] text-xs tracking-tight">
                                    {'★'.repeat(Math.round((liveRatingSummary || product.rating_summary)?.average_rating || 0))}
                                    {'☆'.repeat(5 - Math.round((liveRatingSummary || product.rating_summary)?.average_rating || 0))}
                                </div>
                                <span className="text-xs text-[#4A4742] font-semibold">
                                    {(liveRatingSummary || product.rating_summary)?.total_reviews}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Product Title */}
                    <h1 className="text-lg font-semibold text-[#0E0E0D] leading-snug tracking-[-0.01em]">
                        {product.name}
                    </h1>

                    {/* Social Proof / Bought tag */}
                    {(() => {
                        const sold = Number((product as any)?.sales_count || 0);
                        if (sold < 11) return null;
                        return (
                            <p className="label-caps text-[10px] text-[#4A4742] mt-1.5">
                                {sold}+ bought in past month
                            </p>
                        );
                    })()}
                </div>

                {/* 2. Image Carousel */}
                <div
                    className="relative w-full bg-[#F1E5D2] select-none border-b border-[#0E0E0D]/10"
                    onTouchStart={(e) => {
                        setMobTouchEnd(null);
                        setMobTouchStart(e.targetTouches[0].clientX);
                    }}
                    onTouchMove={(e) => {
                        setMobTouchEnd(e.targetTouches[0].clientX);
                    }}
                    onTouchEnd={() => {
                        if (!mobTouchStart || !mobTouchEnd) return;
                        const dist = mobTouchStart - mobTouchEnd;
                        if (dist > 40 && mobileCarouselIndex < galleryImages.length - 1) {
                            setMobileCarouselIndex(i => i + 1);
                        } else if (dist < -40 && mobileCarouselIndex > 0) {
                            setMobileCarouselIndex(i => i - 1);
                        }
                    }}
                >
                    <div className="overflow-hidden w-full">
                        <div
                            className="flex transition-transform duration-300 ease-in-out"
                            style={{ transform: `translateX(-${mobileCarouselIndex * 100}%)` }}
                        >
                            {galleryImages.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        setLightboxIndex(idx);
                                        setIsLightboxOpen(true);
                                    }}
                                    className="w-full flex-shrink-0 relative aspect-[4/5] bg-[#F1E5D2] cursor-pointer"
                                >
                                    <Image src={img} alt={`slide-${idx}`} fill unoptimized className="object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Prev / Next arrows */}
                    {galleryImages.length > 1 && (
                        <>
                            <button
                                onClick={() => setMobileCarouselIndex(i => Math.max(0, i - 1))}
                                disabled={mobileCarouselIndex === 0}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#FFF8F2]/90 border border-[#0E0E0D]/12 flex items-center justify-center disabled:opacity-30 z-10"
                            >
                                <ChevronLeft className="w-4 h-4 text-[#0E0E0D]" />
                            </button>
                            <button
                                onClick={() => setMobileCarouselIndex(i => Math.min(galleryImages.length - 1, i + 1))}
                                disabled={mobileCarouselIndex === galleryImages.length - 1}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#FFF8F2]/90 border border-[#0E0E0D]/12 flex items-center justify-center disabled:opacity-30 z-10"
                            >
                                <ChevronRight className="w-4 h-4 text-[#0E0E0D]" />
                            </button>
                        </>
                    )}

                    {/* Bottom Toolbar Under Image: Dots in center, Wishlist & Share on right */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#0E0E0D]/10 bg-[#FFF8F2]">
                        <div className="w-12" />
                        {/* Dot Indicators */}
                        <div className="flex items-center gap-1.5">
                            {galleryImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMobileCarouselIndex(idx)}
                                    className={`h-[3px] transition-all duration-200 ${idx === mobileCarouselIndex ? 'bg-[#8B1313] w-5' : 'bg-[#0E0E0D]/20 w-2.5'}`}
                                />
                            ))}
                        </div>
                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleLike}
                                disabled={likesLoading}
                                className="p-1.5 text-[#4A4742] hover:text-[#8B1313] transition-colors"
                                title="Wishlist"
                            >
                                <Heart className={`w-5 h-5 ${isLiked(product.id) ? 'fill-[#8B1313] text-[#8B1313]' : ''}`} />
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-1.5 text-[#4A4742] hover:text-[#0E0E0D] transition-colors"
                                title="Share"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. Variant Selectors (Colour / Size) */}
                <div className="px-4 py-4 bg-[#FFF8F2] border-b border-[#0E0E0D]/10">
                    {renderVariantSelectors()}
                </div>

                {/* 5. Price Box */}
                <div className="px-4 py-4 bg-[#FFF8F2] space-y-1.5 border-b border-[#0E0E0D]/10">
                    {selectedVariant && variantPricing && (
                        <>
                            <div className="flex items-baseline gap-2.5 flex-wrap">
                                <span className="text-[2rem] font-semibold text-[#0E0E0D] tracking-tight flex items-start leading-none">
                                    <span className="text-base font-normal mt-1">₹</span>
                                    {Math.round(variantPricing.sp).toLocaleString('en-IN')}
                                </span>
                                {variantPricing.mrp > variantPricing.sp && (
                                    <span className="text-[13px] text-[#4A4742]">
                                        M.R.P. <span className="line-through">₹{Math.round(Number(variantPricing.mrp)).toLocaleString('en-IN')}</span>
                                    </span>
                                )}
                                {variantPricing.hasDiscount && (
                                    <span className="label-caps text-[10px] text-[#8B1313] border border-[#8B1313] px-1.5 py-0.5">
                                        {variantPricing.discountPct}% Off
                                    </span>
                                )}
                            </div>
                            <p className="label-caps text-[10px] text-[#4A4742]">Inclusive of all taxes</p>
                        </>
                    )}
                </div>

                {/* 6. Service Benefits Strip (Mobile) */}
                <div className="px-4 bg-[#FFF8F2] border-b border-[#0E0E0D]/10">
                    <ServiceBenefitsStrip variant={selectedVariant} brand={product?.brand} />
                </div>

                {/* 7. Total, Delivery, Quantity & CTA Actions */}
                <div className="px-4 py-5 bg-[#FFF8F2] space-y-4 border-b border-[#0E0E0D]/10">
                    {selectedVariant && (
                        <>
                            <div className="space-y-1.5">
                                <p className="text-sm font-semibold text-[#0E0E0D]">
                                    Total ₹{Math.round((variantPricing ? variantPricing.sp : Number(selectedVariant.sp)) * quantity).toLocaleString('en-IN')}
                                </p>
                                <p className="text-[13px] text-[#4A4742]">
                                    <span className="font-semibold text-[#0E0E0D]">Complimentary delivery</span> by{' '}
                                    <span className="font-semibold text-[#0E0E0D]">{getEstimatedDeliveryDate()}</span>
                                </p>
                                {renderStock()}
                            </div>

                            {/* Quantity Selector */}
                            {selectedVariant.stock > 0 && (
                                <div className="flex items-center gap-3">
                                    <label className="label-caps text-[11px] text-[#4A4742]">Quantity</label>
                                    <select
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="bg-white border border-[#0E0E0D]/20 text-[13px] font-semibold px-3 py-2 focus:outline-none focus:border-[#8B1313]"
                                    >
                                        {Array.from({ length: Math.min(10, selectedVariant.stock) }, (_, i) => i + 1).map((n) => (
                                            <option key={n} value={n}>
                                                {n}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Action CTA Buttons */}
                            <div className="pt-1">
                                {renderActionButtons(true)}
                            </div>

                            {/* Meta info table */}
                            <div className="grid grid-cols-3 gap-y-2 text-[13px] pt-2 border-t border-[#0E0E0D]/10">
                                <span className="label-caps text-[10px] text-[#4A4742]">Sold by</span>
                                <span className="col-span-2 text-[#0E0E0D] font-medium">{product.brand?.name || 'SVASTRA'}</span>

                                <span className="label-caps text-[10px] text-[#4A4742]">Packaging</span>
                                <span className="col-span-2 text-[#0E0E0D] font-medium">Ships in signature packaging</span>

                                <span className="label-caps text-[10px] text-[#4A4742]">Gifting</span>
                                <span className="col-span-2 text-[#0E0E0D] font-medium">Available at checkout</span>
                            </div>

                            {/* Save this item / Wishlist Button */}
                            <button
                                onClick={handleLike}
                                disabled={likesLoading}
                                className="sv-btn-outline w-full disabled:opacity-50"
                            >
                                {isLiked(product.id) ? 'Saved to Wishlist' : 'Add to Wishlist'}
                            </button>
                        </>
                    )}
                </div>

                {/* 8. Assurance Badges + Returns Notice */}
                <div className="px-4 py-5 bg-[#FFF8F2] border-b border-[#0E0E0D]/10 space-y-4">
                    <h3 className="label-caps text-[11px] text-[#8B1313]">The SVastra Promise</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {/* Delivery */}
                        <div className="flex items-center gap-2 text-[13px] text-[#4A4742]">
                            <Truck className="w-4 h-4 text-[#4A4742] flex-shrink-0" strokeWidth={1.5} />
                            <span>
                                {selectedVariant?.shipping_charges && Number(selectedVariant.shipping_charges) > 0
                                    ? `Delivery ₹${Number(selectedVariant.shipping_charges).toLocaleString('en-IN')}`
                                    : 'Complimentary Delivery'}
                            </span>
                        </div>
                        {/* COD */}
                        <div className="flex items-center gap-2 text-[13px]">
                            <Banknote className={`w-4 h-4 flex-shrink-0 ${selectedVariant?.is_cod_allowed !== false ? 'text-[#4A4742]' : 'text-[#8B1313]'}`} strokeWidth={1.5} />
                            <span className={selectedVariant?.is_cod_allowed !== false ? 'text-[#4A4742]' : 'text-[#8B1313] font-semibold'}>
                                {selectedVariant?.is_cod_allowed !== false ? 'Pay on Delivery' : 'Prepaid Only'}
                            </span>
                        </div>
                        {/* Return & Exchange */}
                        <div className="flex items-center gap-2 text-[13px]">
                            <RotateCcw className={`w-4 h-4 flex-shrink-0 ${selectedVariant?.is_returnable !== false ? 'text-[#4A4742]' : 'text-[#8B1313]'}`} strokeWidth={1.5} />
                            <span className={selectedVariant?.is_returnable !== false ? 'text-[#4A4742]' : 'text-[#8B1313] font-semibold'}>
                                {selectedVariant?.is_returnable !== false
                                    ? `${selectedVariant?.return_window_days ?? 7}-Day Returns`
                                    : 'Non-Returnable'}
                            </span>
                        </div>
                        {/* Delivered */}
                        <div className="flex items-center gap-2 text-[13px] text-[#4A4742]">
                            <ShieldCheck className="w-4 h-4 text-[#4A4742] flex-shrink-0" strokeWidth={1.5} />
                            <span>Quality Assured</span>
                        </div>
                    </div>

                    {/* Returns Notice */}
                    {selectedVariant?.is_returnable !== false ? (
                        <div className="border border-[#0E0E0D]/12 bg-[#F1E5D2] p-3.5 flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-[#8B1313] flex-shrink-0 mt-0.5" strokeWidth={2} />
                            <div>
                                <p className="label-caps text-[10px] text-[#0E0E0D]">Easy Returns</p>
                                <p className="text-[12px] text-[#4A4742] mt-1 leading-snug">
                                    Eligible for return or exchange within {selectedVariant?.return_window_days ?? 7} days of delivery.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="border border-[#8B1313]/30 bg-[#8B1313]/[0.04] p-3.5 flex items-start gap-2.5">
                            <span className="w-4 h-4 border border-[#8B1313] text-[#8B1313] flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">!</span>
                            <div>
                                <p className="label-caps text-[10px] text-[#8B1313]">Final Sale</p>
                                <p className="text-[12px] text-[#4A4742] mt-1 leading-snug">
                                    This piece cannot be returned or exchanged once delivered.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 9. Specifications, Description & Reviews */}
                <div className="px-4 py-6 bg-[#FFF8F2] space-y-6">
                    {/* About this item */}
                    {features.length > 0 && (
                        <div>
                            <h3 className="label-caps text-[11px] text-[#8B1313] mb-2.5">The Highlights</h3>
                            <ul className="space-y-2">
                                {features.map((feature: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2.5 text-[13px] text-[#4A4742]">
                                        <span className="mt-1.5 w-1 h-1 bg-[#8B1313] flex-shrink-0" />
                                        <span className="leading-relaxed">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Description */}
                    {product.description && (
                        <div className="border-t border-[#0E0E0D]/10 pt-5">
                            <h3 className="label-caps text-[11px] text-[#8B1313] mb-2.5">The Story</h3>
                            <div
                                className="prose prose-sm max-w-none text-[13px] text-[#4A4742] leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        </div>
                    )}

                    {/* Features & Specs */}
                    {details.length > 0 && (
                        <div className="pt-1">
                            {renderSpecs()}
                        </div>
                    )}

                    {/* Similar Products */}
                    {similarProducts.length > 0 && (
                        <div className="border-t border-[#0E0E0D]/10 pt-6">
                            <h3 className="display-section !text-lg text-[#0E0E0D] mb-4">You May Also Like</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {similarProducts.map((prod) => (
                                    <ProductCard key={prod.id} product={prod} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Customer Reviews Section */}
                    <div id="reviews-section" className="border-t border-[#0E0E0D]/10 pt-6">
                        <ProductReviews
                            productId={product.id}
                            productSlug={product?.slug || getProductSlug(product)}
                            onRatingUpdate={() => {
                                fetchLiveRatingSummary(true);
                                window.dispatchEvent(new CustomEvent('reviewUpdated', { detail: { productId: product.id } }));
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                DESKTOP LAYOUT (SVastra Editorial - Visible on lg+)
            ══════════════════════════════════════════════════════ */}
            <div className="hidden lg:block bg-[#FFF8F2]">
                <div className="w-full max-w-[1720px] mx-auto site-pad py-10">
                    {/* ── Three-column master layout: [Sticky Images] | [Content + BuyBox] | [Related Products Sidebar] ── */}
                    <div className="flex gap-8 xl:gap-12 2xl:gap-16 items-start">

                        {/* ── LEFT: Compact sticky gallery (balanced with details column) ── */}
                        <div className="w-[320px] xl:w-[360px] 2xl:w-[380px] flex-shrink-0 sticky top-24 self-start z-10">
                            <div className="flex gap-2.5 items-start">
                                {/* Vertical thumbnails */}
                                <div
                                    className="flex flex-col gap-2 w-[52px] xl:w-[56px] flex-shrink-0 overflow-y-auto max-h-[min(480px,calc(100vh-8rem))] scrollbar-hide"
                                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                                >
                                    {galleryImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setMainImage(img)}
                                            aria-label={`View image ${idx + 1}`}
                                            className={`relative w-[52px] xl:w-[56px] h-[64px] xl:h-[70px] border overflow-hidden transition-colors duration-200 shrink-0 p-0 ${
                                                mainImage === img
                                                    ? "border-[#8B1313] border-2"
                                                    : "border-[#0E0E0D]/12 hover:border-[#0E0E0D]"
                                            }`}
                                        >
                                            <Image src={img} alt={`thumb-${idx}`} fill unoptimized className="object-cover object-top" />
                                        </button>
                                    ))}
                                </div>

                                {/* Main Stage Image — fixed frame, not oversized */}
                                <div className="relative flex-1 min-w-0">
                                    <div
                                        className="relative w-full aspect-[3/4] max-h-[min(480px,calc(100vh-8rem))] overflow-hidden cursor-crosshair bg-[#F1E5D2] border border-[#0E0E0D]/10"
                                        onMouseMove={handleMouseMove}
                                        onMouseEnter={() => setIsHovering(true)}
                                        onMouseLeave={() => setIsHovering(false)}
                                        onClick={() => {
                                            const activeIdx = galleryImages.indexOf(mainImage || '');
                                            setLightboxIndex(activeIdx >= 0 ? activeIdx : 0);
                                            setIsLightboxOpen(true);
                                        }}
                                    >
                                        <Image
                                            src={mainImage || imgPlaceholder.src}
                                            alt={product.name}
                                            fill
                                            unoptimized
                                            className="object-cover object-top"
                                        />
                                        {isHovering && (
                                            <div
                                                className="absolute bg-[#0E0E0D]/10 border border-[#0E0E0D]/30 pointer-events-none w-20 h-20"
                                                style={{
                                                    left: `${Math.max(0, Math.min(78, zoomPosition.x - 10))}%`,
                                                    top: `${Math.max(0, Math.min(78, zoomPosition.y - 10))}%`,
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Wishlist on image */}
                                    <button
                                        onClick={handleLike}
                                        disabled={likesLoading}
                                        type="button"
                                        aria-label="Wishlist"
                                        className={`absolute top-2.5 right-2.5 z-10 p-2 border transition-colors duration-200 ${
                                            isLiked(product.id)
                                                ? "bg-[#8B1313] border-[#8B1313] text-[#FFF8F2]"
                                                : "bg-[#FFF8F2] border-[#0E0E0D]/15 text-[#4A4742] hover:text-[#8B1313] hover:border-[#8B1313]"
                                        } disabled:opacity-50`}
                                    >
                                        <Heart className={`w-3.5 h-3.5 ${isLiked(product.id) ? "fill-current" : ""}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── MIDDLE: All content (details + buy box + specs) ── */}
                        <div className="flex-1 min-w-0">

                            {/* Product info row: details | buy-box */}
                            <div className="flex gap-6">
                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    {product.brand && (
                                        <button
                                            onClick={() => product.brand ? router.push(`/brands/${getBrandSlug(product.brand)}`) : null}
                                            className="label-caps text-[11px] text-[#8B1313] hover:text-[#0E0E0D] transition-colors mb-2"
                                        >
                                            {product.brand.name}
                                        </button>
                                    )}
                                    <h1 className="text-[26px] xl:text-[30px] font-semibold text-[#0E0E0D] leading-[1.2] tracking-[-0.02em] mb-3">{product.name}</h1>

                                    {/* Rating (Only show if product actually has reviews) */}
                                    {(((liveRatingSummary || product.rating_summary)?.total_reviews || 0) > 0 && ((liveRatingSummary || product.rating_summary)?.average_rating || 0) > 0) && (
                                        <div className="flex items-center gap-3 mb-3 relative group">
                                            <div className={`flex items-center gap-1 cursor-pointer ${isUpdatingRating ? 'animate-pulse' : ''}`}
                                                onClick={() => router.push(`/products/${product?.slug || getProductSlug(product) || id}/reviews`)}>
                                                <ProductRatingDisplay
                                                    averageRating={(liveRatingSummary || product.rating_summary)?.average_rating || 0}
                                                    reviewCount={(liveRatingSummary || product.rating_summary)?.total_reviews || 0}
                                                    size="md" showCount={true} className="text-[#4A4742] hover:text-[#0E0E0D]"
                                                />
                                                {isUpdatingRating && <div className="w-2 h-2 bg-[#D19E3D] rounded-full animate-ping ml-1" />}
                                            </div>
                                            {/* Rating tooltip */}
                                            <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-[#0E0E0D]/12 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 w-72">
                                                <h4 className="label-caps text-[11px] text-[#8B1313] mb-3">Customer Ratings</h4>
                                                <div className="space-y-2">
                                                    {[5, 4, 3, 2, 1].map((star) => {
                                                        const cur = liveRatingSummary || product.rating_summary;
                                                        const cnt = cur?.rating_distribution?.[star] || 0;
                                                        const pct = cur?.total_reviews ? (cnt / cur.total_reviews) * 100 : 0;
                                                        return (
                                                            <div key={star} className="flex items-center gap-2 text-xs">
                                                                <span className="w-4 text-[#4A4742]">{star}</span>
                                                                <span className="text-[#D19E3D]">★</span>
                                                                <div className="flex-1 bg-[#0E0E0D]/10 h-1.5">
                                                                    <div className="bg-[#D19E3D] h-1.5 transition-all duration-500" style={{ width: `${pct}%` }} />
                                                                </div>
                                                                <span className="w-8 text-right text-[#4A4742]">{cnt}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-[#0E0E0D]/10 text-center">
                                                    <div className="text-2xl font-semibold text-[#0E0E0D]">{((liveRatingSummary || product.rating_summary)?.average_rating || 0).toFixed(1)}</div>
                                                    <div className="text-xs text-[#4A4742]">out of {(liveRatingSummary || product.rating_summary)?.total_reviews || 0} ratings</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {product.item_code && <p className="label-caps text-[10px] text-[#4A4742] mb-3">Item Code <span className="text-[#0E0E0D]">{product.item_code}</span></p>}
                                    <div className="border-t border-[#0E0E0D]/12 my-4" />

                                    {/* Price */}
                                    <div className="mb-2">{renderPrice(true)}</div>

                                    {/* Services & Benefits Strip (Desktop) */}
                                    <ServiceBenefitsStrip variant={selectedVariant} brand={product?.brand} />

                                    {/* Variants */}
                                    <div className="mb-6">{renderVariantSelectors()}</div>

                                    {/* About this item */}
                                    {features.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="label-caps text-[11px] text-[#8B1313] mb-2.5">The Highlights</h3>
                                            <ul className="space-y-2">
                                                {features.map((feature: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-2.5 text-[14px] text-[#4A4742]">
                                                        <span className="mt-2 w-1 h-1 bg-[#8B1313] flex-shrink-0" />
                                                        <span className="leading-relaxed">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {product.description && (
                                        <div className="mb-6">
                                            <h3 className="label-caps text-[11px] text-[#8B1313] mb-2.5">The Story</h3>
                                            <div className="prose prose-sm max-w-none text-[#4A4742] leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: product.description }} />
                                        </div>
                                    )}
                                </div>

                                {/* Buy Box */}
                                {selectedVariant && (
                                    <div className="w-[250px] xl:w-[270px] flex-shrink-0">
                                        <div className="border border-[#0E0E0D]/12 p-5 sticky top-24 bg-white space-y-3.5">
                                            {/* Price */}
                                            <div>
                                                <div className="flex items-baseline gap-2 flex-wrap">
                                                    <span className="text-2xl font-semibold text-[#0E0E0D] tracking-tight">
                                                        <span className="text-sm align-top leading-6 font-normal">₹</span>
                                                        {variantPricing ? Math.round(variantPricing.sp).toLocaleString('en-IN') : Math.round(Number(selectedVariant.sp)).toLocaleString('en-IN')}
                                                    </span>
                                                    {variantPricing && variantPricing.hasDiscount && <span className="label-caps text-[10px] text-[#8B1313] border border-[#8B1313] px-1.5 py-0.5">{variantPricing.discountPct}% Off</span>}
                                                </div>
                                                {variantPricing && variantPricing.mrp > variantPricing.sp && (
                                                    <p className="text-xs text-[#4A4742] mt-1">M.R.P. <span className="line-through">₹{Math.round(Number(variantPricing.mrp)).toLocaleString('en-IN')}</span></p>
                                                )}
                                                <p className="label-caps text-[9.5px] text-[#4A4742] mt-1.5">
                                                    Inclusive of all taxes
                                                </p>
                                            </div>

                                            {/* Stock */}
                                            {renderStock()}
                                            {/* Quantity */}
                                            {renderQuantity()}
                                            {/* Instant Checkout (primary) + Add to Bag */}
                                            {renderActionButtons()}
                                            {/* Divider + wishlist */}
                                            <div className="border-t border-[#0E0E0D]/10 pt-3">
                                                <button onClick={handleLike} disabled={likesLoading}
                                                    className="flex items-center gap-2 w-full text-left label-caps text-[10px] text-[#4A4742] hover:text-[#8B1313] transition-colors disabled:opacity-50">
                                                    <Heart className={`w-4 h-4 flex-shrink-0 ${isLiked(product.id) ? 'fill-[#8B1313] text-[#8B1313]' : ''}`} />
                                                    {isLiked(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                                </button>
                                            </div>
                                            {!user && (
                                                <p className="text-[11px] text-[#4A4742] text-center">
                                                    <button onClick={() => openAuthModal('login')} className="text-[#8B1313] hover:text-[#0E0E0D] font-semibold">Sign in</button> to order
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── Specs (inside middle column) ── */}
                            {details.length > 0 && (
                                <div className="mt-12">{renderSpecs()}</div>
                            )}

                        </div>{/* end middle column */}

                        {/* ── RIGHT: Related Products Scrollable Column (No header, no outer borders, standard ProductCard size, hidden scrollbar) ── */}
                        {similarProducts.length > 0 && (
                            <div className="hidden xl:block w-[240px] xl:w-[260px] 2xl:w-[275px] flex-shrink-0 sticky top-24 self-start pl-2 xl:pl-6">
                                <div
                                    onScroll={(e) => {
                                        const el = e.currentTarget;
                                        if (el.scrollHeight - el.scrollTop - el.clientHeight < 300) {
                                            loadNextSimilarPage();
                                        }
                                    }}
                                    className="space-y-4 overflow-y-auto max-h-[calc(100vh-80px)] scrollbar-hide select-none"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {similarProducts.map((prod) => (
                                        <div key={prod.id} className="w-full">
                                            <ProductCard product={prod} hideMetadata={true} />
                                        </div>
                                    ))}
                                    {loadingSimilar && (
                                        <div className="py-4 text-center">
                                            <Loader2 className="w-5 h-5 animate-spin text-[#8B1313] mx-auto" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* ── 1. Similar Products (Full Width Row) ── */}
                    {similarProducts.length > 0 && (
                        <div className="mt-16 pt-10 border-t border-[#0E0E0D]/12">
                            <h2 className="display-section text-[#0E0E0D] mb-6">You May Also Like</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
                                {similarProducts.map((prod) => (
                                    <ProductCard key={prod.id} product={prod} />
                                ))}
                            </div>

                            {/* Sentinel for infinite scroll */}
                            <div ref={observerTargetRef} className="py-6 text-center min-h-[50px] flex items-center justify-center">
                                {loadingSimilar && (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F1E5D2] border border-[#0E0E0D]/10 label-caps text-[10px] text-[#4A4742]">
                                        <Loader2 className="w-4 h-4 animate-spin text-[#8B1313]" />
                                        <span>Loading More</span>
                                    </div>
                                )}
                            </div>

                            {/* All Similar Products Loaded End Indicator */}
                            {!similarPagination.has_more && similarProducts.length > 0 && !loadingSimilar && (
                                <div className="flex items-center justify-center pb-6 animate-in fade-in duration-200">
                                    <span className="bg-[#FFF8F2] px-4 py-1.5 border border-[#0E0E0D]/12 label-caps text-[10px] text-[#4A4742] flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-[#8B1313]" strokeWidth={2} />
                                        <span>All {similarProducts.length} Pieces Loaded</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── 2. Customer Reviews Section (Bottom of Page - Full Width) ── */}
                    <div className="mt-16 pt-12 border-t border-[#0E0E0D]/12" id="reviews-section">
                        <ProductReviews productId={product.id} productSlug={product?.slug || getProductSlug(product)} onRatingUpdate={() => {
                            fetchLiveRatingSummary(true);
                            window.dispatchEvent(new CustomEvent('reviewUpdated', { detail: { productId: product.id } }));
                        }} />
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                FULLSCREEN LIGHTBOX IMAGE SLIDER MODAL
            ══════════════════════════════════════════════════════ */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-[99999] bg-[#FFF8F2] flex flex-col justify-between select-none animate-fadeIn">
                    {/* Top Header Bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#0E0E0D]/10 bg-[#FFF8F2]">
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="p-2 hover:bg-[#F1E5D2] transition-colors text-[#0E0E0D] flex items-center gap-2 label-caps text-[11px]"
                            title="Close (Esc)"
                        >
                            <X className="w-6 h-6 text-[#0E0E0D]" />
                            <span className="hidden sm:inline">Close</span>
                        </button>

                        <div className="text-center label-caps text-[11px] text-[#4A4742] max-w-md truncate">
                            {product.name} · {lightboxIndex + 1} / {galleryImages.length}
                        </div>

                        <div className="w-16" />
                    </div>

                    {/* Main Image Slider View */}
                    <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-[#FFF8F2]">
                        {/* Prev Button */}
                        {galleryImages.length > 1 && (
                            <button
                                onClick={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                                className="absolute left-4 sm:left-10 z-10 w-12 h-12 bg-[#FFF8F2] hover:bg-[#F1E5D2] text-[#0E0E0D] border border-[#0E0E0D]/15 flex items-center justify-center transition-colors"
                                title="Previous Image (Left Arrow)"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}

                        {/* Current Image */}
                        <div className="relative w-full h-full max-w-5xl max-h-[80vh]">
                            <Image
                                src={galleryImages[lightboxIndex] || imgPlaceholder.src}
                                alt={`Full view ${lightboxIndex + 1}`}
                                fill
                                unoptimized
                                className="object-contain transition-all duration-300"
                            />
                        </div>

                        {galleryImages.length > 1 && (
                            <button
                                onClick={() => setLightboxIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
                                className="absolute right-4 sm:right-10 z-10 w-12 h-12 bg-[#FFF8F2] hover:bg-[#F1E5D2] text-[#0E0E0D] border border-[#0E0E0D]/15 flex items-center justify-center transition-colors"
                                title="Next Image (Right Arrow)"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Bottom Pagination Bar (Dots + Thumbnails) */}
                    <div className="py-4 px-6 border-t border-[#0E0E0D]/10 bg-[#FFF8F2] flex flex-col items-center gap-3">
                        {/* Pagination Dots */}
                        <div className="flex items-center gap-2">
                            {galleryImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setLightboxIndex(idx)}
                                    className={`h-[3px] transition-all duration-300 ${idx === lightboxIndex ? 'bg-[#8B1313] w-6' : 'bg-[#0E0E0D]/20 w-2.5 hover:bg-[#0E0E0D]/40'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Horizontal Thumbnail Strip */}
                        {galleryImages.length > 1 && (
                            <div className="flex gap-2.5 overflow-x-auto max-w-full py-1 px-2 no-scrollbar">
                                {galleryImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setLightboxIndex(idx)}
                                        className={`relative w-14 h-16 border overflow-hidden flex-shrink-0 transition-all ${idx === lightboxIndex ? 'border-[#8B1313] border-2' : 'border-[#0E0E0D]/15 opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <Image src={img} alt={`thumb-${idx}`} fill unoptimized className="object-cover" />
                                        <Image src={img} alt={`thumb-${idx}`} fill unoptimized className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Centered Scroll To Top Button */}
            <button
                type="button"
                onClick={scrollToTop}
                aria-label="Scroll to top"
                className={`fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 p-3 sm:p-3.5 bg-[#0E0E0D] hover:bg-[#8B1313] text-[#FFF8F2] border border-[#0E0E0D] transition-all duration-300 transform active:scale-90 flex items-center justify-center group select-none ${showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'
                    }`}
                title="Back to Top"
            >
                <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
        </div>
    );
};

export default ProductPage;
