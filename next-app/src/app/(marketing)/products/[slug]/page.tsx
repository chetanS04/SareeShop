"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import imgPlaceholder from "@/public/imagePlaceholder.png";
import axios from "../../../../../utils/axios";
import { ProductDetail, ProductVariant } from "@/common/interface";
import { ChevronDown, ChevronUp, Package, ShoppingCart, Plus, Minus, Heart, ShoppingBag, X, ChevronLeft, ChevronRight, Share2, MapPin, ShieldCheck, Check, Truck, RotateCcw, BadgePercent, Banknote, Loader2, Award, Lock, PackageCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLike } from "@/context/LikeContext";
import { useProductSync, ProductEventData } from "@/context/ProductSyncContext";
import ProductReviews from "@/components/reviews/ProductReviews";
import ProductRatingDisplay from "@/components/ui/ProductRatingDisplay";
import { getSimilarProducts } from "../../../../../utils/similarProducts";
import { useLoader } from "@/context/LoaderContext";
import { calculateDiscount, getPricing } from "@/utils/pricing";
import ProductCard from "@/components/(frontend)/ProductCard";
import ProductDetailsSkeleton from "@/components/ui/ProductDetailsSkeleton";

import { getImageUrl } from "../../../../../utils/imageUtils";
import { getBrandSlug, getProductSlug } from "../../../../../utils/slugUtils";

