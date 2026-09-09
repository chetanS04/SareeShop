"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLike } from "@/context/LikeContext";
import { extractProductPricing } from "@/utils/pricing";
import { getProductSlug } from "../../../../utils/slugUtils";
import { useAuth } from "@/context/AuthContext";
import { Heart, ShoppingCart, ArrowLeft, Trash2, ShieldCheck, Layers, CheckCircle2, Truck, Tag } from "lucide-react";
import imgPlaceholder from "@/public/imagePlaceholder.png";
import { getUserLikedProducts } from "../../../../utils/likeApi";
import ErrorMessage from "@/components/(sheared)/ErrorMessage";
import SuccessMessage from "@/components/(sheared)/SuccessMessage";
import { useLoader } from "@/context/LoaderContext";

interface LikedProduct {
    id: number;
    name: string;
    description?: string;
    item_code?: string;
    image_url?: string;
    category?: {
        name: string;
    };
    brand?: {
        name: string;
    };
    variants: Array<{
        id: number;
        title: string;
        sku: string;
        sp: number;
        mrp?: number;
        stock: number;
        image_url?: string;
        image_json?: string;
    }>;
    min_price?: number;
    likes_count?: number;
}

const LikesPage = () => {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { user, loading: authLoading, openAuthModal } = useAuth();
    const { toggleLike, isLiked, likesLoading } = useLike();
    const [likedProducts, setLikedProducts] = useState<LikedProduct[]>([]);
    const [removingId, setRemovingId] = useState<number | null>(null);
    const { showLoader, hideLoader } = useLoader();

    const basePath = process.env.NEXT_PUBLIC_UPLOAD_BASE || "https://api.zelton.co.in";

    useEffect(() => {
        if (authLoading) return;
        fetchLikedProducts();
    }, [user, authLoading]);

    const fetchLikedProducts = async () => {
        showLoader();
        try {
            const response = await getUserLikedProducts();
            if (response.res === 'success') {
                setLikedProducts(response.liked_products);
            }
        } catch (error) {
            console.error('Error fetching liked products:', error);
            setErrorMessage("Failed to load your wishlist. Please try again.");
        } finally {
            hideLoader();
        }
    };

    const handleRemoveFromWishlist = async (productId: number) => {
        setRemovingId(productId);
        const success = await toggleLike(productId);
        if (success) {
            setLikedProducts(prev => prev.filter(product => product.id !== productId));
            setSuccessMessage("Product removed from wishlist successfully!");
        } else {
            setErrorMessage("Failed to remove product from wishlist. Please try again.");
        }
        setRemovingId(null);
    };

    const handleProductClick = (productOrId: any) => {
        const slug = typeof productOrId === 'object' ? getProductSlug(productOrId) : productOrId;
        router.push(`/products/${slug}`);
    };

    const getProductImageUrl = (product: LikedProduct) => {
        if (product.image_url) {
            return product.image_url.startsWith('http') ? product.image_url : `${basePath}${product.image_url}`;
        }
        if (product.variants && product.variants.length > 0 && product.variants[0].image_url) {
            const vUrl = product.variants[0].image_url;
            return vUrl.startsWith('http') ? vUrl : `${basePath}${vUrl}`;
        }
        return imgPlaceholder.src;
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-surface">
                <div className="max-w-site mx-auto site-pad section-y">
                    <div className="border border-border-line bg-surface-ivory p-8 sm:p-14 max-w-2xl mx-auto text-center">
                        <Heart className="w-10 h-10 text-primary mx-auto mb-6" strokeWidth={1.25} />
                        <span className="label-caps text-primary block mb-3">Members Only</span>
                        <h1 className="display-section text-on-surface">Sign In to Your Archive</h1>
                        <p className="text-[15px] text-body-slate mt-4 leading-relaxed max-w-md mx-auto">
                            Your saved pieces live in your SVastra account. Sign in to revisit the cuts you have marked.
                        </p>
                        <button
                            onClick={() => openAuthModal('login')}
                            className="sv-btn-primary mt-8"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface">
            {errorMessage && <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />}
            {successMessage && <SuccessMessage message={successMessage} onClose={() => setSuccessMessage(null)} />}

            <div className="max-w-site mx-auto site-pad py-10 sm:py-14">
                {/* Header */}
                <div className="border-b border-border-line pb-6 sm:pb-8 mb-8 sm:mb-10">
                    <div className="flex items-start gap-4">
                        <button
                            onClick={() => router.back()}
                            className="w-11 h-11 border border-border-line bg-pure-white text-on-surface hover:border-on-surface transition-colors flex items-center justify-center flex-shrink-0"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <span className="label-caps text-primary block mb-2">Saved by You</span>
                            <h1 className="display-section text-on-surface">The Archive</h1>
                            <p className="text-[13px] text-body-slate mt-2">{likedProducts.length} {likedProducts.length === 1 ? 'piece' : 'pieces'} saved</p>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {likedProducts.length === 0 ? (
                    <div className="border border-border-line bg-surface-ivory p-8 sm:p-14 max-w-2xl mx-auto text-center">
                        <Heart className="w-10 h-10 text-primary mx-auto mb-6" strokeWidth={1.25} />
                        <span className="label-caps text-primary block mb-3">Nothing Saved Yet</span>
                        <h2 className="display-section text-on-surface">Your Archive Is Empty</h2>
                        <p className="text-[15px] text-body-slate mt-4 leading-relaxed max-w-md mx-auto">
                            Mark the pieces that speak to you and they will be held here for your next edit.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="sv-btn-primary mt-8"
                        >
                            Browse the Archive
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4.5">
                        {likedProducts.map((product) => {
                            const { formattedSp, formattedMrp, discountPct, hasDiscount } = extractProductPricing(product);
                            const fullName = product.brand?.name ? `${product.name} (${product.brand.name})` : product.name;
                            const hasStock = product.variants?.some((v) => v.stock > 0) ?? true;

                            return (
                                <div key={product.id} className="sv-product-card bg-pure-white border border-border-line hover:border-on-surface transition-colors overflow-hidden flex flex-col group/card">
                                    {/* 1. Full-bleed Product Image Section (object-cover with Choose Options overlay) */}
                                    <div className="relative w-full aspect-[3/4] bg-surface-ivory flex items-center justify-center overflow-hidden border-b border-border-line flex-shrink-0">
                                        <img
                                            src={getProductImageUrl(product)}
                                            alt={fullName || "Product"}
                                            className="w-full h-full object-cover transition-opacity duration-300 cursor-pointer"
                                            onClick={() => handleProductClick(product)}
                                            onError={(e: any) => {
                                                e.target.src = imgPlaceholder.src;
                                            }}
                                        />
                                        {/* Remove from wishlist top floating heart button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFromWishlist(product.id);
                                            }}
                                            disabled={removingId === product.id || likesLoading}
                                            className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 w-8 h-8 bg-surface/95 hover:bg-surface border border-border-line flex items-center justify-center text-primary transition-colors disabled:opacity-50"
                                            title="Remove from wishlist"
                                        >
                                            {removingId === product.id ? (
                                                <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary sv-round animate-spin"></div>
                                            ) : (
                                                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-primary text-primary" />
                                            )}
                                        </button>

                                        {/* "Choose Options" Overlay Button on hover */}
                                        <div className="absolute bottom-0 inset-x-0 pointer-events-none opacity-0 invisible group-hover/card:opacity-100 group-hover/card:visible transition-all duration-300 z-20">
                                            <span className="block w-full text-center bg-surface-dark/90 text-surface text-[11px] font-semibold tracking-[0.12em] uppercase py-3">
                                                Select &amp; Reserve
                                            </span>
                                        </div>
                                    </div>

                                    {/* 2. Product Info Section */}
                                    <div className="p-3 sm:p-4 flex flex-col justify-between flex-1 bg-pure-white gap-2">
                                        <div className="flex flex-col gap-1.5">
                                            {/* Full Product Name */}
                                            <h3
                                                className="text-xs sm:text-sm font-bold uppercase tracking-tight text-on-surface leading-snug line-clamp-2 cursor-pointer group-hover/card:text-primary transition-colors"
                                                onClick={() => handleProductClick(product)}
                                                title={fullName}
                                            >
                                                {fullName}
                                            </h3>

                                            {/* Pricing Row */}
                                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mt-0.5">
                                                <span className="font-bold text-sm sm:text-base text-on-surface">
                                                    {formattedSp}
                                                </span>
                                                {hasDiscount && (
                                                    <span className="line-through text-[11px] sm:text-xs text-body-slate font-normal">
                                                        {formattedMrp}
                                                    </span>
                                                )}
                                                {hasDiscount && discountPct > 0 && (
                                                    <span className="text-primary text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase">
                                                        {discountPct}% Off
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* ── 3. Desktop Metadata Section (Quality Assured, Options, Stock Status) ── */}
                                        <div className="hidden sm:flex pt-3 border-t border-border-line flex-col gap-2 mt-auto">
                                            <div className="flex items-center justify-between gap-2">
                                                {product.brand ? (
                                                    <span className="inline-flex items-center gap-1 bg-surface-ivory border border-border-line text-body-slate text-[10px] font-semibold tracking-wider uppercase px-2 py-1">
                                                        <Tag className="w-3 h-3" />
                                                        {product.brand.name}
                                                    </span>
                                                ) : product.category ? (
                                                    <span className="inline-flex items-center gap-1 bg-surface-ivory border border-border-line text-body-slate text-[10px] font-semibold tracking-wider uppercase px-2 py-1">
                                                        {product.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-surface-ivory border border-border-line text-primary text-[10px] font-semibold tracking-wider uppercase px-2 py-1">
                                                        <ShieldCheck className="w-3 h-3" /> Atelier Assured
                                                    </span>
                                                )}

                                                {product.variants && product.variants.length > 1 && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase text-body-slate bg-surface border border-border-line px-2 py-1">
                                                        <Layers className="w-3 h-3" />
                                                        {product.variants.length} Options
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase">
                                                {hasStock ? (
                                                    <span className="flex items-center gap-1 text-accent-ochre">
                                                        <CheckCircle2 className="w-3 h-3" /> In Archive &amp; Ready to Ship
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-body-slate">
                                                        <Truck className="w-3 h-3" /> Made to Order
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action buttons (View + Delete) */}
                                        <div className="flex items-stretch gap-2 pt-3 border-t border-border-line mt-1">
                                            <button
                                                onClick={() => handleProductClick(product.id)}
                                                className="flex-1 py-2.5 px-3 bg-primary text-surface hover:bg-surface-dark transition-colors text-[10px] sm:text-[11px] font-semibold tracking-[0.06em] uppercase flex items-center justify-center gap-1.5"
                                            >
                                                <ShoppingCart className="w-3.5 h-3.5" />
                                                <span>View</span>
                                            </button>
                                            <button
                                                onClick={() => handleRemoveFromWishlist(product.id)}
                                                disabled={removingId === product.id || likesLoading}
                                                className="px-3 border border-border-line text-primary hover:border-primary transition-colors disabled:opacity-50 flex items-center justify-center"
                                                title="Remove"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LikesPage;
