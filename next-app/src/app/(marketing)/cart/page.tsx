"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
    Minus,
    Plus,
    Trash2,
    ShoppingBag,
    X,
    AlertCircle,
    AlertTriangle
} from "lucide-react";
import imgPlaceholder from "@/public/imagePlaceholder.png";
import { getProductSlug } from "../../../../utils/slugUtils";
import ErrorMessage from "@/components/(sheared)/ErrorMessage";
import SuccessMessage from "@/components/(sheared)/SuccessMessage";
import { useLoader } from "@/context/LoaderContext";
const basePath = process.env.NEXT_PUBLIC_UPLOAD_BASE || "https://api.zelton.co.in";

const CartPage = () => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const router = useRouter();
    const { user, loading: authLoading, openAuthModal } = useAuth();
    const {
        items,
        count,
        total,
        loading,
        hasOutOfStockItems,
        hasInsufficientStockItems,
        getItemStockStatus,
        updateQuantity,
        removeFromCart,
        clearCart
    } = useCart();
    const { showLoader, hideLoader } = useLoader();
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const [itemToRemove, setItemToRemove] = useState<number | null>(null);
    const [itemToRemoveName, setItemToRemoveName] = useState<string>("");

    if (!user) {
        return (
            <div className="min-h-screen bg-surface">
                <div className="max-w-site mx-auto site-pad section-y">
                    <div className="border border-border-line bg-surface-ivory p-8 sm:p-14 max-w-2xl mx-auto text-center">
                        <ShoppingBag className="w-10 h-10 text-primary mx-auto mb-6" strokeWidth={1.25} />
                        <span className="label-caps text-primary block mb-3">Members Only</span>
                        <h1 className="display-section text-on-surface">Sign In to Your Bag</h1>
                        <p className="text-[15px] text-body-slate mt-4 leading-relaxed max-w-md mx-auto">
                            Your selections are held in your SVastra account. Sign in to review the pieces you have reserved.
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

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-surface">
                <div className="max-w-site mx-auto site-pad section-y">
                    <div className="border border-border-line bg-surface-ivory p-8 sm:p-14 max-w-2xl mx-auto text-center">
                        <ShoppingBag className="w-10 h-10 text-primary mx-auto mb-6" strokeWidth={1.25} />
                        <span className="label-caps text-primary block mb-3">Nothing Reserved Yet</span>
                        <h1 className="display-section text-on-surface">Your Bag Is Empty</h1>
                        <p className="text-[15px] text-body-slate mt-4 leading-relaxed max-w-md mx-auto">
                            No pieces held. Browse the archive and reserve the cuts that move with you.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="sv-btn-primary mt-8"
                        >
                            Browse the Archive
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleQuantityUpdate = async (cartItemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        showLoader();
        try {
            await updateQuantity(cartItemId, newQuantity);
            setSuccessMessage("Cart quantity updated successfully!");
        } catch (error) {
            setErrorMessage("Failed to update cart quantity. Please try again.");
        } finally {
            hideLoader();
        }
    };

    const handleRemoveItemClick = (cartItemId: number, itemName: string) => {
        setItemToRemove(cartItemId);
        setItemToRemoveName(itemName);
        setShowRemoveModal(true);
    };

    const confirmRemoveItem = async () => {
        if (itemToRemove) {
            showLoader();
            try {
                await removeFromCart(itemToRemove);
                setSuccessMessage(`${itemToRemoveName} removed from cart successfully!`);
            } catch (error) {
                setErrorMessage("Failed to remove item from cart. Please try again.");
            } finally {
                hideLoader();
            }
            setShowRemoveModal(false);
            setItemToRemove(null);
            setItemToRemoveName("");
        }
    };

    const handleClearCartClick = () => {
        setShowClearModal(true);
    };

    const confirmClearCart = async () => {
        showLoader();
        try {
            await clearCart();
            setSuccessMessage("Cart cleared successfully!");
        } catch (error) {
            setErrorMessage("Failed to clear cart. Please try again.");
        } finally {
            hideLoader();
        }
        setShowClearModal(false);
    };

    const handleCheckoutClick = () => {
        if (hasInsufficientStockItems) {
            setErrorMessage("Please remove or update out-of-stock items in your cart before proceeding to checkout.");
            return;
        }
        router.push('/checkout');
    };

    const handleSingleItemCheckout = (item: any) => {
        const status = getItemStockStatus(item);
        if (status.isUnavailable) {
            setErrorMessage(status.message || "This item is currently unavailable.");
            return;
        }
        // Navigate to single item checkout with item details
        router.push(`/checkout/single?cartItemId=${item.id}&productId=${item.product.id}&variantId=${item.variant.id}&quantity=${item.quantity}`);
    };

    return (
        <div className="min-h-screen bg-surface">
            {errorMessage && <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />}
            {successMessage && <SuccessMessage message={successMessage} onClose={() => setSuccessMessage(null)} />}

            <div className="max-w-site mx-auto site-pad py-10 sm:py-14">
                {/* Global out-of-stock warning banner */}
                {hasInsufficientStockItems && (
                    <div className="bg-surface-ivory border border-primary p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="label-caps text-primary">Items in Your Bag Are Currently Unavailable</h4>
                            <p className="text-[13px] text-body-slate mt-1.5 leading-relaxed">
                                One or more items in your cart are currently out of stock or have insufficient inventory. Please remove unavailable items or adjust quantities to proceed with checkout.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <div className="flex-1 min-w-0">
                        <div className="border border-border-line bg-pure-white px-5 sm:px-7 pt-6 pb-4 mb-4">
                            <span className="label-caps text-primary block mb-2">Reserved Pieces</span>
                            <div className="flex items-end justify-between gap-4">
                                <h1 className="display-section text-on-surface">Your Bag</h1>
                                <span className="label-caps text-body-slate pb-1.5">Price</span>
                            </div>
                            <hr className="mt-4 border-0 border-t border-border-line" />
                        </div>

                        <div className="border border-border-line bg-pure-white px-5 sm:px-7 py-4 mb-4">
                            {items.map((item, index) => {
                                const stockInfo = getItemStockStatus(item);

                                return (
                                    <div key={item.id}>
                                        <div className={`flex gap-4 py-5 transition-colors ${stockInfo.isOutOfStock ? 'bg-surface-ivory p-3 -mx-3 border border-primary/30' : ''}`}>
                                            <div className="flex-shrink-0">
                                                <div
                                                    className="relative cursor-pointer border border-border-line bg-surface-ivory"
                                                    style={{ width: 160, height: 160 }}
                                                    onClick={() => router.push(`/products/${getProductSlug(item.product)}?variantId=${item.variant.id}`)}
                                                >
                                                    <Image
                                                        src={`${basePath}${item.variant?.image_url || item.product?.image_url || imgPlaceholder.src}`}
                                                        alt={item.product?.name || 'Product'}
                                                        fill
                                                        unoptimized
                                                        className={`object-contain ${stockInfo.isOutOfStock ? 'opacity-60 grayscale-[40%]' : ''}`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h3
                                                        className="text-base sm:text-lg font-bold uppercase tracking-tight text-on-surface line-clamp-3 cursor-pointer hover:text-primary transition-colors mb-1.5"
                                                        onClick={() => router.push(`/products/${getProductSlug(item.product)}?variantId=${item.variant.id}`)}
                                                    >
                                                        {item.product?.name}
                                                    </h3>

                                                    <p className="text-[12px] text-body-slate uppercase tracking-wider mb-2">
                                                        {item.variant?.title}{item.variant?.sku ? ` · SKU: ${item.variant.sku}` : ""}
                                                    </p>

                                                    {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                                            {Object.entries(item.selected_attributes).map(([key, value]) => (
                                                                <span key={key} className="text-[10px] font-semibold tracking-wider uppercase text-body-slate bg-surface-ivory border border-border-line px-2 py-1">
                                                                    {key}: {value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Real-time Dynamic Stock Status */}
                                                    {stockInfo.isOutOfStock ? (
                                                        <div className="mb-2">
                                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-surface bg-primary px-2.5 py-1">
                                                                <AlertCircle className="w-3.5 h-3.5" />
                                                                Out of Stock
                                                            </span>
                                                            <p className="text-[12px] text-primary font-medium mt-1.5">
                                                                {stockInfo.message || "This product is currently out of stock."}
                                                            </p>
                                                        </div>
                                                    ) : stockInfo.isInsufficientStock ? (
                                                        <div className="mb-2">
                                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-on-surface bg-accent-ochre px-2.5 py-1">
                                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                                Limited Stock
                                                            </span>
                                                            <p className="text-[12px] text-body-slate font-medium mt-1.5">
                                                                {stockInfo.message}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-[11px] font-semibold tracking-wider uppercase text-accent-ochre mb-1">In Archive</p>
                                                            <p className="text-[13px] text-body-slate mb-3">
                                                                <span className="font-semibold text-on-surface">Complimentary delivery</span> available
                                                            </p>
                                                        </>
                                                    )}

                                                    <div className="flex items-center gap-0 mb-3 mt-1">
                                                        <div className="flex items-center border border-border-line bg-surface-subtle">
                                                            <button
                                                                onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                                                                disabled={item.quantity <= 1 || loading}
                                                                className="w-9 h-9 flex items-center justify-center text-on-surface hover:bg-surface-ivory disabled:opacity-40 disabled:cursor-not-allowed border-r border-border-line transition-colors"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <span className="w-10 text-center text-[13px] font-bold text-on-surface">{item.quantity}</span>
                                                            <button
                                                                onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                                                                disabled={item.quantity >= stockInfo.availableStock || stockInfo.availableStock <= 0 || loading}
                                                                className="w-9 h-9 flex items-center justify-center text-on-surface hover:bg-surface-ivory disabled:opacity-40 disabled:cursor-not-allowed border-l border-border-line transition-colors"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <span className={`text-[10px] font-semibold tracking-wider uppercase ml-3 ${stockInfo.isOutOfStock ? 'text-primary' : 'text-body-slate'}`}>
                                                            {stockInfo.availableStock} available
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center flex-wrap gap-x-0 text-[11px] font-semibold tracking-wider uppercase">
                                                        <button
                                                            onClick={() => handleRemoveItemClick(item.id, item.product?.name || 'Item')}
                                                            disabled={loading}
                                                            className="text-primary hover:text-on-surface disabled:opacity-50 transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                        <span className="text-on-surface/25 mx-2" aria-hidden="true">|</span>
                                                        <button
                                                            onClick={() => handleSingleItemCheckout(item)}
                                                            disabled={loading || stockInfo.isUnavailable}
                                                            className={`text-primary hover:text-on-surface transition-colors ${stockInfo.isUnavailable ? 'opacity-40 cursor-not-allowed line-through text-body-slate' : ''}`}
                                                        >
                                                            Buy This Now
                                                        </button>
                                                        <span className="text-on-surface/25 mx-2" aria-hidden="true">|</span>
                                                        <button
                                                            onClick={() => router.push(`/products/${getProductSlug(item.product)}?variantId=${item.variant.id}`)}
                                                            className="text-primary hover:text-on-surface transition-colors"
                                                        >
                                                            See More Like This
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="text-right flex-shrink-0 sm:min-w-[90px]">
                                                    <p className="text-lg font-bold text-on-surface">₹{item.total}</p>
                                                    <p className="text-[11px] text-body-slate mt-0.5">₹{item.price} × {item.quantity}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {index < items.length - 1 && <hr className="border-0 border-t border-border-line" />}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="border border-border-line bg-surface-ivory px-5 sm:px-7 py-4 text-right">
                            <p className="text-[15px] text-body-slate">
                                Subtotal ({count} {count === 1 ? 'item' : 'items'}):&nbsp;
                                <span className="font-bold text-on-surface text-lg">₹{total}</span>
                            </p>
                        </div>

                        <div className="mt-4 text-right">
                            <button
                                onClick={handleClearCartClick}
                                className="text-[11px] font-semibold tracking-wider uppercase text-primary hover:text-on-surface transition-colors flex items-center gap-2 ml-auto"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Empty the Bag
                            </button>
                        </div>

                        <p className="text-[12px] text-body-slate mt-5 leading-relaxed">
                            The price and availability of items are subject to change. The shopping cart is a temporary place to store items and reflects each item&apos;s most recent price and real-time inventory.
                        </p>
                    </div>

                    <div className="w-full lg:w-80 flex-shrink-0 sticky top-4">
                        <div className="border border-border-line bg-surface-ivory p-6">
                            <span className="label-caps text-primary block mb-4">Order Summary</span>

                            <p className="text-[14px] text-body-slate mb-3">
                                Subtotal ({count} {count === 1 ? 'item' : 'items'}):&nbsp;
                                <span className="font-bold text-on-surface">₹{total}</span>
                            </p>

                            <div className="flex justify-between text-[13px] text-body-slate mb-4">
                                <span>Shipping</span>
                                <span className="text-accent-ochre font-semibold uppercase tracking-wider text-[11px]">Complimentary</span>
                            </div>

                            <hr className="border-0 border-t border-border-line mb-4" />

                            <div className="flex justify-between items-baseline text-on-surface mb-5">
                                <span className="label-caps">Order Total</span>
                                <span className="text-xl font-bold">₹{total}</span>
                            </div>

                            {/* Warning message inside order summary box */}
                            {hasInsufficientStockItems && (
                                <div className="mb-4 p-3 bg-surface border border-primary text-[12px] text-primary flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>Checkout is disabled because one or more items are out of stock or have insufficient inventory.</span>
                                </div>
                            )}

                            <button
                                onClick={handleCheckoutClick}
                                disabled={loading || items.length === 0 || hasInsufficientStockItems}
                                className="sv-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {hasInsufficientStockItems ? 'Unavailable Items in Bag' : 'Proceed to Checkout'}
                            </button>

                            <button
                                onClick={() => router.push('/')}
                                className="sv-btn-outline w-full mt-3"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showRemoveModal && (
                <div className="fixed inset-0 bg-on-surface/70 flex items-center justify-center z-50 p-4">

                    <div className="bg-surface border border-on-surface p-6 sm:p-8 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <span className="label-caps text-primary block mb-1.5">Confirm</span>
                                <h3 className="text-xl font-bold uppercase tracking-tight text-on-surface">Remove Item</h3>
                            </div>
                            <button
                                onClick={() => setShowRemoveModal(false)}
                                className="p-1 text-body-slate hover:text-on-surface transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-[14px] text-body-slate mb-7 leading-relaxed">
                            Are you sure you want to remove <span className="font-semibold text-on-surface">&ldquo;{itemToRemoveName}&rdquo;</span> from your bag?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowRemoveModal(false)}
                                className="sv-btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRemoveItem}
                                disabled={loading}
                                className="sv-btn-primary disabled:opacity-50"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showClearModal && (
                <div className="fixed inset-0 bg-on-surface/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface border border-on-surface p-6 sm:p-8 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <span className="label-caps text-primary block mb-1.5">Confirm</span>
                                <h3 className="text-xl font-bold uppercase tracking-tight text-on-surface">Empty the Bag</h3>
                            </div>
                            <button
                                onClick={() => setShowClearModal(false)}
                                className="p-1 text-body-slate hover:text-on-surface transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-[14px] text-body-slate mb-7 leading-relaxed">
                            Are you sure you want to clear your entire bag? This action cannot be undone and all {count} items will be removed.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowClearModal(false)}
                                className="sv-btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmClearCart}
                                disabled={loading}
                                className="sv-btn-primary disabled:opacity-50"
                            >
                                Clear Bag
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
