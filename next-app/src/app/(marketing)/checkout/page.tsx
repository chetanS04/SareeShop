"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from 'next/script';
import Link from "next/link";
import axios from "../../../../utils/axios";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useProductSync, ProductEventData } from "@/context/ProductSyncContext";
import {
    MapPin,
    CreditCard,
    CheckCircle2,
    Loader2,
    X,
    ShieldCheck,
    Truck,
    RotateCcw,
    Lock,
    User,
    Phone,
    Home,
    Building2,
    ChevronRight,
    Check,
    ShoppingBag,
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { placeOrderFromCart } from "../../../../utils/orderApi";
import imgPlaceholder from "@/public/imagePlaceholder.png";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Modal from "@/components/(sheared)/Modal";
import SecurePaymentPanel from "@/components/checkout/SecurePaymentPanel";
import SearchableDropdown from "@/components/(sheared)/SearchableDropdown";
import { fetchStates, fetchCitiesByState, StateItem, CityItem } from "../../../../utils/locationApi";
import {
    validateAddressLine1,
    validateAddressLine2,
    validateCity,
    validateState,
    validatePostalCode,
    validateCountry,
    validateFullName,
    validatePhoneNumber,
    normalizeAddressInput,
} from "../../../../utils/addressValidator";

const basePath = process.env.NEXT_PUBLIC_UPLOAD_BASE || "https://api.zelton.co.in";

const formatINR = (val: number | string) =>
    `₹${Math.round(Number(val) || 0).toLocaleString("en-IN")}`;

const resolveItemImage = (raw?: string | null) => {
    if (!raw) return imgPlaceholder.src;
    const s = String(raw);
    if (s.startsWith("http") || s.startsWith("data:")) return s;
    return `${basePath}${s}`;
};

const STORAGE_KEY_ADDRESS = "zelton_checkout_cart_address_v2";
const STORAGE_KEY_STEP = "zelton_checkout_cart_step_v2";
const STORAGE_KEY_PAYMENT = "zelton_checkout_cart_payment_v2";

interface ShippingFormData {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

// Yup validation schema matching single checkout
const shippingSchema = yup.object({
    fullName: yup
        .string()
        .transform((value) => normalizeAddressInput(value))
        .test("valid-fullname", function (value) {
            const res = validateFullName(value);
            return res.isValid || this.createError({ message: res.error });
        })
        .required("Full name is required"),
    phoneNumber: yup
        .string()
        .transform((value) => String(value || "").replace(/[^0-9]/g, ""))
        .test("valid-phone", function (value) {
            const res = validatePhoneNumber(value);
            return res.isValid || this.createError({ message: res.error });
        })
        .required("Phone number is required"),
    addressLine1: yup
        .string()
        .transform((value) => normalizeAddressInput(value))
        .test("valid-address-line1", function (value) {
            const { city, state } = this.parent;
            const res = validateAddressLine1(value, city, state);
            return res.isValid || this.createError({ message: res.error });
        })
        .required("Address Line 1 is required"),
    addressLine2: yup
        .string()
        .transform((value) => normalizeAddressInput(value))
        .test("valid-address-line2", function (value) {
            const res = validateAddressLine2(value);
            return res.isValid || this.createError({ message: res.error });
        })
        .default(""),
    city: yup
        .string()
        .transform((value) => normalizeAddressInput(value))
        .test("valid-city", function (value) {
            const res = validateCity(value);
            return res.isValid || this.createError({ message: res.error });
        })
        .required("City is required"),
    state: yup
        .string()
        .transform((value) => normalizeAddressInput(value))
        .test("valid-state", function (value) {
            const res = validateState(value);
            return res.isValid || this.createError({ message: res.error });
        })
        .required("State is required"),
    postalCode: yup
        .string()
        .transform((value) => String(value || "").trim())
        .test("valid-postal", function (value) {
            const res = validatePostalCode(value);
            return res.isValid || this.createError({ message: res.error });
        })
        .required("Postal code is required"),
    country: yup
        .string()
        .transform((value) => normalizeAddressInput(value))
        .test("valid-country", function (value) {
            const res = validateCountry(value);
            return res.isValid || this.createError({ message: res.error });
        })
        .required("Country is required")
        .default("India"),
}).required();

function CheckoutPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const {
        items,
        total,
        count,
        loading: cartLoading,
        hasOutOfStockItems,
        hasInsufficientStockItems,
        getItemStockStatus,
        clearCart,
        refreshCart
    } = useCart();
    const { subscribeToAll } = useProductSync();

    const [currentStep, setCurrentStep] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
    const [gokwikSdkLoaded, setGokwikSdkLoaded] = useState(false);
    const gokwikSdkLoadedRef = useRef(false);

    // Real-time synchronization for Cart Checkout items
    useEffect(() => {
        const unsubscribe = subscribeToAll((event: ProductEventData) => {
            console.log("⚡ [CartCheckout] Real-time product sync event:", event.action);
            if (event.action === "updated" || event.action === "stock_updated" || event.action === "status_changed" || event.action === "deleted") {
                refreshCart();
            }
        });

        return () => {
            unsubscribe();
        };
    }, [subscribeToAll, refreshCart]);

    // Payment Verification State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
    const [paymentMessage, setPaymentMessage] = useState("Verifying payment...");

    // Message notification state
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // State & City dynamic loading
    const [statesList, setStatesList] = useState<StateItem[]>([]);
    const [citiesList, setCitiesList] = useState<CityItem[]>([]);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    // React Hook Form with Yup validation
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        getValues,
        formState: { errors },
    } = useForm<ShippingFormData>({
        resolver: yupResolver(shippingSchema),
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues: {
            fullName: "",
            phoneNumber: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            postalCode: "",
            country: "India",
        },
    });

    // 1. Restore saved form values & preferences from localStorage on mount
    useEffect(() => {
        try {
            const savedAddress = localStorage.getItem(STORAGE_KEY_ADDRESS);
            if (savedAddress) {
                const parsed = JSON.parse(savedAddress);
                if (parsed && typeof parsed === 'object') {
                    if (parsed.fullName) setValue('fullName', parsed.fullName);
                    if (parsed.phoneNumber) setValue('phoneNumber', parsed.phoneNumber);
                    if (parsed.addressLine1) setValue('addressLine1', parsed.addressLine1);
                    if (parsed.addressLine2) setValue('addressLine2', parsed.addressLine2);
                    if (parsed.state) setValue('state', parsed.state);
                    if (parsed.city) setValue('city', parsed.city);
                    if (parsed.postalCode) setValue('postalCode', parsed.postalCode);
                    if (parsed.country) setValue('country', parsed.country || 'India');
                }
            }

            const savedStep = localStorage.getItem(STORAGE_KEY_STEP);
            if (savedStep) {
                const stepNum = parseInt(savedStep, 10);
                if (stepNum >= 1 && stepNum <= 3) {
                    setCurrentStep(stepNum);
                }
            }

            const savedPayment = localStorage.getItem(STORAGE_KEY_PAYMENT);
            if (savedPayment === 'cod' || savedPayment === 'online') {
                setPaymentMethod(savedPayment);
            }
        } catch (err) {
            console.warn("Could not restore checkout state from localStorage:", err);
        }
    }, [setValue]);

    // 2. Auto-save form fields to localStorage on change
    const formValues = watch();
    useEffect(() => {
        try {
            if (formValues && (formValues.fullName || formValues.phoneNumber || formValues.addressLine1 || formValues.state || formValues.city || formValues.postalCode)) {
                localStorage.setItem(STORAGE_KEY_ADDRESS, JSON.stringify(formValues));
            }
        } catch (err) {
            console.warn("Could not save address to localStorage:", err);
        }
    }, [formValues]);

    // 3. Auto-save currentStep and paymentMethod to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY_STEP, String(currentStep));
        } catch (err) {
            console.warn("Could not save step to localStorage:", err);
        }
    }, [currentStep]);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY_PAYMENT, paymentMethod);
        } catch (err) {
            console.warn("Could not save payment method to localStorage:", err);
        }
    }, [paymentMethod]);

    // Auth & Empty Cart guard
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push('/');
            return;
        }

        if (cartLoading) return;

        if (items.length === 0 && !searchParams.get("order_id")) {
            router.push('/cart');
        }
    }, [user, authLoading, items, cartLoading, router, searchParams]);

    // Check for payment return from GoKwik redirect
    useEffect(() => {
        const orderId = searchParams.get("order_id") || searchParams.get("orderId");
        if (orderId) {
            const rawStatus = searchParams.get("status") || searchParams.get("order_status") || searchParams.get("gokwik_status") || "";
            const txId = searchParams.get("transaction_id") || searchParams.get("txId") || searchParams.get("gokwik_oid") || searchParams.get("payment_id");
            // Only verify if there's an explicit status from GoKwik redirect
            if (rawStatus) {
                verifyPayment(orderId, rawStatus, txId);
            }
        }
    }, [searchParams]);

    const verifyPayment = async (orderId: string, status = "PAID", transactionId?: string | null) => {
        setShowPaymentModal(true);
        setPaymentStatus('verifying');
        setPaymentMessage("Verifying your GoKwik payment...");

        try {
            const response = await axios.post(`/api/payment/verify`, {
                order_id: orderId,
                status: status || "PAID",
                transaction_id: transactionId || undefined,
            });

            if (response.data.success && (response.data.status === 'PAID' || response.data.status === 'SUCCESS')) {
                setPaymentStatus('success');
                setPaymentMessage("Payment successful! Redirecting to orders...");

                await clearCart();

                setTimeout(() => {
                    router.push('/orders?celebrate=true');
                }, 2000);
            } else {
                setPaymentStatus('failed');
                setPaymentMessage(response.data?.message || "Payment was not completed. Your order was not placed.");
                setTimeout(() => {
                    setShowPaymentModal(false);
                    router.replace('/checkout');
                }, 3500);
            }
        } catch (error: any) {
            console.error("Payment verification failed:", error);
            setPaymentStatus('failed');
            setPaymentMessage(error.response?.data?.message || "Payment verification failed.");
            setTimeout(() => {
                setShowPaymentModal(false);
                router.replace('/checkout');
            }, 3500);
        }
    };

    // Update form defaults from user profile if not already filled
    useEffect(() => {
        if (user) {
            const currentName = getValues('fullName');
            const currentPhone = getValues('phoneNumber');
            if (!currentName && user.name) setValue("fullName", user.name);
            if (!currentPhone && user.phone_number) setValue("phoneNumber", user.phone_number);
        }
    }, [user, setValue, getValues]);

    // Fetch States on load
    useEffect(() => {
        let isMounted = true;
        (async () => {
            setLoadingStates(true);
            const list = await fetchStates();
            if (isMounted) {
                setStatesList(list);
                setLoadingStates(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, []);

    // When state in form changes or is preset, load cities
    const currentState = watch('state');
    useEffect(() => {
        if (!currentState || statesList.length === 0) {
            setCitiesList([]);
            return;
        }
        const found = statesList.find(s => s.name.toLowerCase() === currentState.toLowerCase());
        if (found) {
            setLoadingCities(true);
            fetchCitiesByState(found.id).then(cities => {
                setCitiesList(cities);
                setLoadingCities(false);
            });
        }
    }, [currentState, statesList]);

    const handleNextStep = handleSubmit(() => {
        if (hasInsufficientStockItems) {
            setErrorMessage("One or more items in your cart are currently out of stock or have insufficient quantity. Please return to your cart and remove them before proceeding.");
            return;
        }
        if (currentStep === 1) {
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (currentStep === 2) {
            setCurrentStep(3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePlaceOrder = handleSubmit(async (data: ShippingFormData) => {
        if (hasInsufficientStockItems) {
            setErrorMessage("One or more items in your cart are currently out of stock. Please return to your cart and remove them before placing an order.");
            return;
        }

        setLoading(true);
        setErrorMessage(null);

        try {
            const cleanFullName = normalizeAddressInput(data.fullName);
            const cleanPhone = String(data.phoneNumber).replace(/[^0-9]/g, '');
            const cleanLine1 = normalizeAddressInput(data.addressLine1);
            const cleanLine2 = normalizeAddressInput(data.addressLine2);
            const cleanCity = normalizeAddressInput(data.city);
            const cleanState = normalizeAddressInput(data.state);
            const cleanPin = String(data.postalCode).trim();
            const cleanCountry = normalizeAddressInput(data.country) || 'India';

            const fullStreetAddress = [cleanLine1, cleanLine2].filter(Boolean).join(', ');
            const structuredAddressObj = {
                name: cleanFullName,
                phone: cleanPhone,
                add: fullStreetAddress,
                city: cleanCity,
                state: cleanState,
                pin: cleanPin,
                country: cleanCountry,
            };
            const shippingAddress = JSON.stringify(structuredAddressObj);

            const orderData = {
                shipping_address: shippingAddress,
                billing_address: shippingAddress,
                notes: "Cart checkout order",
                name: data.fullName || user?.name,
                phone: data.phoneNumber || user?.phone_number,
                email: user?.email,
                origin: typeof window !== 'undefined' ? window.location.origin : undefined,
                return_url: typeof window !== 'undefined' ? `${window.location.origin}/checkout?order_id={order_id}` : undefined,
            };

            if (paymentMethod === 'online') {
                try {
                    const response = await axios.post(`/api/payment/initiate`, orderData);

                    if (response.data.success) {
                        const { order_number, gokwik_checkout_data, checkout_url, mode } = response.data;
                        const activeMode = mode || process.env.NEXT_PUBLIC_GOKWIK_ENV || "production";

                        const onPaymentSuccess = async (data?: any) => {
                            const tx = data?.transaction_id || data?.gokwik_oid || data?.payment_id || data?.order_id || `GK-${Date.now()}`;
                            const payStatus = data?.status || data?.order_status || data?.payment_status || "PAID";
                            await verifyPayment(order_number, payStatus, tx);
                        };

                        const onPaymentError = (err?: any) => {
                            console.warn("GoKwik checkout error:", err);
                            setLoading(false);
                            setErrorMessage(err?.message || "Payment was not completed. Please try again.");
                        };

                        if (checkout_url) {
                            // GoKwik returned a redirect URL — navigate there
                            window.location.href = checkout_url;
                            return;
                        }

                        // Wait for GoKwik SDK to be available (up to 10 seconds)
                        const waitForGokwikSdk = (): Promise<any> => {
                            return new Promise((resolve, reject) => {
                                const deadline = Date.now() + 10000;
                                const check = () => {
                                    const sdk = (window as any).gokwikSdk || (window as any).gokwik || (window as any).Gokwik;
                                    if (sdk && typeof sdk.initCheckout === 'function') {
                                        resolve(sdk);
                                    } else if (Date.now() > deadline) {
                                        reject(new Error('GoKwik SDK did not load in time. Please refresh the page and try again.'));
                                    } else {
                                        setTimeout(check, 200);
                                    }
                                };
                                check();
                            });
                        };

                        let gkSdk: any;
                        try {
                            gkSdk = await waitForGokwikSdk();
                        } catch (sdkLoadErr: any) {
                            console.error('GoKwik SDK load error:', sdkLoadErr);
                            // Cancel the pending order since we can't open payment
                            axios.post('/api/payment/cancel', { order_number }).catch(() => {});
                            setLoading(false);
                            setErrorMessage(sdkLoadErr?.message || 'GoKwik payment gateway could not load. Please refresh and try again.');
                            return;
                        }

                        // SDK is ready — initiate GoKwik checkout
                        try {
                            gkSdk.initCheckout({
                                merchantId: process.env.NEXT_PUBLIC_GOKWIK_MERCHANT_ID || gokwik_checkout_data?.merchant_id || "19yxs5lini4u",
                                environment: activeMode,
                                orderId: order_number,
                                order_id: order_number,
                                amount: gokwik_checkout_data?.amount || response.data.amount,
                                currency: "INR",
                                customer: gokwik_checkout_data?.customer || {},
                                cart: gokwik_checkout_data?.cart || {},
                                shipping_address: gokwik_checkout_data?.shipping_address,
                                return_url: `${window.location.origin}/checkout?order_id=${order_number}`,
                                successCallback: onPaymentSuccess,
                                failureCallback: onPaymentError,
                                cancelCallback: () => { setLoading(false); },
                                onSuccess: onPaymentSuccess,
                                onError: onPaymentError,
                                onClose: () => { setLoading(false); },
                            });
                        } catch (sdkErr: any) {
                            console.error("GoKwik SDK initCheckout error:", sdkErr);
                            setLoading(false);
                            setErrorMessage(sdkErr?.message || "GoKwik payment could not be started. Please try again.");
                        }
                    } else {
                        setErrorMessage(response.data.message || "Failed to initiate payment. Please try again.");
                        setLoading(false);
                    }
                } catch (error: any) {
                    console.error("Payment initiation failed:", error);
                    setErrorMessage(error.response?.data?.message || "Failed to initiate payment. Please try again.");
                    setLoading(false);
                }
                return;
            }

            // Cash on Delivery (COD) -> Directly place cart order
            const response = await placeOrderFromCart(orderData);

            if (response.success) {
                try {
                    localStorage.removeItem(STORAGE_KEY_STEP);
                    await clearCart();
                } catch (error) {
                    console.error("Error clearing cart after order placement:", error);
                }
                router.push('/orders?celebrate=true');
            } else {
                setErrorMessage(response.message || "Failed to place order. Please try again.");
                setLoading(false);
            }
        } catch (error: any) {
            console.error("Order placement failed:", error);
            setErrorMessage(error.response?.data?.message || "Failed to place order. Please check your connection and try again.");
            setLoading(false);
        }
    });

    const nonCodItems = items.filter(item => {
        const codVal = (item.variant as any)?.is_cod_allowed ?? (item.variant as any)?.isCodAllowed;
        return codVal === false || codVal === 0 || codVal === '0';
    });
    const isCodDisabled = nonCodItems.length > 0;

    useEffect(() => {
        if (isCodDisabled && paymentMethod === 'cod') {
            setPaymentMethod('online');
        }
    }, [isCodDisabled, paymentMethod]);

    const calculatedBreakdown = items.reduce((acc, item) => {
        const rawRate = (item.product as any)?.gstRate ?? (item.product as any)?.tax_rate ?? (item.variant as any)?.gstRate ?? 18;
        const gstRate = parseFloat(String(rawRate)) || 18.0;
        const unitBase = parseFloat(String(item.price || item.variant?.sp || 0));
        const qty = item.quantity || 1;
        const itemTaxable = Math.round(unitBase * qty);
        const itemGst = Math.round(itemTaxable * (gstRate / 100));
        const itemGross = Math.round(itemTaxable + itemGst);
        const rawShipping = (item.variant as any)?.shipping_charges ?? (item.variant as any)?.shippingCharges ?? 0;
        const itemShipping = Math.round((parseFloat(String(rawShipping)) || 0) * qty);

        return {
            taxableSubtotal: acc.taxableSubtotal + itemTaxable,
            totalGst: acc.totalGst + itemGst,
            totalShipping: acc.totalShipping + itemShipping,
            grandTotal: acc.grandTotal + itemGross + itemShipping,
        };
    }, { taxableSubtotal: 0, totalGst: 0, totalShipping: 0, grandTotal: 0 });

    const taxableSubtotal = Math.round(calculatedBreakdown.taxableSubtotal);
    const totalTax = Math.round(calculatedBreakdown.totalGst);
    const totalShipping = Math.round(calculatedBreakdown.totalShipping);
    const finalTotal = Math.round(taxableSubtotal + totalTax + totalShipping);
    const subtotal = taxableSubtotal;

    // Get current form values for review step
    const currentFormData = getValues();

    const steps = [
        { step: 1, label: "Delivery" },
        { step: 2, label: "Payment" },
        { step: 3, label: "Review" },
    ];

    const inputClass = (hasError?: boolean) =>
        `w-full px-4 py-3 text-sm text-on-surface bg-pure-white border transition focus:outline-none focus:border-on-surface ${
            hasError ? "border-primary" : "border-border-line"
        }`;

    const labelClass = "label-caps text-[10px] text-on-surface block mb-1.5";

    if (cartLoading || authLoading) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center p-4">
                <div className="bg-surface-ivory border border-border-line p-8 max-w-sm w-full text-center flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <span className="label-caps text-primary block mb-2">Checkout</span>
                    <h3 className="display-section text-on-surface text-xl">Loading Checkout</h3>
                    <p className="text-[13px] text-body-slate mt-2">Preparing your bag and shipping details...</p>
                </div>
            </div>
        );
    }

    if (items.length === 0 && !searchParams.get("order_id")) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center p-4">
                <div className="bg-surface-ivory border border-border-line p-8 max-w-md w-full text-center flex flex-col items-center">
                    <ShoppingBag className="w-10 h-10 text-primary mb-5" strokeWidth={1.25} />
                    <span className="label-caps text-primary block mb-2">Editorial Bag</span>
                    <h2 className="display-section text-on-surface">Your Bag Is Unfilled</h2>
                    <p className="text-[14px] text-body-slate mt-3 leading-relaxed">
                        No commissions reserved yet. Explore curated editions before checkout.
                    </p>
                    <button
                        type="button"
                        onClick={() => router.push("/products")}
                        className="sv-btn-primary mt-8 !min-h-[44px] !py-3 !px-8"
                    >
                        Explore The Edit
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface">
            <div className="max-w-site mx-auto site-pad py-8 sm:py-12 lg:py-14 space-y-8">

                {/* Top strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border-line">
                    <div className="flex items-center gap-2 label-caps text-body-slate">
                        <span className="text-primary">SVASTRA</span>
                        <span className="opacity-40">|</span>
                        <span className="text-on-surface">Checkout</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <p className="label-caps text-[10px] text-body-slate inline-flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                            Encrypted Checkout
                        </p>
                        <Link
                            href="/cart"
                            className="label-caps text-[10px] text-on-surface hover:text-primary inline-flex items-center gap-1.5 underline underline-offset-4 decoration-border-line hover:decoration-primary transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Return to Bag
                        </Link>
                    </div>
                </div>

                {/* Progress */}
                <div className="space-y-4">
                    <p className="label-caps text-[10px] text-body-slate">
                        Checkout Step {String(currentStep).padStart(2, "0")} of 03
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        {steps.map(({ step, label }) => {
                            const isDone = currentStep > step;
                            const isCurrent = currentStep === step;
                            return (
                                <button
                                    key={step}
                                    type="button"
                                    onClick={() => isDone && setCurrentStep(step)}
                                    disabled={!isDone && !isCurrent}
                                    className={`text-left border px-3 py-3 sm:px-4 sm:py-4 transition-colors ${
                                        isCurrent
                                            ? "border-on-surface bg-surface-ivory"
                                            : isDone
                                                ? "border-border-line bg-surface hover:border-on-surface cursor-pointer"
                                                : "border-border-line bg-surface-subtle opacity-70 cursor-default"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold border ${
                                                isCurrent
                                                    ? "bg-on-surface text-surface border-on-surface"
                                                    : isDone
                                                        ? "bg-primary text-surface border-primary"
                                                        : "bg-surface text-body-slate border-border-line"
                                            }`}
                                        >
                                            {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : step}
                                        </span>
                                        <span className={`label-caps text-[10px] ${isCurrent ? "text-on-surface" : "text-body-slate"}`}>
                                            {label}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {hasInsufficientStockItems && (
                    <div className="bg-surface-ivory border border-primary p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                            <h4 className="label-caps text-primary">Unavailable Items Detected</h4>
                            <p className="text-[13px] text-body-slate mt-1.5 leading-relaxed">
                                One or more items in your bag are out of stock or have insufficient inventory.
                                Update or remove them before completing purchase.
                            </p>
                            <Link
                                href="/cart"
                                className="mt-2 inline-block label-caps text-[10px] text-primary underline underline-offset-4"
                            >
                                Return to Bag to Fix Items
                            </Link>
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <div className="bg-surface-ivory border border-primary p-4 flex items-start justify-between gap-3 text-[13px] text-on-surface">
                        <div className="flex items-start gap-2">
                            <X className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span>{errorMessage}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setErrorMessage(null)}
                            className="label-caps text-[10px] text-body-slate hover:text-primary"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    <div className="lg:col-span-8 space-y-6">

                        {/* STEP 1: Delivery */}
                        {currentStep === 1 && (
                            <div className="bg-surface border border-border-line p-6 sm:p-8 space-y-6">
                                <div className="flex items-center justify-between pb-4 border-b border-border-line">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-surface-ivory text-primary border border-border-line flex items-center justify-center shrink-0">
                                            <MapPin className="w-5 h-5" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold uppercase tracking-tight text-on-surface">Delivery Address</h2>
                                            <p className="text-[12px] text-body-slate mt-0.5">Your address is automatically saved as you type</p>
                                        </div>
                                    </div>
                                    <span className="label-caps text-[10px] text-primary">Step 01</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClass}>
                                            Full Name <span className="text-primary">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-body-slate">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="text"
                                                {...register("fullName")}
                                                className={`${inputClass(!!errors.fullName)} pl-10`}
                                                placeholder="e.g. Rahul Sharma"
                                            />
                                        </div>
                                        {errors.fullName && (
                                            <p className="text-primary text-xs mt-1.5">{errors.fullName.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Phone Number <span className="text-primary">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-body-slate">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="tel"
                                                maxLength={10}
                                                {...register("phoneNumber")}
                                                className={`${inputClass(!!errors.phoneNumber)} pl-10`}
                                                placeholder="10-digit mobile number"
                                            />
                                        </div>
                                        {errors.phoneNumber && (
                                            <p className="text-primary text-xs mt-1.5">{errors.phoneNumber.message}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={labelClass}>
                                            Address Line 1 <span className="text-primary">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-body-slate">
                                                <Home className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="text"
                                                {...register("addressLine1")}
                                                className={`${inputClass(!!errors.addressLine1)} pl-10`}
                                                placeholder="Flat, house no., building, street"
                                            />
                                        </div>
                                        {errors.addressLine1 && (
                                            <p className="text-primary text-xs mt-1.5">{errors.addressLine1.message}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={labelClass}>
                                            Address Line 2 / Landmark <span className="text-body-slate font-normal">(Optional)</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-body-slate">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="text"
                                                {...register("addressLine2")}
                                                className={`${inputClass(false)} pl-10`}
                                                placeholder="Landmark, sector, area"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            State <span className="text-primary">*</span>
                                        </label>
                                        <SearchableDropdown
                                            items={statesList}
                                            placeholder={loadingStates ? "Loading states..." : "Select State"}
                                            displayProperty="name"
                                            valueProperty="name"
                                            value={watch("state")}
                                            showAddButton={false}
                                            disabled={loadingStates}
                                            error={errors.state?.message}
                                            onChange={(selectedStateName) => {
                                                setValue("state", selectedStateName, { shouldValidate: true });
                                                setValue("city", "", { shouldValidate: false });
                                            }}
                                            onSelectionChange={(selectedState) => {
                                                if (selectedState) {
                                                    setValue("state", selectedState.name, { shouldValidate: true });
                                                    setValue("city", "", { shouldValidate: false });
                                                    setLoadingCities(true);
                                                    fetchCitiesByState(selectedState.id).then((cities) => {
                                                        setCitiesList(cities);
                                                        setLoadingCities(false);
                                                    });
                                                }
                                            }}
                                        />
                                        {errors.state && (
                                            <p className="text-primary text-xs mt-1.5">{errors.state.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            City <span className="text-primary">*</span>
                                        </label>
                                        <SearchableDropdown
                                            items={citiesList}
                                            placeholder={
                                                !watch("state")
                                                    ? "Select state first"
                                                    : loadingCities
                                                        ? "Loading cities..."
                                                        : "Select City"
                                            }
                                            displayProperty="name"
                                            valueProperty="name"
                                            value={watch("city")}
                                            showAddButton={false}
                                            disabled={!watch("state") || loadingCities}
                                            error={errors.city?.message}
                                            onChange={(selectedCityName) => {
                                                setValue("city", selectedCityName, { shouldValidate: true });
                                            }}
                                            onSelectionChange={(selectedCity) => {
                                                if (selectedCity) {
                                                    setValue("city", selectedCity.name, { shouldValidate: true });
                                                }
                                            }}
                                        />
                                        {errors.city && (
                                            <p className="text-primary text-xs mt-1.5">{errors.city.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Postal Code (PIN) <span className="text-primary">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            {...register("postalCode")}
                                            className={inputClass(!!errors.postalCode)}
                                            placeholder="6-digit PIN code"
                                        />
                                        {errors.postalCode && (
                                            <p className="text-primary text-xs mt-1.5">{errors.postalCode.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelClass}>Country</label>
                                        <input
                                            type="text"
                                            readOnly
                                            value="India"
                                            {...register("country")}
                                            className="w-full px-4 py-3 bg-surface-subtle text-body-slate text-sm font-semibold border border-border-line cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border-line grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { icon: ShieldCheck, title: "Genuine Archive" },
                                        { icon: Truck, title: "Tracked Delivery" },
                                        { icon: RotateCcw, title: "Easy Returns" },
                                    ].map(({ icon: Icon, title }) => (
                                        <div key={title} className="flex items-center gap-2">
                                            <Icon className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
                                            <span className="label-caps text-[10px] text-on-surface">{title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Payment */}
                        {currentStep === 2 && (
                            <div className="bg-surface border border-border-line p-6 sm:p-8">
                                <SecurePaymentPanel
                                    paymentMethod={paymentMethod}
                                    onChange={(m) => setPaymentMethod(m)}
                                    isCodDisabled={isCodDisabled}
                                    codDisabledReason={
                                        isCodDisabled ? (
                                            <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                                                {nonCodItems.map((it) => (
                                                    <li key={it.id}>
                                                        {it.product.name} ({it.variant.title})
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : undefined
                                    }
                                    finalTotal={finalTotal}
                                />
                            </div>
                        )}

                        {/* STEP 3: Review */}
                        {currentStep === 3 && (
                            <div className="bg-surface border border-border-line p-6 sm:p-8 space-y-6">
                                <div className="flex items-center justify-between pb-4 border-b border-border-line">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-surface-ivory text-primary border border-border-line flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold uppercase tracking-tight text-on-surface">Review &amp; Place Order</h2>
                                            <p className="text-[12px] text-body-slate mt-0.5">Confirm delivery and payment before placing</p>
                                        </div>
                                    </div>
                                    <span className="label-caps text-[10px] text-primary">Step 03</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-surface-ivory border border-border-line">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 text-on-surface font-bold text-sm">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                <span>Delivering To</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(1)}
                                                className="label-caps text-[10px] text-primary hover:text-on-surface underline underline-offset-4"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <p className="font-semibold text-on-surface text-sm">{currentFormData.fullName}</p>
                                        <p className="text-[12px] text-body-slate mt-1 leading-relaxed">
                                            {currentFormData.addressLine1}
                                            {currentFormData.addressLine2 ? `, ${currentFormData.addressLine2}` : ""}
                                            <br />
                                            {currentFormData.city}, {currentFormData.state} - {currentFormData.postalCode}
                                        </p>
                                        <p className="text-[12px] text-on-surface font-medium mt-1">{currentFormData.phoneNumber}</p>
                                    </div>

                                    <div className="p-4 bg-surface-ivory border border-border-line">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 text-on-surface font-bold text-sm">
                                                <CreditCard className="w-4 h-4 text-primary" />
                                                <span>Payment Type</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(2)}
                                                className="label-caps text-[10px] text-primary hover:text-on-surface underline underline-offset-4"
                                            >
                                                Change
                                            </button>
                                        </div>
                                        <p className="font-semibold text-on-surface text-sm">
                                            {paymentMethod === "cod" ? "Cash on Delivery (COD)" : "Online Payment (Prepaid)"}
                                        </p>
                                        <p className="text-[12px] text-body-slate mt-1">
                                            {paymentMethod === "cod"
                                                ? `Pay ${formatINR(finalTotal)} in cash/UPI upon delivery.`
                                                : "Secure instant checkout via GoKwik Gateway."}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="label-caps text-[10px] text-on-surface">
                                        Items to be delivered ({count})
                                    </h4>
                                    <div className="divide-y divide-border-line border border-border-line bg-pure-white">
                                        {items.map((item) => {
                                            const imgSrc = resolveItemImage(
                                                item.variant?.image_url || item.product?.image_url || null
                                            );
                                            const returnable =
                                                (item.variant as any)?.is_returnable ??
                                                (item.variant as any)?.isReturnable ??
                                                true;
                                            const returnDays =
                                                (item.variant as any)?.return_window_days ??
                                                (item.variant as any)?.returnWindowDays ??
                                                7;
                                            const shippingCharge = Number(
                                                (item.variant as any)?.shipping_charges ??
                                                    (item.variant as any)?.shippingCharges ??
                                                    0
                                            );

                                            return (
                                                <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start gap-4">
                                                    <div className="relative w-20 aspect-[3/4] bg-surface-ivory border border-border-line overflow-hidden shrink-0 media-frame">
                                                        <Image
                                                            src={imgSrc}
                                                            alt={item.product.name}
                                                            fill
                                                            unoptimized
                                                            className="object-cover object-top"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold uppercase tracking-tight text-on-surface text-sm line-clamp-2">
                                                            {item.product.name}
                                                        </h4>
                                                        <p className="text-[12px] text-body-slate mt-0.5">
                                                            {item.variant.title}
                                                            {item.variant.sku ? ` • SKU: ${item.variant.sku}` : ""}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                                            <span className="label-caps text-[10px] text-body-slate">
                                                                Qty: {item.quantity}
                                                            </span>
                                                            <span className="label-caps text-[10px] text-on-surface">
                                                                {formatINR(item.price)} / unit
                                                            </span>
                                                            {returnable ? (
                                                                <span className="label-caps text-[10px] text-body-slate">
                                                                    {returnDays}d returns
                                                                </span>
                                                            ) : (
                                                                <span className="label-caps text-[10px] text-primary">
                                                                    Non-returnable
                                                                </span>
                                                            )}
                                                            <span className="label-caps text-[10px] text-body-slate">
                                                                {shippingCharge > 0
                                                                    ? `+ ${formatINR(shippingCharge * item.quantity)} delivery`
                                                                    : "Free delivery"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0 sm:ml-auto">
                                                        <p className="text-base font-bold text-on-surface">{formatINR(item.total)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
                        <div className="bg-surface-ivory border border-[#E4D9C6] p-6 sm:p-7 space-y-5">
                            <div className="flex items-center justify-between pb-4 border-b border-on-surface/10">
                                <h2 className="text-base font-bold uppercase tracking-tight text-on-surface">Order Summary</h2>
                                <span className="label-caps text-[9px] text-body-slate">
                                    {count} {count === 1 ? "Item" : "Items"}
                                </span>
                            </div>

                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                {items.map((item) => {
                                    const stockInfo = getItemStockStatus(item);
                                    const imgSrc = resolveItemImage(
                                        item.variant?.image_url || item.product?.image_url || null
                                    );

                                    return (
                                        <div
                                            key={item.id}
                                            className={`p-3 border space-y-3 ${
                                                stockInfo.isOutOfStock
                                                    ? "bg-surface border-primary"
                                                    : "bg-surface border-border-line"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="relative w-14 aspect-[3/4] bg-surface-ivory border border-border-line overflow-hidden shrink-0 media-frame">
                                                    <Image
                                                        src={imgSrc}
                                                        alt={item.product?.name || "Product"}
                                                        fill
                                                        unoptimized
                                                        className={`object-cover object-top ${stockInfo.isOutOfStock ? "opacity-55 grayscale" : ""}`}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold uppercase tracking-tight text-on-surface text-[11px] line-clamp-2 leading-snug">
                                                        {item.product?.name}
                                                    </h3>
                                                    <p className="text-[11px] text-body-slate mt-0.5">{item.variant?.title}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[12px] font-semibold text-on-surface">
                                                            {formatINR(item.price)}
                                                        </span>
                                                        {item.variant?.mrp && Number(item.variant.mrp) > Number(item.price) && (
                                                            <span className="text-[10px] text-body-slate line-through">
                                                                {formatINR(item.variant.mrp)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {stockInfo.isOutOfStock ? (
                                                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-primary">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>Out of Stock</span>
                                                        </div>
                                                    ) : stockInfo.isInsufficientStock ? (
                                                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-accent-ochre">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            <span>Only {stockInfo.availableStock} in stock</span>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-border-line text-[11px]">
                                                <span className="text-body-slate">Quantity</span>
                                                <span className="font-semibold text-on-surface">{item.quantity}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-2.5 text-[13px] text-body-slate border-t border-on-surface/10 pt-4">
                                <div className="flex justify-between">
                                    <span>Items Base Price</span>
                                    <span className="font-semibold text-on-surface">{formatINR(taxableSubtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Estimated GST / Tax</span>
                                    <span className="font-semibold text-on-surface">{formatINR(totalTax)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Delivery Charges</span>
                                    {totalShipping > 0 ? (
                                        <span className="font-semibold text-on-surface">{formatINR(totalShipping)}</span>
                                    ) : (
                                        <span className="label-caps text-[10px] text-primary font-bold">FREE</span>
                                    )}
                                </div>
                                <div className="pt-3 border-t border-on-surface/10 flex justify-between items-baseline gap-3">
                                    <div>
                                        <span className="text-sm font-bold uppercase tracking-tight text-on-surface block">Total Payable</span>
                                        <span className="label-caps text-[9px] text-body-slate">All taxes &amp; shipping included</span>
                                    </div>
                                    <span className="text-xl font-bold text-on-surface tracking-tight">{formatINR(finalTotal)}</span>
                                </div>
                            </div>

                            <p className="text-[11px] text-body-slate flex items-center justify-center gap-1.5 pt-1">
                                <Lock className="w-3 h-3 text-primary" />
                                Guaranteed Safe &amp; Encrypted Checkout
                            </p>
                        </div>

                        {hasInsufficientStockItems && (
                            <div className="p-3 bg-surface border border-primary text-[12px] text-primary flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>Checkout disabled until unavailable items are removed from bag.</span>
                            </div>
                        )}

                        <div className="space-y-2.5">
                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    disabled={hasInsufficientStockItems}
                                    className="sv-btn-primary w-full !min-h-[44px] !py-3 !px-4 !text-[11px] !gap-2 disabled:opacity-50"
                                >
                                    <span>
                                        {hasInsufficientStockItems
                                            ? "Unavailable Items in Bag"
                                            : `Proceed to ${currentStep === 1 ? "Payment" : "Review"}`}
                                    </span>
                                    {!hasInsufficientStockItems && <ChevronRight className="w-4 h-4" />}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handlePlaceOrder}
                                    disabled={loading || hasInsufficientStockItems}
                                    className="sv-btn-primary w-full !min-h-[44px] !py-3 !px-4 !text-[11px] !gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Confirming Order...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            <span>
                                                {hasInsufficientStockItems
                                                    ? "Unavailable Items in Bag"
                                                    : `Place Order (${formatINR(finalTotal)})`}
                                            </span>
                                        </>
                                    )}
                                </button>
                            )}

                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={handlePreviousStep}
                                    className="sv-btn-outline w-full !min-h-[44px] !py-3 !px-4 !text-[11px]"
                                >
                                    Back
                                </button>
                            ) : (
                                <Link
                                    href="/products"
                                    className="sv-btn-outline w-full !min-h-[44px] !py-3 !px-4 !text-[11px] inline-flex items-center justify-center"
                                >
                                    Continue Shopping
                                </Link>
                            )}
                        </div>

                        <div className="bg-surface-subtle border border-border-line px-5 py-4 flex items-center justify-between gap-3">
                            <div>
                                <p className="label-caps text-[10px] text-on-surface">Dedicated Concierge</p>
                                <p className="text-[12px] text-body-slate mt-0.5">Need help with your edit?</p>
                            </div>
                            <Link
                                href="/contact-us"
                                className="label-caps text-[10px] text-primary hover:text-on-surface underline underline-offset-4"
                            >
                                Connect
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>

            <Script
                id="gokwik-sdk"
                src="https://pdp.gokwik.co/build/gokwik.js"
                strategy="afterInteractive"
                onLoad={() => {
                    gokwikSdkLoadedRef.current = true;
                    setGokwikSdkLoaded(true);
                    console.log("GoKwik SDK loaded successfully");
                }}
                onError={() => {
                    console.warn("GoKwik SDK script failed to load from pdp.gokwik.co, trying fallback...");
                }}
            />

            <Modal
                isOpen={showPaymentModal}
                onClose={() => {}}
                title={
                    paymentStatus === "verifying"
                        ? "Verifying Payment"
                        : paymentStatus === "success"
                            ? "Payment Successful"
                            : "Payment Failed"
                }
                width="max-w-md"
            >
                <div className="flex flex-col items-center justify-center p-6 text-center">
                    {paymentStatus === "verifying" && (
                        <>
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                            <p className="text-body-slate text-sm font-medium">{paymentMessage}</p>
                        </>
                    )}
                    {paymentStatus === "success" && (
                        <>
                            <div className="w-16 h-16 bg-surface-ivory text-primary border border-border-line flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-9 h-9" />
                            </div>
                            <h3 className="text-xl font-bold uppercase tracking-tight text-on-surface mb-2">Order Confirmed</h3>
                            <p className="text-body-slate text-sm">{paymentMessage}</p>
                        </>
                    )}
                    {paymentStatus === "failed" && (
                        <>
                            <div className="w-16 h-16 bg-surface-ivory text-primary border border-border-line flex items-center justify-center mb-4">
                                <X className="w-9 h-9" />
                            </div>
                            <h3 className="text-xl font-bold uppercase tracking-tight text-on-surface mb-2">Payment Incomplete</h3>
                            <p className="text-body-slate text-sm">{paymentMessage}</p>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-surface flex items-center justify-center p-4">
                <div className="bg-surface-ivory border border-border-line p-8 max-w-sm w-full text-center flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="label-caps text-primary mb-2">Checkout</p>
                    <p className="text-sm font-semibold text-on-surface">Loading Checkout...</p>
                </div>
            </div>
        }>
            <CheckoutPageContent />
        </Suspense>
    );
}
