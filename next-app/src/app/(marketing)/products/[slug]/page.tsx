"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import imgPlaceholder from "@/public/imagePlaceholder.png";
import axios from "../../../../../utils/axios";
import { ProductDetail, ProductVariant } from "@/common/interface";
import {
    ChevronDown,
    ChevronUp,
    Package,
    ShoppingCart,
    Plus,
    Minus,
    Heart,
    ShoppingBag,
    X,
    ChevronLeft,
    ChevronRight,
    Share2,
    MapPin,
    ShieldCheck,
    Check,
    Truck,
    RotateCcw,
    BadgePercent,
    Banknote,
    Loader2,
    Award,
    Lock,
    Sparkles,
    CheckCircle2
} from "lucide-react";
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

/**
 * SVastra Atelier Assurance Strip
 * Architectural luxury reassurance badges matching the brand theme
 */
const SvastraAssuranceStrip = ({
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
            title: `${returnDays} Days Exchange`,
            subtitle: 'Hassle-free atelier exchange',
            icon: <RotateCcw className="w-4 h-4 text-primary" />,
        });
    }

    // 2. Pay on Delivery
    if (isCodAllowed) {
        benefits.push({
            id: 'cod',
            title: 'Pay on Delivery',
            subtitle: 'Cash & UPI at doorstep',
            icon: <Banknote className="w-4 h-4 text-on-surface" />,
        });
    }

    // 3. Free Delivery
    if (isFreeDelivery) {
        benefits.push({
            id: 'free_delivery',
            title: 'Complimentary Shipping',
            subtitle: 'Insured express transit',
            icon: <Truck className="w-4 h-4 text-on-surface" />,
        });
    } else {
        benefits.push({
            id: 'delivery',
            title: `Shipping ₹${shippingCharges}`,
            subtitle: 'Insured express transit',
            icon: <Truck className="w-4 h-4 text-on-surface" />,
        });
    }

    // 4. Brand Assured
    if (brand?.name) {
        benefits.push({
            id: 'brand',
            title: `${brand.name} Assured`,
            subtitle: '100% authentic handloom',
            icon: <Award className="w-4 h-4 text-accent-ochre" />,
        });
    } else {
        benefits.push({
            id: 'craft',
            title: 'Heritage Craft',
            subtitle: 'Artisan masterwork',
            icon: <Award className="w-4 h-4 text-accent-ochre" />,
        });
    }

    // 5. Secure transaction
    benefits.push({
        id: 'secure',
        title: 'Atelier Guarantee',
        subtitle: 'Safe encrypted checkout',
        icon: <Lock className="w-4 h-4 text-on-surface" />,
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
        <div className="relative border-y border-border-line py-3.5 my-5 bg-surface-subtle/70">
            <div className="relative flex items-center">
                {/* Left Navigation Button */}
                {canScrollLeft && (
                    <button
                        type="button"
                        onClick={() => handleScroll('left')}
                        className="flex absolute -left-2 top-1/2 -translate-y-1/2 w-7 h-8 bg-pure-white hover:bg-surface-ivory border border-border-line items-center justify-center text-on-surface transition-all z-20 cursor-pointer shadow-none"
                        aria-label="Scroll benefits left"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}

                {/* Benefits List */}
                <div
                    ref={scrollRef}
                    className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth w-full px-1 select-none"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {benefits.map((b) => (
                        <div
                            key={b.id}
                            className="flex items-center gap-2.5 flex-shrink-0 bg-pure-white border border-border-line px-3 py-2 select-none group hover:border-on-surface/40 transition-colors min-w-[140px] sm:min-w-[170px]"
                        >
                            <div className="w-8 h-8 bg-surface-ivory border border-border-line flex items-center justify-center flex-shrink-0">
                                {b.icon}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-on-surface leading-tight truncate">
                                    {b.title}
                                </p>
                                <p className="text-[10px] text-body-slate tracking-normal leading-tight truncate mt-0.5">
                                    {b.subtitle}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Navigation Button */}
                {canScrollRight && (
                    <button
                        type="button"
                        onClick={() => handleScroll('right')}
                        className="flex absolute -right-2 top-1/2 -translate-y-1/2 w-7 h-8 bg-pure-white hover:bg-surface-ivory border border-border-line items-center justify-center text-on-surface transition-all z-20 cursor-pointer shadow-none"
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
            <div className="min-h-[70vh] bg-surface flex items-center justify-center py-20">
                <div className="max-w-md mx-auto px-6 text-center">
                    <div className="w-20 h-20 bg-surface-ivory border border-border-line mx-auto mb-6 flex items-center justify-center">
                        <Package className="w-10 h-10 text-body-slate" />
                    </div>
                    <span className="label-caps text-primary block mb-2">Collection Archive</span>
                    <h1 className="display-section text-2xl sm:text-3xl text-on-surface mb-3">Piece Unavailable</h1>
                    <p className="text-body-slate text-sm sm:text-base mb-8 leading-relaxed">
                        This curated piece has either been archived or is no longer part of our active releases.
                    </p>
                    <Link
                        href="/products"
                        className="sv-btn-primary inline-flex"
                    >
                        Explore Live Collections →
                    </Link>
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
                        <div key={attrId} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="label-caps text-body-slate">
                                    {ia.attribute?.name || 'Option'}:{' '}
                                    <span className="text-on-surface font-bold">{selectedOptions[attrId] || 'Select'}</span>
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 sm:gap-2.5">
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
                                                className={`group relative flex flex-col items-center justify-between border transition-all duration-150 select-none overflow-hidden bg-pure-white w-[68px] sm:w-[76px] p-1 ${
                                                    isSelected
                                                        ? 'border-2 border-primary ring-1 ring-primary/30 bg-surface-ivory/60'
                                                        : isDisabled
                                                        ? 'border-dashed border-border-line bg-surface-ivory/40 opacity-40 !cursor-not-allowed'
                                                        : 'border-border-line hover:border-on-surface'
                                                }`}
                                            >
                                                {/* Swatch Image */}
                                                <div className="w-full aspect-[3/4] flex items-center justify-center overflow-hidden bg-surface-ivory p-0.5">
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
                                                        <div className="w-full h-full flex items-center justify-center bg-surface-ivory text-[10px] font-bold text-on-surface uppercase px-1 text-center">
                                                            {val}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Price / Label Bar */}
                                                <div className="w-full pt-1 text-center border-t border-border-line mt-1">
                                                    {optionPricing ? (
                                                        <span className={`text-[10px] font-bold ${isSelected ? 'text-primary' : 'text-on-surface'} block truncate`}>
                                                            ₹{Math.round(optionPricing.sp).toLocaleString('en-IN')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-medium text-body-slate uppercase truncate block">
                                                            {val}
                                                        </span>
                                                    )}
                                                </div>

                                                {isDisabled && (
                                                    <svg
                                                        className="absolute inset-0 w-full h-full pointer-events-none text-primary/70"
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
                                            className={`relative overflow-hidden px-3.5 py-2 border text-xs font-semibold uppercase tracking-wider transition-all duration-150 select-none ${
                                                isSelected
                                                    ? 'border-primary bg-primary text-surface font-bold'
                                                    : isDisabled
                                                    ? 'border-dashed border-border-line bg-surface-ivory/30 text-body-slate/40 !cursor-not-allowed'
                                                    : 'border-border-line bg-pure-white text-on-surface hover:border-on-surface'
                                            }`}
                                        >
                                            <span className={isDisabled ? 'opacity-40 pointer-events-none' : ''}>{val}</span>

                                            {isDisabled && (
                                                <svg
                                                    className="absolute inset-0 w-full h-full pointer-events-none text-primary/60"
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

    // Shared SVastra action buttons (Add to Bag / Buy Now)
    const renderActionButtons = (fullWidth = false) => (
        selectedVariant && (
            <div className={`flex flex-col gap-2.5 ${fullWidth ? 'w-full' : ''}`}>
                <button
                    onClick={isInCart ? handleViewCart : handleAddToCart}
                    disabled={selectedVariant.stock === 0 || addingToCart || cartLoading}
                    className="sv-btn-primary w-full py-3.5 sm:py-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {addingToCart || cartLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                            <span>Reserving...</span>
                        </>
                    ) : isInCart ? (
                        <>
                            <ShoppingCart className="w-4 h-4" />
                            <span>View Atelier Bag →</span>
                        </>
                    ) : selectedVariant.stock > 0 ? (
                        <>
                            <ShoppingCart className="w-4 h-4" />
                            <span>Add to Bag · Reserve Drape</span>
                        </>
                    ) : 'Currently Archived'}
                </button>

                <button
                    onClick={() => {
                        if (!user) { openAuthModal('login'); return; }
                        if (selectedVariant && selectedVariant.stock > 0)
                            router.push(`/checkout/single?productId=${product!.id}&variantId=${selectedVariant.id}&quantity=${quantity}`);
                    }}
                    disabled={selectedVariant.stock === 0}
                    className="sv-btn-outline w-full py-3.5 sm:py-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {!user ? 'Login to Order' : selectedVariant.stock === 0 ? 'Archived' : (
                        <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Instant Atelier Checkout</span>
                        </>
                    )}
                </button>
            </div>
        )
    );

    const renderPrice = (large = false) => (
        selectedVariant && variantPricing && (
            <div className="space-y-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                    <span className={`font-bold text-on-surface ${large ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
                        ₹{Math.round(variantPricing.sp).toLocaleString('en-IN')}
                    </span>
                    {variantPricing.mrp > variantPricing.sp && (
                        <span className="text-sm sm:text-base text-body-slate line-through">
                            ₹{Math.round(Number(variantPricing.mrp)).toLocaleString('en-IN')}
                        </span>
                    )}
                    {variantPricing.hasDiscount && (
                        <span className="bg-primary text-surface text-[11px] font-bold px-2 py-0.5 uppercase tracking-wider">
                            {variantPricing.discountPct}% Off
                        </span>
                    )}
                </div>
                {variantPricing.hasDiscount && large && (
                    <p className="text-xs text-primary font-semibold tracking-wide">
                        You save ₹{Math.round(variantPricing.savingsAmount).toLocaleString('en-IN')} on this piece
                    </p>
                )}
                <p className="label-caps text-body-slate text-[10px] pt-0.5">
                    Price inclusive of all taxes · Handcrafted in India
                </p>
            </div>
        )
    );

    // Features & Specs accordion table
    const renderSpecs = () => (
        details.length > 0 && (
            <div className="border-t border-border-line w-full">
                <button
                    type="button"
                    onClick={() => setIsSpecsOpen(!isSpecsOpen)}
                    className="w-full flex items-center justify-between py-4 bg-transparent hover:bg-surface-subtle transition-colors text-left select-none cursor-pointer border-b border-border-line"
                >
                    <span className="label-caps text-on-surface text-sm sm:text-base font-bold">
                        Craftsmanship &amp; Specifications
                    </span>
                    <ChevronDown className={`w-4 h-4 text-on-surface transition-transform duration-300 ${isSpecsOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${isSpecsOpen ? 'max-h-[3000px] opacity-100 py-3' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <table className="w-full text-xs sm:text-sm text-left border-collapse">
                        <tbody>
                            {details.map((d: any, idx: number) => (
                                <tr key={idx} className="border-b border-border-line hover:bg-surface-ivory/30 transition-colors">
                                    <td className="py-2.5 sm:py-3 pr-4 label-caps text-body-slate w-[38%] sm:w-[35%] align-top">
                                        {formatSpecificationKey(d.key)}
                                    </td>
                                    <td className="py-2.5 sm:py-3 pl-2 text-on-surface w-[62%] sm:w-[65%] align-top font-medium">
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
            <div className="flex items-center justify-between py-1">
                <span className="label-caps text-body-slate">Quantity:</span>
                <div className="flex items-center border border-border-line bg-pure-white">
                    <button
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        className="px-3 py-2 text-on-surface hover:bg-surface-ivory disabled:opacity-30 transition-colors"
                        aria-label="Decrease quantity"
                    >
                        <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 py-2 text-xs font-bold text-on-surface border-x border-border-line min-w-[40px] text-center">
                        {quantity}
                    </span>
                    <button
                        onClick={increaseQuantity}
                        disabled={quantity >= selectedVariant.stock}
                        className="px-3 py-2 text-on-surface hover:bg-surface-ivory disabled:opacity-30 transition-colors"
                        aria-label="Increase quantity"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        )
    );

    // Stock indicator badge
    const renderStock = () => (
        selectedVariant && (
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 ${selectedVariant.stock > 0 ? 'bg-accent-ochre' : 'bg-primary'}`} />
                <span className="label-caps text-on-surface">
                    {selectedVariant.stock > 0
                        ? selectedVariant.stock <= 5 ? `Only ${selectedVariant.stock} Pieces Left in Collection` : 'In Collection · Ready to Dispatch'
                        : 'Made to Order / Archived'}
                </span>
            </div>
        )
    );

    return (
        <div className="w-full bg-surface min-h-screen text-on-surface">
            {/* SVastra Floating Toast Notification */}
            {showToast && toastMessage && (
                <div className="fixed top-6 right-6 z-[99999] px-6 py-4 bg-surface-dark text-surface border border-border-line-dark shadow-2xl label-caps tracking-wider animate-fade-in-up flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-accent-ochre" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Desktop Zoom panel */}
            {isHovering && (
                <div
                    className="hidden xl:block fixed w-[520px] h-[520px] border border-border-line bg-pure-white shadow-2xl pointer-events-none overflow-hidden"
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

            {/* ── Breadcrumb Navigation Strip ── */}
            <div className="w-full border-b border-border-line bg-surface-subtle/50">
                <div className="max-w-site mx-auto site-pad py-3">
                    <nav className="flex items-center gap-2 text-xs flex-wrap">
                        <Link href="/" className="label-caps text-body-slate hover:text-primary transition-colors">
                            Home
                        </Link>
                        <span className="text-body-slate/50">/</span>
                        <Link href="/products" className="label-caps text-body-slate hover:text-primary transition-colors">
                            Collections
                        </Link>
                        {product.brand && (
                            <>
                                <span className="text-body-slate/50">/</span>
                                <Link href={`/brands/${getBrandSlug(product.brand)}`} className="label-caps text-body-slate hover:text-primary transition-colors">
                                    {product.brand.name}
                                </Link>
                            </>
                        )}
                        <span className="text-body-slate/50">/</span>
                        <span className="label-caps text-on-surface truncate max-w-[200px] sm:max-w-xs font-bold">
                            {product.name}
                        </span>
                    </nav>
                </div>
            </div>

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
                                <span className="text-xs font-bold text-on-surface">
                                    {((liveRatingSummary || product.rating_summary)?.average_rating || 0).toFixed(1)}
                                </span>
                                <span className="text-accent-ochre text-xs">★</span>
                                <span className="text-[10px] text-body-slate">
                                    ({(liveRatingSummary || product.rating_summary)?.total_reviews})
                                </span>
                            </div>
                        )}
                    </div>

                    <h1 className="display-section text-xl sm:text-2xl text-on-surface leading-snug">
                        {product.name}
                    </h1>

                    {product.item_code && (
                        <p className="label-caps text-body-slate mt-1.5 text-[10px]">
                            Item Code: {product.item_code}
                        </p>
                    )}
                </div>

                {/* 2. Image Carousel */}
                <div
                    className="relative w-full bg-surface-ivory select-none border-b border-border-line"
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
                                    className="w-full flex-shrink-0 relative aspect-[3/4] bg-surface-ivory cursor-pointer"
                                >
                                    <Image src={img} alt={`SVastra Drape View ${idx + 1}`} fill unoptimized className="object-cover" />
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
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-surface/90 border border-border-line flex items-center justify-center disabled:opacity-30 z-10 text-on-surface"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setMobileCarouselIndex(i => Math.min(galleryImages.length - 1, i + 1))}
                                disabled={mobileCarouselIndex === galleryImages.length - 1}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-surface/90 border border-border-line flex items-center justify-center disabled:opacity-30 z-10 text-on-surface"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </>
                    )}

                    {/* Bottom Toolbar: Dots, Wishlist & Share */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-t border-border-line">
                        <div className="flex items-center gap-1.5">
                            {galleryImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMobileCarouselIndex(idx)}
                                    className={`h-1 transition-all duration-200 ${idx === mobileCarouselIndex ? 'bg-primary w-5' : 'bg-on-surface/20 w-2'}`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleLike}
                                disabled={likesLoading}
                                className="p-1 text-on-surface hover:text-primary transition-colors"
                                title="Add to Wishlist"
                            >
                                <Heart className={`w-5 h-5 ${isLiked(product.id) ? 'fill-primary text-primary' : ''}`} />
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-1 text-on-surface hover:text-primary transition-colors"
                                title="Share Drape"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Price Block */}
                <div className="px-4 sm:px-6 py-4 bg-surface border-b border-border-line">
                    {renderPrice(true)}
                </div>

                {/* 4. Variant Selectors */}
                <div className="px-4 sm:px-6 py-4 bg-surface border-b border-border-line">
                    {renderVariantSelectors()}
                </div>

                {/* 5. Assurance Strip */}
                <div className="px-4 sm:px-6 bg-surface">
                    <SvastraAssuranceStrip variant={selectedVariant} brand={product?.brand} />
                </div>

                {/* 6. Buy Box & Actions */}
                <div className="px-4 sm:px-6 py-4 bg-pure-white border-b border-border-line space-y-4">
                    {renderStock()}
                    {renderQuantity()}
                    {renderActionButtons(true)}
                </div>

                {/* 7. Craft Details & Specifications */}
                <div className="px-4 sm:px-6 py-6 bg-surface space-y-6">
                    {/* Features List */}
                    {features.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="label-caps text-on-surface text-sm font-bold">Artisan Highlights</h3>
                            <ul className="space-y-2">
                                {features.map((feature: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-body-slate leading-relaxed">
                                        <span className="mt-1.5 w-1.5 h-1.5 bg-primary flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Description */}
                    {product.description && (
                        <div className="border-t border-border-line pt-5">
                            <h3 className="label-caps text-on-surface text-sm font-bold mb-3">About the Drape</h3>
                            <div
                                className="prose prose-slate max-w-none text-xs sm:text-sm text-body-slate leading-relaxed"
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
                        <div className="border-t border-border-line pt-6">
                            <span className="label-caps text-primary block mb-1">Curated Pairings</span>
                            <h3 className="display-section text-lg sm:text-xl text-on-surface mb-4">You May Also Admire</h3>
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                {similarProducts.slice(0, 4).map((prod) => (
                                    <ProductCard key={prod.id} product={prod} compact />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Customer Reviews Section */}
                    <div id="reviews-section" className="border-t border-border-line pt-6">
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
            <div className="hidden lg:block">
                <div className="max-w-site mx-auto site-pad py-8 lg:py-10">
                    {/* Master Grid: [Left: Sticky Gallery] | [Middle: Product Details] | [Right: Atelier Buy Box] */}
                    <div className="grid grid-cols-12 gap-8 xl:gap-10 items-start">

                        {/* ── LEFT: Sticky Image Column (5 Cols) ── */}
                        <div className="col-span-6 xl:col-span-5 sticky top-24 self-start">
                            <div className="flex gap-4">
                                {/* Vertical Thumbnails */}
                                <div className="flex flex-col gap-2.5 w-[64px] xl:w-[72px] flex-shrink-0">
                                    {galleryImages.map((img, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setMainImage(img)}
                                            className={`relative w-full aspect-[3/4] bg-surface-ivory border cursor-pointer overflow-hidden transition-all duration-200 ${
                                                mainImage === img
                                                    ? 'border-2 border-primary ring-1 ring-primary/20'
                                                    : 'border-border-line hover:border-on-surface/50'
                                            }`}
                                        >
                                            <Image src={img} alt={`Thumbnail ${idx + 1}`} fill unoptimized className="object-cover" />
                                        </div>
                                    ))}
                                </div>

                                {/* Main Stage Image */}
                                <div className="relative flex-1">
                                    <div
                                        className="relative w-full aspect-[3/4] bg-surface-ivory border border-border-line overflow-hidden cursor-crosshair group"
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
                                            className="object-cover transition-opacity duration-300"
                                        />

                                        {/* Discount Badge */}
                                        {discountPct > 0 && (
                                            <span className="absolute top-4 left-4 z-10 bg-primary text-surface text-[11px] font-bold px-2.5 py-1 uppercase tracking-wider">
                                                {discountPct}% Off
                                            </span>
                                        )}

                                        {/* Lens overlay */}
                                        {isHovering && (
                                            <div
                                                className="absolute bg-surface-dark/10 border border-primary pointer-events-none w-32 h-32"
                                                style={{
                                                    left: `${Math.max(0, Math.min(72, zoomPosition.x - 14))}%`,
                                                    top: `${Math.max(0, Math.min(72, zoomPosition.y - 14))}%`
                                                }}
                                            />
                                        )}

                                        <span className="absolute bottom-3 right-3 z-10 bg-surface-dark/70 text-surface text-[10px] font-semibold tracking-wider uppercase px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Click to Expand View
                                        </span>
                                    </div>

                                    {/* Floating Wishlist Button */}
                                    <button
                                        onClick={handleLike}
                                        disabled={likesLoading}
                                        className="absolute top-4 right-4 z-10 p-2.5 bg-pure-white/95 hover:bg-pure-white border border-border-line text-on-surface hover:text-primary transition-all duration-200"
                                        title={isLiked(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                                        aria-label="Wishlist"
                                    >
                                        <Heart className={`w-4 h-4 ${isLiked(product.id) ? 'fill-primary text-primary' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── MIDDLE: Product Details & Specifications (4 Cols) ── */}
                        <div className="col-span-6 xl:col-span-4 space-y-6">
                            {/* Brand & Title */}
                            <div>
                                {product.brand && (
                                    <Link
                                        href={`/brands/${getBrandSlug(product.brand)}`}
                                        className="label-caps text-primary hover:text-on-surface transition-colors inline-block mb-1.5"
                                    >
                                        {product.brand.name}
                                    </Link>
                                )}
                                <h1 className="display-section text-2xl xl:text-3xl text-on-surface leading-tight">
                                    {product.name}
                                </h1>

                                {/* Rating Row */}
                                {(((liveRatingSummary || product.rating_summary)?.total_reviews || 0) > 0 && ((liveRatingSummary || product.rating_summary)?.average_rating || 0) > 0) && (
                                    <div className="flex items-center gap-3 mt-3 relative group">
                                        <div
                                            className={`flex items-center gap-1.5 cursor-pointer bg-surface-ivory px-2.5 py-1 border border-border-line ${isUpdatingRating ? 'animate-pulse' : ''}`}
                                            onClick={() => router.push(`/products/${product?.slug || getProductSlug(product) || id}/reviews`)}
                                        >
                                            <ProductRatingDisplay
                                                averageRating={(liveRatingSummary || product.rating_summary)?.average_rating || 0}
                                                reviewCount={(liveRatingSummary || product.rating_summary)?.total_reviews || 0}
                                                size="sm"
                                                showCount={true}
                                                className="text-on-surface"
                                            />
                                        </div>
                                    </div>
                                )}

                                {product.item_code && (
                                    <p className="label-caps text-body-slate mt-2 text-[10px]">
                                        Code: <span className="text-on-surface font-semibold">{product.item_code}</span>
                                    </p>
                                )}
                            </div>

                            <div className="border-t border-border-line pt-4">
                                {renderPrice(true)}
                            </div>

                            {/* SVastra Assurance Strip */}
                            <SvastraAssuranceStrip variant={selectedVariant} brand={product?.brand} />

                            {/* Variant Selectors */}
                            <div>
                                {renderVariantSelectors()}
                            </div>

                            {/* About the Drape / Features */}
                            {features.length > 0 && (
                                <div className="border-t border-border-line pt-5 space-y-2.5">
                                    <span className="label-caps text-on-surface font-bold text-xs block">Artisan Highlights</span>
                                    <ul className="space-y-1.5">
                                        {features.map((feature: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs text-body-slate leading-relaxed">
                                                <span className="mt-1.5 w-1.5 h-1.5 bg-primary flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Description */}
                            {product.description && (
                                <div className="border-t border-border-line pt-5 space-y-2">
                                    <span className="label-caps text-on-surface font-bold text-xs block">About the Drape</span>
                                    <div
                                        className="prose prose-slate max-w-none text-xs text-body-slate leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                </div>
                            )}

                            {/* Specs Table */}
                            {details.length > 0 && (
                                <div className="pt-2">
                                    {renderSpecs()}
                                </div>
                            )}
                        </div>

                        {/* ── RIGHT: SVastra Atelier Reserve Buy Box (3 Cols) ── */}
                        <div className="col-span-12 xl:col-span-3 sticky top-24 self-start">
                            <div className="sv-product-card bg-pure-white border border-border-line p-5 space-y-4">
                                {/* Price in Box */}
                                <div className="border-b border-border-line pb-3">
                                    <span className="label-caps text-body-slate text-[10px] block mb-1">Edition Price</span>
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                        <span className="text-2xl font-bold text-on-surface">
                                            ₹{variantPricing ? Math.round(variantPricing.sp).toLocaleString('en-IN') : Math.round(Number(selectedVariant?.sp || 0)).toLocaleString('en-IN')}
                                        </span>
                                        {variantPricing && variantPricing.mrp > variantPricing.sp && (
                                            <span className="text-xs text-body-slate line-through">
                                                ₹{Math.round(Number(variantPricing.mrp)).toLocaleString('en-IN')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-body-slate mt-0.5 font-medium">
                                        GST included · Free express transit
                                    </p>
                                </div>

                                {/* Delivery & Return Summary */}
                                <div className="space-y-2 text-xs text-body-slate">
                                    <p className="flex items-center gap-2">
                                        <Truck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                        <span>
                                            {selectedVariant?.shipping_charges && Number(selectedVariant.shipping_charges) > 0
                                                ? `Shipping: ₹${Number(selectedVariant.shipping_charges).toLocaleString('en-IN')}`
                                                : 'Complimentary Delivery'}
                                        </span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <RotateCcw className="w-3.5 h-3.5 text-on-surface flex-shrink-0" />
                                        <span>
                                            {selectedVariant?.is_returnable !== false
                                                ? `${selectedVariant?.return_window_days ?? 7} Days Atelier Exchange`
                                                : 'Archived / Non-Returnable'}
                                        </span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <ShieldCheck className="w-3.5 h-3.5 text-accent-ochre flex-shrink-0" />
                                        <span>100% Authentic Handloom</span>
                                    </p>
                                </div>

                                {/* Stock Badge */}
                                <div className="pt-2 border-t border-border-line">
                                    {renderStock()}
                                </div>

                                {/* Quantity Stepper */}
                                {renderQuantity()}

                                {/* Action CTA Buttons */}
                                {renderActionButtons(true)}

                                {/* Wishlist & Share link in Box */}
                                <div className="pt-2 border-t border-border-line flex items-center justify-between">
                                    <button
                                        onClick={handleLike}
                                        disabled={likesLoading}
                                        className="label-caps text-body-slate hover:text-primary transition-colors flex items-center gap-1.5 text-[10px]"
                                    >
                                        <Heart className={`w-3.5 h-3.5 ${isLiked(product.id) ? 'fill-primary text-primary' : ''}`} />
                                        <span>{isLiked(product.id) ? 'In Wishlist' : 'Add to Wishlist'}</span>
                                    </button>

                                    <button
                                        onClick={handleShare}
                                        className="label-caps text-body-slate hover:text-on-surface transition-colors flex items-center gap-1.5 text-[10px]"
                                    >
                                        <Share2 className="w-3.5 h-3.5" />
                                        <span>Share Drape</span>
                                    </button>
                                </div>

                                {!user && (
                                    <p className="text-[11px] text-body-slate text-center pt-1 border-t border-border-line">
                                        <button onClick={() => openAuthModal('login')} className="text-primary font-bold hover:underline">
                                            Sign in
                                        </button> to unlock concierge perks
                                    </p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* ── Curated Releases / Similar Products Section (Full Width) ── */}
                    {similarProducts.length > 0 && (
                        <div className="mt-16 pt-12 border-t border-border-line">
                            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border-line pb-4 mb-8 gap-4">
                                <div>
                                    <span className="label-caps text-primary block mb-1">Curated Releases</span>
                                    <h2 className="display-section text-2xl sm:text-3xl text-on-surface">
                                        You May Also Admire
                                    </h2>
                                    <p className="text-sm text-body-slate mt-1">
                                        Signature masterworks from the live collection.
                                    </p>
                                </div>
                                <Link href="/products" className="label-caps text-body-slate hover:text-primary transition-colors">
                                    View Full Collection →
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-5">
                                {similarProducts.map((prod) => (
                                    <ProductCard key={prod.id} product={prod} />
                                ))}
                            </div>

                            {/* Sentinel for infinite scroll */}
                            <div ref={observerTargetRef} className="py-6 text-center min-h-[50px] flex items-center justify-center">
                                {loadingSimilar && (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-ivory border border-border-line text-xs font-semibold label-caps text-body-slate">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                        <span>Curating more pieces...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Customer Reviews Section (Bottom Full Width) ── */}
                    <div className="mt-14 pt-10 border-t border-border-line" id="reviews-section">
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
                SVastra Fullscreen Lightbox Modal
            ══════════════════════════════════════════════════════ */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-[99999] bg-surface-dark flex flex-col justify-between select-none animate-fadeIn text-surface">
                    {/* Top Header Bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border-line-dark bg-surface-dark">
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="p-2 text-surface hover:text-accent-ochre transition-colors flex items-center gap-2 label-caps text-xs"
                            title="Close (Esc)"
                        >
                            <X className="w-5 h-5 text-surface" />
                            <span>Close View</span>
                        </button>

                        <div className="text-center label-caps text-xs text-surface tracking-wider max-w-md truncate">
                            {product.name} ({lightboxIndex + 1} / {galleryImages.length})
                        </div>

                        <div className="w-16" />
                    </div>

                    {/* Main Image Stage */}
                    <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-surface-dark">
                        {galleryImages.length > 1 && (
                            <button
                                onClick={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                                className="absolute left-4 sm:left-10 z-10 w-12 h-12 bg-surface-dark/90 hover:bg-primary text-surface border border-border-line-dark flex items-center justify-center transition-all"
                                title="Previous (Left Arrow)"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}

                        <div className="relative w-full h-full max-w-5xl max-h-[78vh]">
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
                                className="absolute right-4 sm:right-10 z-10 w-12 h-12 bg-surface-dark/90 hover:bg-primary text-surface border border-border-line-dark flex items-center justify-center transition-all"
                                title="Next (Right Arrow)"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Bottom Thumbnail Strip */}
                    <div className="py-4 px-6 border-t border-border-line-dark bg-surface-dark flex flex-col items-center gap-3">
                        {galleryImages.length > 1 && (
                            <div className="flex gap-2.5 overflow-x-auto max-w-full py-1 px-2 no-scrollbar">
                                {galleryImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setLightboxIndex(idx)}
                                        className={`relative w-14 h-18 border overflow-hidden flex-shrink-0 transition-all ${
                                            idx === lightboxIndex ? 'border-2 border-accent-ochre scale-105' : 'border-border-line-dark opacity-50 hover:opacity-100'
                                        }`}
                                    >
                                        <Image src={img} alt={`thumb-${idx}`} fill unoptimized className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Scroll To Top Button */}
            <button
                type="button"
                onClick={scrollToTop}
                aria-label="Scroll to top"
                className={`fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 p-3 sm:p-3.5 bg-surface-dark/95 hover:bg-primary text-surface border border-border-line-dark transition-all duration-300 transform active:scale-90 flex items-center justify-center select-none ${
                    showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'
                }`}
                title="Back to Top"
            >
                <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
        </div>
    );
};

export default ProductPage;