const AmazonBenefitsStrip = ({
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

    const benefits = [];

    // 1. Return & Exchange (Strictly when isReturnable is true AND returnDays > 0)
    if (isReturnable && returnDays > 0) {
        benefits.push({
            id: 'return',
            title: `${returnDays} days Return & Exchange`,
            icon: (
                <svg className="w-6 h-6 text-[#E47911]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12a8 8 0 0 1 14.93-4M20 12a8 8 0 0 1-14.93 4" stroke="#E47911" strokeWidth="1.8" />
                    <polyline points="19 8 19 4 15 4" stroke="#E47911" strokeWidth="1.8" />
                    <rect x="8" y="8.5" width="8" height="7" rx="1" fill="#fff" stroke="#E47911" strokeWidth="1.5" />
                    <line x1="8" y1="11" x2="16" y2="11" stroke="#E47911" strokeWidth="1.2" />
                </svg>
            ),
            iconBg: 'bg-amber-50/70 border-amber-200/80',
        });
    }

    // 2. Pay on Delivery (Strictly when COD is enabled for this variant)
    if (isCodAllowed) {
        benefits.push({
            id: 'cod',
            title: 'Pay on Delivery',
            icon: (
                <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="16" height="10" rx="2" />
                    <circle cx="10" cy="10" r="2.5" />
                    <path d="M6 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3" />
                </svg>
            ),
            iconBg: 'bg-gray-50 border-gray-200/90',
        });
    }

    // 3. Free Delivery (Strictly when shipping charges are 0 / free for this variant)
    if (isFreeDelivery) {
        benefits.push({
            id: 'free_delivery',
            title: 'Free Delivery',
            icon: (
                <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="6" width="13" height="11" rx="2" />
                    <polygon points="14 9 19 9 22 13 22 17 14 17 14 9" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="17.5" cy="18.5" r="2.5" />
                </svg>
            ),
            iconBg: 'bg-gray-50 border-gray-200/90',
        });
    }

    // 4. Brand Assured (Strictly when product has a real brand)
    if (brand?.name) {
        benefits.push({
            id: 'brand',
            title: `${brand.name} Assured`,
            icon: (
                <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9H3.5a1.5 1.5 0 0 1-1.5-1.5V5h4" />
                    <path d="M18 9h2.5a1.5 1.5 0 0 0 1.5-1.5V5h-4" />
                    <path d="M4 5h16v4a6 6 0 0 1-12 0V5z" />
                    <path d="M12 15v4" />
                    <path d="M8 19h8" />
                    <polygon points="12 7.5 13 9.5 15.2 9.8 13.6 11.3 14 13.5 12 12.4 10 13.5 10.4 11.3 8.8 9.8 11 9.5 12 7.5" fill="#f59e0b" stroke="none" />
                </svg>
            ),
            iconBg: 'bg-gray-50 border-gray-200/90',
        });
    }

    // 5. Secure transaction
    benefits.push({
        id: 'secure',
        title: 'Secure transaction',
        icon: (
            <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
        ),
        iconBg: 'bg-gray-50 border-gray-200/90',
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
        const scrollOffset = direction === 'left' ? -180 : 180;
        scrollRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
        setTimeout(updateScrollButtons, 350);
    };

    if (benefits.length === 0) return null;

    return (
        <div className="relative border-y border-gray-200 py-3 my-3">
            <div className="relative flex items-center">
                {/* Left Navigation Button */}
                {canScrollLeft && (
                    <button
                        type="button"
                        onClick={() => handleScroll('left')}
                        className="flex absolute -left-2 top-1/2 -translate-y-1/2 w-6 h-9 bg-white/95 hover:bg-gray-100 border border-gray-300 rounded-md shadow-md items-center justify-center text-gray-700 hover:text-gray-900 transition-all z-20 cursor-pointer"
                        aria-label="Scroll benefits left"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}

                {/* Benefits List */}
                <div
                    ref={scrollRef}
                    className="flex items-start gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth w-full px-1 py-1 select-none"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {benefits.map((b) => (
                        <div
                            key={b.id}
                            className="flex flex-col items-center text-center flex-shrink-0 w-[78px] sm:w-[84px] cursor-pointer group select-none"
                        >
                            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${b.iconBg} border flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:shadow-xs group-hover:border-[#007185]`}>
                                {b.icon}
                            </div>
                            <span className="text-[11px] sm:text-xs text-[#007185] group-hover:text-[#C7511F] group-hover:underline font-normal text-center leading-tight mt-1.5 min-h-[28px] line-clamp-2">
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
                        className="flex absolute -right-2 top-1/2 -translate-y-1/2 w-6 h-9 bg-white/95 hover:bg-gray-100 border border-gray-300 rounded-md shadow-md items-center justify-center text-gray-700 hover:text-gray-900 transition-all z-20 cursor-pointer"
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
                alert("This product is no longer active or has been removed.");
                router.push("/products");
            } else if (event.action === "updated" || event.action === "status_changed" || event.action === "stock_updated") {
                // Silently refresh product in background
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

    // Auto-revert "Go to Cart" button back to "Add to Cart" after 3.5 seconds if user stays on the page
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
            alert('Please select all required options');
            return;
        }

        if (selectedVariant.stock < quantity) {
            alert(`Only ${selectedVariant.stock} items available`);
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
            setToastMessage('Item added to cart successfully!');
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
                : 'Added to wishlist!';
            setToastMessage(message);
            setShowToast(true);
        }
    };

    const handleShare = () => {
        if (typeof window !== "undefined") {
            if (navigator.share) {
                navigator.share({
                    title: product?.name || "Product",
                    url: window.location.href,
                }).catch(() => { });
            } else {
                navigator.clipboard.writeText(window.location.href);
                setToastMessage("Product link copied to clipboard!");
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
        // Fixed panel: appear to the right of the image box, aligned to its top
        setZoomPanelPos({
            top: rect.top,
            left: rect.right + 16,
        });
    };

    const formatSpecificationKey = (key: string): string => {
        if (!key) return '';
        return key
            .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
            .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
                <div className="container mx-auto px-4 py-16">
                    <div className="text-center">
                        <div className="w-24 h-24 text-gray-400 mx-auto mb-6">
                            <Package className="w-full h-full" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
                        <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed</p>
                        <button
                            onClick={() => router.push('/')}
                            style={{ backgroundColor: 'var(--theme-blue)', color: '#FFFAFB' }}
                            className="px-8 py-3 font-semibold rounded-full hover:bg-[#0066CC] hover:shadow-lg transition-all duration-300 transform hover:scale-105"
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
    const rawGstRate = (product as any)?.gstRate || (product as any)?.tax_rate || 18;
    const productGstRate = parseFloat(String(rawGstRate)) || 18.0;
    const productHsn = (product as any)?.hsn || null;

    const variantPricing = selectedVariant
        ? getPricing(selectedVariant.mrp, (selectedVariant as any).baseSp ?? selectedVariant.sp, productGstRate)
        : null;

    const discountPct = variantPricing ? variantPricing.discountPct : 0;

    // Handler for hierarchical option selection (First Attribute vs Subsequent Attributes)
    const handleOptionClick = (attrIndex: number, clickedAttrId: number, val: string) => {
        if (!product) return;
        const itemAttrs = product.item_attributes || [];

        // If clicking the First Attribute (e.g. Color)
        if (attrIndex === 0) {
            const nextOptions: Record<number, string> = { [clickedAttrId]: val };

            // Find all variants of this product that have the chosen first attribute value
            const variantsWithVal = (product.variants || []).filter((v) => {
                return (v.attribute_values || []).some((av: any) => {
                    const aId = Number(av?.attribute_id ?? av?.attributeId ?? av?.attribute?.id);
                    return aId === clickedAttrId && av.value === val;
                });
            });

            // 1. Try to find an in-stock variant that also matches the currently selected subsequent attributes
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

            // 2. If current size doesn't exist for this new color, auto-select the first in-stock size of this color
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

        // If clicking a Subsequent Attribute (e.g. Size at index > 0)
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

    // helper: shared variant selector block
    const renderVariantSelectors = () => (
        (product.item_attributes || []).length > 0 && (
            <div className="space-y-4">
                {(product.item_attributes || []).map((ia: any, attrIndex: number) => {
                    const attrId = Number(ia.attribute_id ?? ia.attributeId ?? ia.attribute?.id);
                    const isFirstAttr = attrIndex === 0;

                    return (
                        <div key={attrId}>
                            <p className="text-sm font-semibold text-gray-800 mb-2">
                                {ia.attribute?.name}:{' '}
                                <span className="font-normal text-gray-600">{selectedOptions[attrId] || '—'}</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {attributeOptions[attrId]?.map((val) => {
                                    let isAvailable = false;

                                    if (isFirstAttr) {
                                        // First attribute (e.g. Color):
                                        // Available if ANY variant with this color has stock > 0
                                        isAvailable = (product.variants || []).some((variant) => {
                                            if (!variant.attribute_values) return false;
                                            const hasColorVal = (variant.attribute_values || []).some((av: any) => {
                                                const aId = Number(av?.attribute_id ?? av?.attributeId ?? av?.attribute?.id);
                                                return aId === attrId && av.value === val;
                                            });
                                            return hasColorVal && (variant.stock ?? 0) > 0;
                                        });
                                    } else {
                                        // Subsequent attributes (e.g. Size):
                                        // Available if variant exists with ALL preceding selected attributes (e.g. Color) AND this size, with stock > 0
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

                                    return (
                                        <button
                                            key={val}
                                            type="button"
                                            aria-disabled={isDisabled}
                                            onClick={() => {
                                                if (isDisabled) return;
                                                handleOptionClick(attrIndex, attrId, val);
                                            }}
                                            title={isDisabled ? `${val} (Out of stock / Unavailable)` : val}
                                            style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                                            className={`relative overflow-hidden px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-all duration-150 select-none ${isSelected
                                                ? 'border-[#007FFF] bg-blue-50/90 text-[#007FFF] font-semibold shadow-2xs ring-2 ring-[#007FFF]/20 cursor-pointer'
                                                : isDisabled
                                                ? 'border-gray-200 bg-gray-50/80 text-gray-400 !cursor-not-allowed border-dashed hover:border-gray-200'
                                                : 'border-gray-300 bg-white text-gray-800 hover:border-[#007FFF] hover:text-[#007FFF] cursor-pointer'
                                                }`}
                                        >
                                            <span className={isDisabled ? 'opacity-50 pointer-events-none' : ''}>{val}</span>

                                            {/* Diagonal cross strike-through line for out-of-stock / unavailable options */}
                                            {isDisabled && (
                                                <svg
                                                    className="absolute inset-0 w-full h-full pointer-events-none text-rose-500/70"
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

    // helper: shared add-to-cart + buy-now buttons
    const renderActionButtons = (fullWidth = false) => (
        selectedVariant && (
            <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
                <button
                    onClick={isInCart ? handleViewCart : handleAddToCart}
                    disabled={selectedVariant.stock === 0 || addingToCart || cartLoading}
                    className="w-full py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {addingToCart || cartLoading ? (
                        <><div className="w-4 h-4 border-2 border-gray-500/30 border-t-gray-700 rounded-full animate-spin" />Adding...</>
                    ) : isInCart ? (
                        <><ShoppingCart className="w-4 h-4" />Go to Cart</>
                    ) : selectedVariant.stock > 0 ? (
                        <><ShoppingCart className="w-4 h-4" />Add to Cart</>
                    ) : 'Out of Stock'}
                </button>
                <button
                    onClick={() => {
                        if (!user) { openAuthModal('login'); return; }
                        if (selectedVariant && selectedVariant.stock > 0)
                            router.push(`/checkout/single?productId=${product!.id}&variantId=${selectedVariant.id}&quantity=${quantity}`);
                    }}
                    disabled={selectedVariant.stock === 0}
                    className="w-full py-2.5 rounded-full text-sm font-semibold bg-[#FFA41C] hover:bg-[#FF8F00] text-white shadow transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {!user ? 'Login to Buy' : selectedVariant.stock === 0 ? 'Out of Stock' : <><ShoppingBag className="w-4 h-4" />Buy Now</>}
                </button>
            </div>
        )
    );

    const renderPrice = (large = false) => (
        selectedVariant && variantPricing && (
            <div>
                <div className={`flex items-baseline gap-2 flex-wrap ${large ? 'mb-1' : ''}`}>
                    {variantPricing.hasDiscount && <span className="text-red-600 font-semibold text-sm">-{variantPricing.discountPct}%</span>}
                    <span className={`font-normal text-gray-900 ${large ? 'text-3xl' : 'text-2xl'}`}>
                        <span className={`align-top ${large ? 'text-base leading-7' : 'text-sm leading-6'}`}>₹</span>
                        {Math.round(variantPricing.sp).toLocaleString('en-IN')}
                    </span>
                    {variantPricing.mrp > variantPricing.sp && (
                        <span className="text-xs text-gray-500">M.R.P.: <span className="line-through">₹{Math.round(Number(variantPricing.mrp)).toLocaleString('en-IN')}</span></span>
                    )}
                </div>
                {variantPricing.hasDiscount && large && (
                    <p className="text-sm text-gray-500">You save: ₹{Math.round(variantPricing.savingsAmount).toLocaleString('en-IN')} ({variantPricing.discountPct}%)</p>
                )}
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                    GST included
                </p>
            </div>
        )
    );



    // helper: shared specs table (Exact Amazon Features & Specs style)
    const renderSpecs = () => (
        details.length > 0 && (
            <div className="border-t border-gray-200 w-full">
                <button
                    type="button"
                    onClick={() => setIsSpecsOpen(!isSpecsOpen)}
                    className="w-full flex items-center justify-between py-3.5 bg-transparent hover:bg-gray-50/40 transition-colors text-left select-none cursor-pointer border-b border-gray-200"
                >
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                        Features &amp; Specs
                    </h2>
                    <ChevronDown className={`w-5 h-5 text-gray-800 transition-transform duration-300 ${isSpecsOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${isSpecsOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <table className="w-full text-xs sm:text-sm text-left border-collapse">
                        <tbody>
                            {details.map((d: any, idx: number) => (
                                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50/30 transition-colors">
                                    <td className="py-2.5 sm:py-3 pr-4 font-bold text-gray-700 w-[38%] sm:w-[35%] align-top leading-relaxed">
                                        {formatSpecificationKey(d.key)}
                                    </td>
                                    <td className="py-2.5 sm:py-3 pl-2 text-gray-900 w-[62%] sm:w-[65%] align-top leading-relaxed font-normal">
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

    // helper: quantity row
    const renderQuantity = () => (
        selectedVariant && selectedVariant.stock > 0 && (
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 font-medium">Qty:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button onClick={decreaseQuantity} disabled={quantity <= 1}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-4 py-1.5 text-sm font-semibold border-x border-gray-300">{quantity}</span>
                    <button onClick={increaseQuantity} disabled={quantity >= selectedVariant.stock}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>
        )
    );

    // helper: stock badge
    const renderStock = () => (
        selectedVariant && (
            <p className={`text-base font-semibold ${selectedVariant.stock > 0 ? 'text-[#007600]' : 'text-red-600'}`}>
                {selectedVariant.stock > 0
                    ? selectedVariant.stock <= 5 ? `Only ${selectedVariant.stock} left in stock!` : 'In Stock'
                    : 'Currently unavailable'}
            </p>
        )
    );

    return (
        <div className="w-full bg-white min-h-screen">
            {/* Toast */}
            {showToast && toastMessage && (
                <div className="fixed top-6 right-6 z-[99999] px-6 py-4 rounded-lg shadow-lg font-semibold bg-green-100 text-green-800 border border-green-200">
                    {toastMessage}
                </div>
            )}

            {/* Zoom panel – rendered at root level so NO stacking context can bleed over it */}
            {isHovering && (
                <div
                    className="hidden xl:block fixed w-[500px] h-[500px] border-2 border-gray-300 rounded overflow-hidden shadow-2xl bg-white pointer-events-none"
                    style={{ top: zoomPanelPos.top, left: zoomPanelPos.left, zIndex: 99998 }}
                >
                    <div
                        className="relative w-[400%] h-[400%]"
                        style={{ transform: `translate(-${Math.max(0, Math.min(76, zoomPosition.x - 14))}%, -${Math.max(0, Math.min(76, zoomPosition.y - 14))}%)` }}
                    >
                        <Image src={mainImage || imgPlaceholder.src} alt={`${product?.name ?? ''} – Zoomed`} fill className="object-contain" quality={100} unoptimized />
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════
                MOBILE LAYOUT  (Amazon Style - visible only below lg)
            ══════════════════════════════════════════════════════ */}
            <div className="lg:hidden bg-gray-100/50">
                {/* 1. Amazon Top Location / Delivery Strip */}
                <div className="bg-[#232f3e] text-white px-4 py-2 text-xs flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-white flex-shrink-0" />
                        <span className="truncate">
                            Deliver to {user?.name || 'Prince'} - {(user as any)?.city || (user as any)?.address || 'Patiala 140417'}
                        </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 opacity-80 flex-shrink-0" />
                </div>

                {/* 2. Top Brand Header, Title & Rating (Above Image) */}
                <div className="px-4 pt-3 pb-2.5 bg-white border-b border-gray-100">
                    {/* Brand Store Link + Rating Row */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                            {product.brand && (
                                <div className="w-7 h-7 rounded-full bg-[#0c2340] text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 shadow-xs">
                                    {product.brand.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                {product.brand && (
                                    <p className="text-xs font-bold text-gray-900 leading-tight">
                                        {product.brand.name}
                                    </p>
                                )}
                                <button
                                    onClick={() => product.brand ? router.push(`/brands/${getBrandSlug(product.brand)}`) : null}
                                    className="text-[11px] text-[#007185] hover:underline block leading-tight font-medium text-left"
                                >
                                    Visit the store
                                </button>
                            </div>
                        </div>

                        {/* Star Rating on Top Right */}
                        <div
                            className="flex items-center gap-1 cursor-pointer flex-shrink-0"
                            onClick={() => router.push(`/products/${product?.slug || getProductSlug(product) || id}/reviews`)}
                        >
                            <div className="flex text-amber-500 text-xs">
                                {'★'.repeat(Math.round((liveRatingSummary || product.rating_summary)?.average_rating || 4))}
                                {'☆'.repeat(5 - Math.round((liveRatingSummary || product.rating_summary)?.average_rating || 4))}
                            </div>
                            <span className="text-xs text-[#007185] font-semibold">
                                {(liveRatingSummary || product.rating_summary)?.total_reviews || 198}
                            </span>
                        </div>
                    </div>

                    {/* Product Title */}
                    <h1 className="text-[15px] font-normal text-gray-800 leading-snug tracking-tight">
                        {product.name}
                    </h1>

                    {/* Social Proof / Bought tag */}
                    <p className="text-xs font-bold text-gray-800 mt-1">
                        {(product as any).sales_count && (product as any).sales_count > 50 ? `${(product as any).sales_count}+` : '900+'} bought in past month
                    </p>
                </div>

                {/* 3. Product Image Gallery Carousel */}
                <div
                    className="relative w-full bg-white select-none border-b border-gray-100"
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
                                    className="w-full flex-shrink-0 relative aspect-[4/5] sm:aspect-square bg-white cursor-pointer"
                                >
                                    <Image src={img} alt={`slide-${idx}`} fill unoptimized className="object-contain p-4" />
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
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full shadow flex items-center justify-center disabled:opacity-30 z-10"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                                onClick={() => setMobileCarouselIndex(i => Math.min(galleryImages.length - 1, i + 1))}
                                disabled={mobileCarouselIndex === galleryImages.length - 1}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full shadow flex items-center justify-center disabled:opacity-30 z-10"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-700" />
                            </button>
                        </>
                    )}

                    {/* Bottom Toolbar Under Image: Dots in center, Wishlist & Share on right */}
                    <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-white">
                        <div className="w-12" />
                        {/* Dot Indicators */}
                        <div className="flex items-center gap-1.5">
                            {galleryImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMobileCarouselIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-200 ${idx === mobileCarouselIndex ? 'bg-gray-800 w-3.5' : 'bg-gray-300 w-1.5'}`}
                                />
                            ))}
                        </div>
                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleLike}
                                disabled={likesLoading}
                                className="p-1.5 text-gray-600 hover:text-red-500 transition-colors"
                                title="Wishlist"
                            >
                                <Heart className={`w-5 h-5 ${isLiked(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors"
                                title="Share"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. Variant Selectors (Colour / Size) */}
                <div className="px-4 py-3 bg-white border-b border-gray-200">
                    {renderVariantSelectors()}
                </div>

                {/* 5. Amazon-Style Price Box */}
                <div className="px-4 py-3 bg-white space-y-1 border-b border-gray-200">
                    {selectedVariant && variantPricing && (
                        <>
                            <div className="flex items-baseline gap-2 flex-wrap">
                                {variantPricing.hasDiscount && (
                                    <span className="text-[#CC0C39] text-3xl font-light">
                                        -{variantPricing.discountPct}%
                                    </span>
                                )}
                                <span className="text-3xl font-medium text-gray-900 flex items-start">
                                    <span className="text-base font-normal mt-1">₹</span>
                                    {Math.round(variantPricing.sp).toLocaleString('en-IN')}
                                </span>
                            </div>
                            {variantPricing.mrp > variantPricing.sp && (
                                <p className="text-xs text-gray-500">
                                    M.R.P.: <span className="line-through">₹{Math.round(Number(variantPricing.mrp)).toLocaleString('en-IN')}</span>
                                </p>
                            )}
                            <div className="flex items-center gap-1.5 pt-0.5">
                                <span className="inline-flex items-center gap-1 bg-[#007185] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    Zelton Fulfilled
                                </span>
                                <span className="text-xs text-gray-500 font-medium">
                                    GST included
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* 6. Bank Offers & Discounts Carousel Strip */}
                <div className="px-4 py-3 bg-white border-b border-gray-200 space-y-2.5">
                    <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
                        <div className="flex-shrink-0 w-44 p-2.5 rounded-lg border border-gray-200 bg-gray-50/50">
                            <span className="text-[11px] font-bold text-gray-900 block">
                                Buy for ₹{Math.round(Number(variantPricing?.sp || 0)).toLocaleString('en-IN')} + cashback
                            </span>
                            <span className="text-[10px] text-gray-500 mt-1 block">
                                UPI / Credit Card Cashback Available
                            </span>
                        </div>
                        <div className="flex-shrink-0 w-44 p-2.5 rounded-lg border border-gray-200 bg-gray-50/50">
                            <span className="text-[11px] font-bold text-emerald-700 block">
                                Special Discount
                            </span>
                            <span className="text-[10px] text-gray-500 mt-1 block">
                                Flat 5% extra off with pre-paid orders
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#007185] font-medium pt-0.5">
                        <span className="flex items-center gap-1.5">
                            <BadgePercent className="w-4 h-4 text-orange-500" />
                            See all offers & discounts
                        </span>
                        <ChevronRight className="w-4 h-4" />
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-lg">
                        <div className="flex items-center justify-between text-[11px] text-emerald-800 font-semibold mb-1">
                            <span>Free Delivery on orders above ₹699</span>
                            <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">ACTIVE</span>
                        </div>
                        <div className="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                            <div className="w-[85%] h-full bg-emerald-600 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* 6.1 Amazon-Style Benefits Strip (Mobile) */}
                <div className="px-4 bg-white">
                    <AmazonBenefitsStrip variant={selectedVariant} brand={product?.brand} />
                </div>

                {/* 7. Total, Delivery, Quantity & CTA Actions */}
                <div className="px-4 py-4 bg-white space-y-3.5 border-b border-gray-200">
                    {selectedVariant && (
                        <>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-gray-900">
                                    Total: ₹{Math.round((variantPricing ? variantPricing.sp : Number(selectedVariant.sp)) * quantity).toLocaleString('en-IN')}
                                </p>
                                <p className="text-xs text-gray-700">
                                    <span className="font-semibold text-gray-900">FREE delivery</span>{' '}
                                    <span className="font-bold text-gray-900">{getEstimatedDeliveryDate()}</span>.{' '}
                                    <span className="text-[#007185] cursor-pointer">Details</span>
                                </p>
                                <p className="text-xs text-[#007185] flex items-center gap-1 pt-0.5 cursor-pointer">
                                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                    Deliver to {user?.name || 'Prince'} - {(user as any)?.city || (user as any)?.address || 'Patiala 140417'}
                                </p>
                                <p className={`text-base font-bold pt-1 ${selectedVariant.stock > 0 ? 'text-[#007600]' : 'text-red-600'}`}>
                                    {selectedVariant.stock > 0 ? 'In stock' : 'Currently unavailable'}
                                </p>
                            </div>

                            {/* Quantity Selector */}
                            {selectedVariant.stock > 0 && (
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-semibold text-gray-700">Quantity:</label>
                                    <select
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
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
                            <div className="space-y-2 pt-1">
                                <button
                                    onClick={isInCart ? handleViewCart : handleAddToCart}
                                    disabled={selectedVariant.stock === 0 || addingToCart || cartLoading}
                                    className="w-full py-3 rounded-full text-sm font-semibold transition-all bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] shadow-2xs active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {addingToCart || cartLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                                            <span>Adding...</span>
                                        </>
                                    ) : isInCart ? (
                                        <>
                                            <ShoppingCart className="w-4 h-4" />
                                            <span>Go to Cart</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-4 h-4" />
                                            <span>Add to Cart</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        if (!user) { openAuthModal('login'); return; }
                                        if (selectedVariant && selectedVariant.stock > 0)
                                            router.push(`/checkout/single?productId=${product!.id}&variantId=${selectedVariant.id}&quantity=${quantity}`);
                                    }}
                                    disabled={selectedVariant.stock === 0}
                                    className="w-full py-3 rounded-full text-sm font-semibold transition-all bg-[#FFA41C] hover:bg-[#FF8F00] text-white shadow-2xs active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {!user ? 'Login to Buy' : selectedVariant.stock === 0 ? 'Out of Stock' : (
                                        <>
                                            <ShoppingBag className="w-4 h-4" />
                                            <span>Buy Now</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Meta info table */}
                            <div className="grid grid-cols-3 gap-y-1.5 text-xs pt-2">
                                <span className="text-gray-500">Ships from</span>
                                <span className="col-span-2 text-gray-800 font-medium">Zelton Logistics</span>

                                <span className="text-gray-500">Sold by</span>
                                <span className="col-span-2 text-[#007185] font-medium">{product.brand?.name || 'Zelton Retail'}</span>

                                <span className="text-gray-500">Packaging</span>
                                <span className="col-span-2 text-gray-800 font-medium">Ships in product packaging</span>

                                <span className="text-gray-500">Gift options</span>
                                <span className="col-span-2 text-[#007185] font-medium">Available at checkout</span>
                            </div>

                            {/* Save this item / Wishlist Button */}
                            <div className="pt-2">
                                <p className="text-xs font-semibold text-gray-700 mb-1.5">Save this item</p>
                                <button
                                    onClick={handleLike}
                                    disabled={likesLoading}
                                    className="w-full py-2.5 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 rounded-full text-xs font-semibold text-gray-800 transition-colors shadow-2xs"
                                >
                                    {isLiked(product.id) ? '✓ Saved in Wish List' : 'Add to Wish List'}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* 8. "Shop with confidence" Badges + Customer Returns Insight */}
                <div className="px-4 py-4 bg-white border-b border-gray-200 space-y-3">
                    <h3 className="text-sm font-bold text-gray-900">Shop with confidence</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {/* Delivery */}
                        <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                            <Truck className="w-4 h-4 text-[#007185]" />
                            <span>
                                {selectedVariant?.shipping_charges && Number(selectedVariant.shipping_charges) > 0
                                    ? `Delivery: ₹${Number(selectedVariant.shipping_charges).toLocaleString('en-IN')}`
                                    : 'Free Delivery'}
                            </span>
                        </div>
                        {/* COD */}
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <Banknote className={`w-4 h-4 ${selectedVariant?.is_cod_allowed !== false ? 'text-[#007185]' : 'text-amber-600'}`} />
                            <span className={selectedVariant?.is_cod_allowed !== false ? 'text-gray-700' : 'text-amber-700 font-semibold'}>
                                {selectedVariant?.is_cod_allowed !== false ? 'Pay on Delivery' : 'Prepaid Only (No COD)'}
                            </span>
                        </div>
                        {/* Return & Exchange */}
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <RotateCcw className={`w-4 h-4 ${selectedVariant?.is_returnable !== false ? 'text-[#007185]' : 'text-amber-600'}`} />
                            <span className={selectedVariant?.is_returnable !== false ? 'text-gray-700' : 'text-amber-700 font-semibold'}>
                                {selectedVariant?.is_returnable !== false
                                    ? `${selectedVariant?.return_window_days ?? 7} days Return & Exchange`
                                    : 'Non-Returnable'}
                            </span>
                        </div>
                        {/* Delivered */}
                        <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                            <ShieldCheck className="w-4 h-4 text-[#007185]" />
                            <span>Zelton Delivered</span>
                        </div>
                    </div>

                    {/* Customer Returns Insight Box / Non-returnable Notice */}
                    {selectedVariant?.is_returnable !== false ? (
                        <div className="border border-emerald-300 bg-emerald-50/50 rounded-xl p-3 flex items-start gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="w-3 h-3" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900">Customers usually keep this item</p>
                                <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                                    Eligible for return or replacement within {selectedVariant?.return_window_days ?? 7} days of delivery.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="border border-amber-300 bg-amber-50/70 rounded-xl p-3 flex items-start gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">
                                !
                            </div>
                            <div>
                                <p className="text-xs font-bold text-amber-900">Non-Returnable Item</p>
                                <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                                    This item is final sale and cannot be returned or replaced once delivered.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 9. Specifications, Description & Reviews */}
                <div className="px-4 py-5 bg-white space-y-5">
                    {/* About this item */}
                    {features.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-2">About this item</h3>
                            <ul className="space-y-1.5 pl-1">
                                {features.map((feature: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                                        <span className="leading-relaxed">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Product Description */}
                    {product.description && (
                        <div className="border-t border-gray-100 pt-4">
                            <h3 className="text-sm font-bold text-gray-900 mb-2">Product Description</h3>
                            <div
                                className="prose prose-sm max-w-none text-xs text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        </div>
                    )}

                    {/* Features & Specs */}
                    {details.length > 0 && (
                        <div className="pt-2">
                            {renderSpecs()}
                        </div>
                    )}

                    {/* Similar Products */}
                    {similarProducts.length > 0 && (
                        <div className="border-t border-gray-100 pt-5">
                            <h3 className="text-base font-bold text-gray-900 mb-3">Similar Products</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {similarProducts.map((prod) => (
                                    <ProductCard key={prod.id} product={prod} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Customer Reviews Section */}
                    <div id="reviews-section" className="border-t border-gray-100 pt-5">
                        <ProductReviews
                            productId={product.id}
                            onRatingUpdate={() => {
                                fetchLiveRatingSummary(true);
                                window.dispatchEvent(new CustomEvent('reviewUpdated', { detail: { productId: product.id } }));
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                DESKTOP LAYOUT  (visible only on lg+)
            ══════════════════════════════════════════════════════ */}
            <div className="hidden lg:block">
                <div className="w-full max-w-[1720px] mx-auto px-6 xl:px-8 py-6">
                    {/* ── Three-column master layout: [Sticky Images] | [Content + BuyBox] | [Related Products Sidebar] ── */}
                    <div className="flex gap-6 xl:gap-10 2xl:gap-14 items-start">

                        {/* ── LEFT: Sticky Image Column ── */}
                        <div className="w-[420px] xl:w-[480px] 2xl:w-[520px] flex-shrink-0 sticky top-4 self-start">
                            <div className="flex gap-3">
                                {/* Vertical thumbnails */}
                                <div className="flex flex-col gap-2 w-[68px] flex-shrink-0">
                                    {galleryImages.map((img, idx) => (
                                        <div key={idx} onClick={() => setMainImage(img)}
                                            className={`relative w-[68px] h-[68px] border-2 rounded cursor-pointer overflow-hidden transition-all duration-200 ${mainImage === img ? 'border-[#007FFF] shadow-md' : 'border-gray-200 hover:border-[#007FFF]'
                                                }`}>
                                            <Image src={img} alt={`thumb-${idx}`} fill unoptimized className="object-contain p-1" />
                                        </div>
                                    ))}
                                </div>

                                {/* Main image */}
                                <div className="relative flex-1">
                                    <div
                                        className="relative w-full aspect-square rounded overflow-hidden cursor-pointer bg-white"
                                        onMouseMove={handleMouseMove}
                                        onMouseEnter={() => setIsHovering(true)}
                                        onMouseLeave={() => setIsHovering(false)}
                                        onClick={() => {
                                            const activeIdx = galleryImages.indexOf(mainImage || '');
                                            setLightboxIndex(activeIdx >= 0 ? activeIdx : 0);
                                            setIsLightboxOpen(true);
                                        }}
                                    >
                                        <Image src={mainImage || imgPlaceholder.src} alt={product.name} fill unoptimized className="object-contain" />
                                        {isHovering && (
                                            <div className="absolute bg-yellow-100/40 border border-yellow-300 pointer-events-none w-28 h-28"
                                                style={{ left: `${Math.max(0, Math.min(74, zoomPosition.x - 14))}%`, top: `${Math.max(0, Math.min(74, zoomPosition.y - 14))}%` }} />
                                        )}
                                    </div>

                                    {/* Wishlist on image */}
                                    <button onClick={handleLike} disabled={likesLoading}
                                        className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-md border transition-all duration-300 ${isLiked(product.id) ? 'bg-red-50 border-red-300 text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300'
                                            } disabled:opacity-50`}>
                                        <Heart className={`w-5 h-5 ${isLiked(product.id) ? 'fill-current' : ''}`} />
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
                                    {product.brand && <p className="text-sm text-[#007185] hover:text-[#007FFF] cursor-pointer mb-1 font-medium">{product.brand.name}</p>}
                                    <h1 className="text-xl xl:text-2xl font-medium text-gray-900 leading-snug mb-2">{product.name}</h1>

                                    {/* Rating */}
                                    {(liveRatingSummary || product.rating_summary) && (
                                        <div className="flex items-center gap-3 mb-3 relative group">
                                            <div className={`flex items-center gap-1 cursor-pointer ${isUpdatingRating ? 'animate-pulse' : ''}`}
                                                onClick={() => router.push(`/products/${product?.slug || getProductSlug(product) || id}/reviews`)}>
                                                <ProductRatingDisplay
                                                    averageRating={(liveRatingSummary || product.rating_summary)?.average_rating || 0}
                                                    reviewCount={(liveRatingSummary || product.rating_summary)?.total_reviews || 0}
                                                    size="md" showCount={true} className="text-[#007185] hover:text-[#007FFF]"
                                                />
                                                {isUpdatingRating && <div className="w-2 h-2 bg-green-500 rounded-full animate-ping ml-1" />}
                                            </div>
                                            {/* Rating tooltip */}
                                            <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 w-72">
                                                <h4 className="font-semibold text-gray-800 mb-3 text-sm">Customer Ratings</h4>
                                                <div className="space-y-2">
                                                    {[5, 4, 3, 2, 1].map((star) => {
                                                        const cur = liveRatingSummary || product.rating_summary;
                                                        const cnt = cur?.rating_distribution?.[star] || 0;
                                                        const pct = cur?.total_reviews ? (cnt / cur.total_reviews) * 100 : 0;
                                                        return (
                                                            <div key={star} className="flex items-center gap-2 text-xs">
                                                                <span className="w-4 text-gray-600">{star}</span>
                                                                <span className="text-yellow-400">★</span>
                                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                    <div className="bg-yellow-400 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                                                </div>
                                                                <span className="w-8 text-right text-gray-500">{cnt}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                                                    <div className="text-2xl font-bold text-gray-800">{((liveRatingSummary || product.rating_summary)?.average_rating || 0).toFixed(1)}</div>
                                                    <div className="text-xs text-gray-500">out of {(liveRatingSummary || product.rating_summary)?.total_reviews || 0} ratings</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {product.item_code && <p className="text-xs text-gray-500 mb-3">Item Code: <span className="font-medium">{product.item_code}</span></p>}
                                    <div className="border-t border-gray-200 my-3" />

                                    {/* Price */}
                                    <div className="mb-2">{renderPrice(true)}</div>

                                    {/* Amazon-style Services & Benefits Strip (Desktop) */}
                                    <AmazonBenefitsStrip variant={selectedVariant} brand={product?.brand} />

                                    {/* Variants */}
                                    <div className="mb-5">{renderVariantSelectors()}</div>

                                    {/* About this item */}
                                    {features.length > 0 && (
                                        <div className="mb-5">
                                            <h3 className="text-base font-semibold text-gray-900 mb-2">About this item</h3>
                                            <ul className="space-y-1.5 pl-1">
                                                {features.map((feature: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                        <span className="mt-1.5 w-2 h-2 rounded-full bg-gray-500 flex-shrink-0" />
                                                        <span className="leading-relaxed">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {product.description && (
                                        <div className="mb-5">
                                            <h3 className="text-base font-semibold text-gray-900 mb-2">Product Description</h3>
                                            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: product.description }} />
                                        </div>
                                    )}
                                    {/* {selectedVariant && <p className="text-xs text-gray-400 mt-1">SKU: {selectedVariant.sku}</p>} */}
                                </div>

                                {/* Buy Box */}
                                {selectedVariant && (
                                    <div className="w-[230px] xl:w-[250px] flex-shrink-0">
                                        <div className="border border-gray-200 rounded-lg p-4 shadow-sm sticky top-4 bg-white space-y-3">
                                            {/* Price */}
                                            <div>
                                                <div className="flex items-baseline gap-2 flex-wrap">
                                                    {variantPricing && variantPricing.hasDiscount && <span className="text-red-600 text-sm font-semibold">-{variantPricing.discountPct}%</span>}
                                                    <span className="text-2xl font-normal text-gray-900">
                                                        <span className="text-sm align-top leading-6">₹</span>
                                                        {variantPricing ? Math.round(variantPricing.sp).toLocaleString('en-IN') : Math.round(Number(selectedVariant.sp)).toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                                {variantPricing && variantPricing.mrp > variantPricing.sp && (
                                                    <p className="text-xs text-gray-500">M.R.P.: <span className="line-through">₹{Math.round(Number(variantPricing.mrp)).toLocaleString('en-IN')}</span></p>
                                                )}
                                                <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                                                    GST included
                                                </p>
                                            </div>

                                            {/* Delivery, COD & Return Policy Badges (Real-Time Synchronized) */}
                                            {(() => {
                                                const isCod = selectedVariant
                                                    ? ((selectedVariant as any).is_cod_allowed !== undefined
                                                        ? ((selectedVariant as any).is_cod_allowed === true || (selectedVariant as any).is_cod_allowed === 1 || String((selectedVariant as any).is_cod_allowed) === '1' || String((selectedVariant as any).is_cod_allowed) === 'true')
                                                        : (selectedVariant as any).isCodAllowed !== undefined
                                                        ? ((selectedVariant as any).isCodAllowed === true || (selectedVariant as any).isCodAllowed === 1 || String((selectedVariant as any).isCodAllowed) === '1' || String((selectedVariant as any).isCodAllowed) === 'true')
                                                        : true)
                                                    : false;

                                                const isRet = selectedVariant
                                                    ? ((selectedVariant as any).is_returnable !== undefined
                                                        ? ((selectedVariant as any).is_returnable === true || (selectedVariant as any).is_returnable === 1 || String((selectedVariant as any).is_returnable) === '1' || String((selectedVariant as any).is_returnable) === 'true')
                                                        : (selectedVariant as any).isReturnable !== undefined
                                                        ? ((selectedVariant as any).isReturnable === true || (selectedVariant as any).isReturnable === 1 || String((selectedVariant as any).isReturnable) === '1' || String((selectedVariant as any).isReturnable) === 'true')
                                                        : true)
                                                    : false;

                                                const retDays = Number(selectedVariant?.return_window_days ?? (selectedVariant as any)?.returnWindowDays ?? 7);
                                                const shipFee = Number(selectedVariant?.shipping_charges ?? (selectedVariant as any)?.shippingCharges ?? 0);

                                                return (
                                                    <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-gray-700">
                                                        <p className="flex items-center gap-1.5">
                                                            <Truck className="w-3.5 h-3.5 text-[#007185] flex-shrink-0" />
                                                            <span>
                                                                {shipFee > 0
                                                                    ? `Shipping: ₹${shipFee.toLocaleString('en-IN')}`
                                                                    : 'FREE Delivery'}
                                                            </span>
                                                        </p>
                                                        <p className="flex items-center gap-1.5">
                                                            <Banknote className={`w-3.5 h-3.5 flex-shrink-0 ${isCod ? 'text-[#007185]' : 'text-amber-600'}`} />
                                                            <span className={isCod ? 'text-gray-700' : 'text-amber-700 font-semibold'}>
                                                                {isCod ? 'Pay on Delivery' : 'Prepaid Only (No COD)'}
                                                            </span>
                                                        </p>
                                                        <p className="flex items-center gap-1.5">
                                                            <RotateCcw className={`w-3.5 h-3.5 flex-shrink-0 ${isRet && retDays > 0 ? 'text-[#007185]' : 'text-amber-600'}`} />
                                                            <span className={isRet && retDays > 0 ? 'text-gray-700' : 'text-amber-700 font-semibold'}>
                                                                {isRet && retDays > 0
                                                                    ? `${retDays} Days Return & Exchange`
                                                                    : 'Non-Returnable'}
                                                            </span>
                                                        </p>
                                                    </div>
                                                );
                                            })()}

                                            {/* Stock */}
                                            {renderStock()}
                                            {/* Quantity */}
                                            {renderQuantity()}
                                            {/* Buttons */}
                                            {renderActionButtons()}
                                            {/* Divider + wishlist */}
                                            <div className="border-t border-gray-100 pt-2">
                                                <button onClick={handleLike} disabled={likesLoading}
                                                    className="flex items-center gap-2 w-full text-left text-xs text-gray-600 hover:text-red-500 transition-colors disabled:opacity-50">
                                                    <Heart className={`w-4 h-4 flex-shrink-0 ${isLiked(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                                    {isLiked(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                                </button>
                                            </div>
                                            {!user && (
                                                <p className="text-xs text-gray-500 text-center">
                                                    <button onClick={() => openAuthModal('login')} className="text-[#007185] hover:underline font-medium">Sign in</button> to order
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── Specs (inside middle column) ── */}
                            {details.length > 0 && (
                                <div className="mt-10">{renderSpecs()}</div>
                            )}

                        </div>{/* end middle column */}

                        {/* ── RIGHT: Related Products Scrollable Column (No header, no outer borders, standard ProductCard size, hidden scrollbar) ── */}
                        {similarProducts.length > 0 && (
                            <div className="hidden xl:block w-[240px] xl:w-[260px] 2xl:w-[275px] flex-shrink-0 sticky top-4 self-start pl-2 xl:pl-6">
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
                                            <Loader2 className="w-5 h-5 animate-spin text-[#007FFF] mx-auto" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* ── 1. Similar Products (Full Width Row - No Heading) ── */}
                    {similarProducts.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
                                {similarProducts.map((prod) => (
                                    <ProductCard key={prod.id} product={prod} />
                                ))}
                            </div>

                            {/* Sentinel element for automatic infinite scroll on scroll down */}
                            <div ref={observerTargetRef} className="py-6 text-center min-h-[50px] flex items-center justify-center">
                                {loadingSimilar && (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-600 font-medium shadow-sm">
                                        <Loader2 className="w-4 h-4 animate-spin text-[#007FFF]" />
                                        <span>Loading more products...</span>
                                    </div>
                                )}
                            </div>

                            {/* All Similar Products Loaded End Indicator */}
                            {!similarPagination.has_more && similarProducts.length > 0 && !loadingSimilar && (
                                <div className="flex items-center justify-center pb-6 text-xs md:text-sm text-gray-400 font-medium animate-in fade-in duration-200">
                                    <span className="bg-white px-4 py-1.5 rounded-full border border-gray-200 text-gray-600 font-semibold shadow-xs flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>All {similarProducts.length} related products loaded</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── 2. Customer Reviews Section (Bottom of Page - Full Width) ── */}
                    <div className="mt-14 pt-10 border-t border-gray-200" id="reviews-section">
                        <ProductReviews productId={product.id} productSlug={product?.slug || getProductSlug(product)} onRatingUpdate={() => {
                            fetchLiveRatingSummary(true);
                            window.dispatchEvent(new CustomEvent('reviewUpdated', { detail: { productId: product.id } }));
                        }} />
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                FLIPKART-STYLE FULLSCREEN LIGHTBOX IMAGE SLIDER MODAL
            ══════════════════════════════════════════════════════ */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-[99999] bg-white flex flex-col justify-between select-none animate-fadeIn">
                    {/* Top Header Bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700 flex items-center gap-2 text-sm font-medium"
                            title="Close (Esc)"
                        >
                            <X className="w-6 h-6 text-gray-800" />
                            <span className="hidden sm:inline font-semibold text-gray-800">Close</span>
                        </button>

                        <div className="text-center text-sm font-semibold text-gray-800 tracking-wide max-w-md truncate">
                            {product.name} ({lightboxIndex + 1} / {galleryImages.length})
                        </div>

                        <div className="w-16" />
                    </div>

                    {/* Main Image Slider View */}
                    <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-white">
                        {/* Prev Button */}
                        {galleryImages.length > 1 && (
                            <button
                                onClick={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                                className="absolute left-4 sm:left-10 z-10 w-12 h-12 bg-white/90 hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110"
                                title="Previous Image (Left Arrow)"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}

                        {/* Current Image */}
                        <div className="relative w-full h-full max-w-5xl max-h-[78vh]">
                            <Image
                                src={galleryImages[lightboxIndex] || imgPlaceholder.src}
                                alt={`Full view ${lightboxIndex + 1}`}
                                fill
                                unoptimized
                                className="object-contain transition-all duration-300"
                            />
                        </div>

                        {/* Next Button */}
                        {galleryImages.length > 1 && (
                            <button
                                onClick={() => setLightboxIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
                                className="absolute right-4 sm:right-10 z-10 w-12 h-12 bg-white/90 hover:bg-gray-100 text-gray-800 border border-gray-200 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110"
                                title="Next Image (Right Arrow)"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Bottom Pagination Bar (Flipkart Style Dots + Thumbnails) */}
                    <div className="py-4 px-6 border-t border-gray-100 bg-white flex flex-col items-center gap-3">
                        {/* Pagination Dots */}
                        <div className="flex items-center gap-2">
                            {galleryImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setLightboxIndex(idx)}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${idx === lightboxIndex ? 'bg-gray-900 w-6' : 'bg-gray-300 w-2.5 hover:bg-gray-400'
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
                                        className={`relative w-14 h-14 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${idx === lightboxIndex ? 'border-[#007FFF] scale-105 shadow-md' : 'border-gray-200 opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <Image src={img} alt={`thumb-${idx}`} fill unoptimized className="object-contain p-1" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Centered Scroll To Top Button (Icon only in Grey Theme) */}
            <button
                type="button"
                onClick={scrollToTop}
                aria-label="Scroll to top"
                className={`fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 p-3 sm:p-3.5 rounded-full bg-gray-800/90 hover:bg-gray-900 text-white shadow-lg hover:shadow-2xl backdrop-blur-md border border-gray-700/50 transition-all duration-300 transform active:scale-90 flex items-center justify-center group select-none ${showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'
                    }`}
                title="Back to Top"
            >
                <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:-translate-y-1" />
            </button>
        </div>
    );
};

export default ProductPage;
