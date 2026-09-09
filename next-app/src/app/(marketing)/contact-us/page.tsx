'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import {
    Mail,
    Phone,
    MapPin,
    Send,
    CheckCircle2,
    Loader2,
    Package,
    RotateCcw,
    CreditCard,
    ShieldCheck,
    Truck,
    HelpCircle,
    Clock,
    ArrowRight,
    Search,
    ChevronDown,
    Headphones,
    Sparkles,
    User,
    Check
} from 'lucide-react';
import { RiWhatsappLine } from 'react-icons/ri';
import { submitContactMessage } from '../../../../utils/contactUsApi';
import ErrorMessage from '@/components/(sheared)/ErrorMessage';
import SuccessMessage from '@/components/(sheared)/SuccessMessage';
import { useLoader } from '@/context/LoaderContext';
import { useAuth } from '@/context/AuthContext';
import { fetchSettingByKey } from '../../../../utils/settingsApi';

const contactSchema = Yup.object().shape({
    name: Yup.string()
        .required('Full name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters')
        .matches(/^[a-zA-Z\s.]+$/, 'Name can only contain letters and spaces'),
    email: Yup.string()
        .required('Email address is required')
        .email('Please enter a valid email address')
        .max(255, 'Email must not exceed 255 characters'),
    phone_number: Yup.string()
        .required('Phone number is required')
        .matches(/^[0-9+\-\s()]{10,20}$/, 'Please enter a valid 10-digit phone number')
        .min(10, 'Phone number must be at least 10 digits')
        .max(20, 'Phone number must not exceed 20 characters'),
    order_id: Yup.string().optional(),
    topic: Yup.string().required('Please select an inquiry topic'),
    message: Yup.string()
        .required('Message description is required')
        .min(10, 'Please describe your query in at least 10 characters')
        .max(1000, 'Message must not exceed 1000 characters')
});

interface ContactFormData {
    name: string;
    email: string;
    phone_number: string;
    order_id?: string;
    topic: string;
    message: string;
}

const TOPICS = [
    { id: 'orders', label: 'Order Status & Tracking', icon: Package, hint: 'Questions regarding placed orders, delays, or tracking' },
    { id: 'returns', label: 'Returns & Exchange', icon: RotateCcw, hint: 'Return requests, replacement policy, or pickup schedule' },
    { id: 'refunds', label: 'Refunds & Payments', icon: CreditCard, hint: 'Refund timeline, failed payments, or invoice requests' },
    { id: 'product', label: 'Product & Warranty', icon: ShieldCheck, hint: 'Specifications, size guide, warranty, or availability' },
    { id: 'shipping', label: 'Shipping & Delivery', icon: Truck, hint: 'Pincode serviceability, address changes, or courier issues' },
    { id: 'other', label: 'Other Inquiries', icon: HelpCircle, hint: 'General feedback, partnership, or account help' }
];

const FAQS = [
    {
        category: 'Orders & Tracking',
        question: 'How do I track my active order?',
        answer: 'You can instantly check your live delivery status in the "My Orders" section or on our dedicated Track Shipment page by entering your tracking or order ID. Once shipped, SMS and WhatsApp updates are sent with live courier tracking links.'
    },
    {
        category: 'Orders & Tracking',
        question: 'Can I change my delivery address after placing an order?',
        answer: 'If your order has not been dispatched yet, you can modify the delivery address by contacting our support team or updating it in My Orders. Once dispatched with Delhivery/courier, address re-routing may take 24-48 hours.'
    },
    {
        category: 'Returns & Refunds',
        question: 'What is the return and replacement window?',
        answer: 'We provide a hassle-free 7-day return and replacement policy for all eligible items. Items must be in original condition with tags and packaging intact. Initiate a return directly from the My Orders dashboard.'
    },
    {
        category: 'Returns & Refunds',
        question: 'How long does it take to receive a refund?',
        answer: 'Once the returned package passes quality inspection at our warehouse, refunds are initiated within 24 hours. UPI and card refunds reflect in 2-5 business days. COD refunds are credited via direct bank transfer/UPI.'
    },
    {
        category: 'Payments & Pricing',
        question: 'Which payment methods are supported on SVastra?',
        answer: 'We support all major payment modes including UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards (Visa, Mastercard, RuPay), Net Banking across 50+ banks, and Cash on Delivery (COD).'
    },
    {
        category: 'Shipping & Delivery',
        question: 'What are standard shipping timelines and charges?',
        answer: 'Standard shipping takes 3-6 business days across India. We provide free shipping on prepaid orders and orders above ₹499. Express delivery is available for select metro cities.'
    }
];

export default function ContactUsPage() {
    const { user } = useAuth();
    const { showLoader, hideLoader } = useLoader();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [whatsappNumber, setWhatsappNumber] = useState<string>('919729310456');
    const [faqSearch, setFaqSearch] = useState<string>('');
    const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('All');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    const formRef = useRef<HTMLDivElement | null>(null);

    // Fetch dynamic WhatsApp support number
    useEffect(() => {
        fetchSettingByKey('whatsapp_number')
            .then((setting) => {
                if (setting?.value) setWhatsappNumber(setting.value.replace(/[^0-9]/g, ''));
            })
            .catch(() => { });
    }, []);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<ContactFormData>({
        resolver: yupResolver(contactSchema) as any,
        defaultValues: {
            name: '',
            email: '',
            phone_number: '',
            order_id: '',
            topic: 'orders',
            message: ''
        }
    });

    // Autofill user credentials if logged in
    useEffect(() => {
        if (user) {
            if (user.name) setValue('name', user.name);
            if (user.email) setValue('email', user.email);
            const userPhone = (user as any).phone_number || (user as any).phone || '';
            if (userPhone) setValue('phone_number', userPhone);
        }
    }, [user, setValue]);

    const selectedTopic = watch('topic');
    const currentMessage = watch('message') || '';

    const handleTopicSelect = (topicId: string) => {
        setValue('topic', topicId, { shouldValidate: true });
    };

    const scrollToFormWithTopic = (topicId: string) => {
        setValue('topic', topicId, { shouldValidate: true });
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const onSubmit = async (data: ContactFormData) => {
        setLoading(true);
        setSuccess(false);
        setErrorMessage(null);
        setSuccessMessage(null);
        showLoader();

        // Format message with topic and order id for comprehensive backend logging
        const topicLabel = TOPICS.find((t) => t.id === data.topic)?.label || data.topic;
        const formattedMessage = data.order_id?.trim()
            ? `[Topic: ${topicLabel} | Order ID: ${data.order_id.trim()}]\n\n${data.message}`
            : `[Topic: ${topicLabel}]\n\n${data.message}`;

        try {
            const payload = {
                name: data.name.trim(),
                email: data.email.trim(),
                phone_number: data.phone_number.trim(),
                message: formattedMessage
            };

            const response = await submitContactMessage(payload);
            if (response.success) {
                setSuccess(true);
                setSuccessMessage("Thank you for reaching out! Your support ticket has been received. Our team will get back to you within 24 hours.");
                reset({
                    name: user?.name || '',
                    email: user?.email || '',
                    phone_number: (user as any)?.phone_number || (user as any)?.phone || '',
                    order_id: '',
                    topic: 'orders',
                    message: ''
                });
            } else {
                setErrorMessage("Failed to send message. Please try again or chat with us on WhatsApp.");
            }
        } catch (error: any) {
            console.error('Error submitting contact form:', error);
            setErrorMessage(error.response?.data?.message || "Failed to send message. Please check your internet connection or try WhatsApp support.");
        } finally {
            setLoading(false);
            hideLoader();
        }
    };

    // Filter FAQs based on search and category
    const filteredFaqs = useMemo(() => {
        return FAQS.filter((faq) => {
            const matchesCategory = selectedFaqCategory === 'All' || faq.category === selectedFaqCategory;
            const matchesSearch =
                !faqSearch.trim() ||
                faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
                faq.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
                faq.category.toLowerCase().includes(faqSearch.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [faqSearch, selectedFaqCategory]);

    const faqCategories = ['All', 'Orders & Tracking', 'Returns & Refunds', 'Payments & Pricing', 'Shipping & Delivery'];

    // Shared editorial input chrome — sharp corners, hairline border, no blue focus ring
    const inputBase =
        'w-full px-4 py-3 bg-pure-white border text-[14px] text-on-surface placeholder:text-body-slate/60 outline-none transition-colors';
    const inputIdle = 'border-border-line focus:border-on-surface';
    const inputError = 'border-primary focus:border-primary bg-surface-ivory/60';

    return (
        <div className="min-h-screen bg-surface text-on-surface pb-24 sm:pb-0">
            {errorMessage && <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />}
            {successMessage && <SuccessMessage message={successMessage} onClose={() => setSuccessMessage(null)} />}

            {/* ══════════════════════════════════════════════════════
                1. MASTHEAD — Concierge desk header
            ══════════════════════════════════════════════════════ */}
            <section className="w-full bg-surface border-b border-border-line">
                <div className="max-w-site mx-auto site-pad section-y">
                    {/* Breadcrumbs */}
                    <nav className="label-caps text-body-slate mb-8 flex flex-wrap items-center gap-2">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="text-on-surface/30" aria-hidden="true">/</span>
                        <span className="text-body-slate">Client Care</span>
                        <span className="text-on-surface/30" aria-hidden="true">/</span>
                        <span className="text-on-surface">Concierge</span>
                    </nav>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                        {/* Title & Subtitle */}
                        <div className="space-y-5 max-w-3xl">
                            <div className="inline-flex items-center gap-2 bg-surface-ivory px-3 py-1.5 border border-border-line label-caps text-primary">
                                <Headphones className="w-3.5 h-3.5" />
                                <span>SVastra Client Concierge</span>
                            </div>
                            <h1 className="display-hero text-on-surface">
                                How can we
                                <br />
                                <span className="text-primary">help you today?</span>
                            </h1>
                            <p className="text-[15px] sm:text-base leading-[1.6] text-body-slate max-w-2xl">
                                Guidance on orders, returns, and delivery — or a direct line to a specialist who
                                knows the archive as well as you do.
                            </p>
                        </div>

                        {/* Quick Contact Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
                            <a
                                href={`https://wa.me/${whatsappNumber}?text=Hi%20SVastra%20Support,%20I%20need%20help%20with%20my%20order.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sv-btn-primary cursor-pointer"
                            >
                                <RiWhatsappLine className="text-lg" />
                                <span>WhatsApp Concierge</span>
                            </a>
                            <a href="tel:+919729310456" className="sv-btn-outline gap-3">
                                <Phone className="w-3.5 h-3.5" />
                                <span>+91 9729310456</span>
                            </a>
                        </div>
                    </div>

                    {/* Interactive Help Search Bar */}
                    <div className="mt-10 max-w-2xl">
                        <label htmlFor="help-search" className="label-caps text-body-slate block mb-2">
                            Search Help Topics
                        </label>
                        <div className="relative flex items-center border border-border-line bg-pure-white focus-within:border-on-surface transition-colors">
                            <Search className="w-4 h-4 text-body-slate absolute left-4 pointer-events-none" />
                            <input
                                id="help-search"
                                type="text"
                                value={faqSearch}
                                onChange={(e) => setFaqSearch(e.target.value)}
                                placeholder="Describe your issue (e.g. tracking, return pickup, refund timeline)..."
                                className="w-full pl-11 pr-20 py-3.5 bg-transparent text-[14px] text-on-surface placeholder:text-body-slate/60 outline-none border-0"
                            />
                            {faqSearch && (
                                <button
                                    type="button"
                                    onClick={() => setFaqSearch('')}
                                    className="absolute right-4 label-caps text-body-slate hover:text-primary transition-colors cursor-pointer"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Trust Badges Strip */}
                    <div className="mt-8 pt-6 border-t border-border-line grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 label-caps text-body-slate">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent-ochre" />
                            <span>Concierge Online Now</span>
                        </div>
                        <div className="flex items-center gap-2 label-caps text-body-slate">
                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                            <span>100% Buyer Protection</span>
                        </div>
                        <div className="flex items-center gap-2 label-caps text-body-slate">
                            <Clock className="w-3.5 h-3.5 text-accent-blue" />
                            <span>24-Hour Ticket Resolution</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                2. SELF-SERVICE PILLARS
            ══════════════════════════════════════════════════════ */}
            <section className="w-full bg-surface-subtle border-b border-border-line">
                <div className="max-w-site mx-auto site-pad py-12 sm:py-14">
                    <div className="border-b border-border-line pb-5 mb-6">
                        <span className="label-caps text-primary block mb-2">Self Service</span>
                        <h2 className="display-section text-on-surface">Resolve It Yourself</h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                        {[
                            {
                                title: 'Track Orders',
                                desc: 'Live tracking & updates',
                                icon: Package,
                                color: 'text-primary',
                                href: '/orders',
                                isLink: true
                            },
                            {
                                title: 'Returns & Pickup',
                                desc: '7-day easy returns',
                                icon: RotateCcw,
                                color: 'text-accent-ochre',
                                href: '/orders',
                                isLink: true
                            },
                            {
                                title: 'Refund Status',
                                desc: 'Bank & UPI timeline',
                                icon: CreditCard,
                                color: 'text-accent-magenta',
                                href: '/orders',
                                isLink: true
                            },
                            {
                                title: 'Shipping & Pin',
                                desc: 'Delhivery delivery check',
                                icon: Truck,
                                color: 'text-accent-blue',
                                href: '/track-order',
                                isLink: true
                            },
                            {
                                title: 'Care & Craft',
                                desc: '100% handloom fiber',
                                icon: ShieldCheck,
                                color: 'text-primary',
                                topicId: 'product',
                                isLink: false
                            },
                            {
                                title: 'Manage Profile',
                                desc: 'Addresses & security',
                                icon: User,
                                color: 'text-on-surface',
                                href: '/profile',
                                isLink: true
                            }
                        ].map((item, idx) => (
                            item.isLink ? (
                                <Link
                                    key={idx}
                                    href={item.href || '/orders'}
                                    className="group bg-surface border border-border-line hover:border-on-surface p-4 sm:p-5 transition-colors flex flex-col justify-between"
                                >
                                    <div className={`w-10 h-10 flex items-center justify-center mb-4 bg-surface-ivory border border-border-line ${item.color}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-[13px] font-bold uppercase tracking-tight text-on-surface group-hover:text-primary transition-colors leading-tight">
                                            {item.title}
                                        </h3>
                                        <p className="text-[12px] text-body-slate mt-1 line-clamp-1 leading-snug">
                                            {item.desc}
                                        </p>
                                    </div>
                                </Link>
                            ) : (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => scrollToFormWithTopic(item.topicId || 'product')}
                                    className="group bg-surface border border-border-line hover:border-on-surface p-4 sm:p-5 transition-colors flex flex-col justify-between text-left cursor-pointer"
                                >
                                    <div className={`w-10 h-10 flex items-center justify-center mb-4 bg-surface-ivory border border-border-line ${item.color}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-[13px] font-bold uppercase tracking-tight text-on-surface group-hover:text-primary transition-colors leading-tight">
                                            {item.title}
                                        </h3>
                                        <p className="text-[12px] text-body-slate mt-1 line-clamp-1 leading-snug">
                                            {item.desc}
                                        </p>
                                    </div>
                                </button>
                            )
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                3. DIRECT CHANNELS & SUPPORT TICKET FORM
            ══════════════════════════════════════════════════════ */}
            <section className="w-full bg-surface border-b border-border-line">
                <div className="max-w-site mx-auto site-pad section-y">
                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                        {/* Left Column (5 Cols): Direct Support Channels & Address */}
                        <div className="lg:col-span-5 space-y-4">
                            {/* Section Header */}
                            <div className="border-b border-border-line pb-5 mb-2">
                                <span className="label-caps text-primary block mb-2">Direct Assistance</span>
                                <h2 className="display-section text-on-surface">Speak to Us</h2>
                                <p className="text-[15px] leading-[1.55] text-body-slate mt-3">
                                    Choose your preferred channel for fast, considered answers.
                                </p>
                            </div>

                            {/* WhatsApp Card */}
                            <div className="bg-surface-ivory border border-border-line p-5 sm:p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 bg-surface border border-border-line text-primary flex items-center justify-center flex-shrink-0">
                                        <RiWhatsappLine className="text-2xl" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-[14px] font-bold uppercase tracking-tight text-on-surface">WhatsApp Instant Chat</h3>
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 border border-accent-ochre/50 bg-accent-ochre/15 text-on-surface text-[10px] font-semibold uppercase tracking-[0.08em]">
                                                <span className="w-1.5 h-1.5 bg-accent-ochre" />
                                                Online
                                            </span>
                                        </div>
                                        <p className="text-[13px] leading-[1.55] text-body-slate mt-1">Quick order questions &amp; live agent assistance</p>
                                        <div className="mt-4">
                                            <a
                                                href={`https://wa.me/${whatsappNumber}?text=Hi%20SVastra%20Support,%20I%20need%20help%20with%20my%20order.`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="label-caps text-on-surface hover:text-primary transition-colors inline-flex items-center gap-2"
                                            >
                                                <span>Open WhatsApp Chat</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Phone Support Card */}
                            <div className="bg-surface border border-border-line p-5 sm:p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 bg-surface-ivory border border-border-line text-primary flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[14px] font-bold uppercase tracking-tight text-on-surface">Direct Support Hotline</h3>
                                        <p className="text-[13px] text-body-slate mt-1">Mon – Sat · 9:00 AM – 6:00 PM IST</p>
                                        <div className="mt-3">
                                            <a
                                                href="tel:+919729310456"
                                                className="text-[15px] font-semibold text-primary hover:text-on-surface transition-colors"
                                            >
                                                +91 9729310456
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Email Support Card */}
                            <div className="bg-surface border border-border-line p-5 sm:p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 bg-surface-ivory border border-border-line text-accent-blue flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[14px] font-bold uppercase tracking-tight text-on-surface">Email Client Care</h3>
                                        <p className="text-[13px] text-body-slate mt-1">Guaranteed reply within 24 business hours</p>
                                        <div className="mt-3 space-y-1.5">
                                            <div>
                                                <a
                                                    href="mailto:support@SVastra.co.in"
                                                    className="text-[13px] font-medium text-on-surface hover:text-primary transition-colors"
                                                >
                                                    support@SVastra.co.in
                                                </a>
                                            </div>
                                            <div>
                                                <a
                                                    href="mailto:care@SVastra.co.in"
                                                    className="text-[13px] font-medium text-on-surface hover:text-primary transition-colors"
                                                >
                                                    care@SVastra.co.in
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Head Office Card */}
                            <div className="bg-surface border border-border-line p-5 sm:p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 bg-surface-ivory border border-border-line text-accent-ochre flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[14px] font-bold uppercase tracking-tight text-on-surface">Registered Office</h3>
                                        <p className="text-[13px] text-body-slate mt-1.5 leading-[1.55]">
                                            SVastra Enterprises Private Limited<br />
                                            Corporate Office, India
                                        </p>
                                        <p className="label-caps text-body-slate mt-2">GST Registered &amp; Verified</p>
                                    </div>
                                </div>
                            </div>

                            {/* Buyer Promise */}
                            <div className="bg-surface-dark text-surface p-6 space-y-4">
                                <div className="flex items-center gap-2 label-caps text-accent-ochre">
                                    <Sparkles className="w-4 h-4" />
                                    <span>The SVastra Buyer Promise</span>
                                </div>
                                <div className="space-y-3 text-[13px] leading-[1.55] text-surface/80">
                                    <div className="flex items-start gap-3">
                                        <Check className="w-4 h-4 text-accent-ochre flex-shrink-0 mt-0.5" />
                                        <span>100% handloom fiber, inspected before dispatch</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Check className="w-4 h-4 text-accent-ochre flex-shrink-0 mt-0.5" />
                                        <span>Automated tracking &amp; SMS dispatch notifications</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Check className="w-4 h-4 text-accent-ochre flex-shrink-0 mt-0.5" />
                                        <span>Zero-hassle 7-day replacement &amp; return policy</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Right Column (7 Cols): Smart Contact Message Form */}
                        <div ref={formRef} className="lg:col-span-7">
                            <div className="bg-pure-white border border-border-line p-6 sm:p-8">

                                {/* Form Header */}
                                <div className="border-b border-border-line pb-5 mb-7">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="label-caps text-primary">Online Support Ticket</span>
                                        <span className="label-caps text-body-slate">* Required</span>
                                    </div>
                                    <h2 className="display-section text-on-surface mt-3">Send Us a Message</h2>
                                    <p className="text-[15px] leading-[1.55] text-body-slate mt-2">
                                        Fill in your inquiry details and a specialist will be assigned to your case.
                                    </p>
                                </div>

                                {/* Success Banner */}
                                {success && (
                                    <div className="mb-7 p-4 bg-surface-ivory border-l-2 border-l-accent-ochre border-y border-r border-border-line flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-accent-ochre flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="label-caps text-on-surface">Inquiry Submitted</h4>
                                            <p className="text-[13px] leading-[1.55] text-body-slate mt-1">
                                                Our client care representative will review your message and reach out via email or phone shortly.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                    {/* 1. Inquiry Topic Selector */}
                                    <div>
                                        <label className="label-caps text-body-slate block mb-3">
                                            Select Query Category *
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {TOPICS.map((topic) => {
                                                const isSelected = selectedTopic === topic.id;
                                                const IconComp = topic.icon;
                                                return (
                                                    <button
                                                        key={topic.id}
                                                        type="button"
                                                        onClick={() => handleTopicSelect(topic.id)}
                                                        className={`flex items-center gap-2 p-3 border text-left text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors cursor-pointer ${
                                                            isSelected
                                                                ? 'border-primary bg-surface-ivory text-primary'
                                                                : 'border-border-line bg-surface text-body-slate hover:border-on-surface hover:text-on-surface'
                                                        }`}
                                                    >
                                                        <IconComp className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-body-slate'}`} />
                                                        <span className="truncate">{topic.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {errors.topic && (
                                            <p className="mt-2 text-[12px] text-primary font-medium">{errors.topic.message}</p>
                                        )}
                                    </div>

                                    {/* 2. Name & Order ID Grid */}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {/* Name Input */}
                                        <div>
                                            <label htmlFor="name" className="label-caps text-body-slate block mb-2">
                                                Your Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                {...register('name')}
                                                placeholder="e.g. Rhea Verma"
                                                className={`${inputBase} ${errors.name ? inputError : inputIdle}`}
                                            />
                                            {errors.name && (
                                                <p className="mt-2 text-[12px] text-primary font-medium">{errors.name.message}</p>
                                            )}
                                        </div>

                                        {/* Order ID Input (Optional) */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label htmlFor="order_id" className="label-caps text-body-slate">
                                                    Order Number (Optional)
                                                </label>
                                                <span className="text-[10px] uppercase tracking-[0.08em] text-body-slate/70">e.g. ORD-10294</span>
                                            </div>
                                            <input
                                                type="text"
                                                id="order_id"
                                                {...register('order_id')}
                                                placeholder="ORD-XXXXXX or OD123456"
                                                className={`${inputBase} ${inputIdle}`}
                                            />
                                        </div>
                                    </div>

                                    {/* 3. Email & Phone Number Grid */}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {/* Email */}
                                        <div>
                                            <label htmlFor="email" className="label-caps text-body-slate block mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                {...register('email')}
                                                placeholder="name@example.com"
                                                className={`${inputBase} ${errors.email ? inputError : inputIdle}`}
                                            />
                                            {errors.email && (
                                                <p className="mt-2 text-[12px] text-primary font-medium">{errors.email.message}</p>
                                            )}
                                        </div>

                                        {/* Phone Number */}
                                        <div>
                                            <label htmlFor="phone_number" className="label-caps text-body-slate block mb-2">
                                                Phone / WhatsApp Number *
                                            </label>
                                            <input
                                                type="tel"
                                                id="phone_number"
                                                {...register('phone_number')}
                                                placeholder="+91 98765 43210"
                                                className={`${inputBase} ${errors.phone_number ? inputError : inputIdle}`}
                                            />
                                            {errors.phone_number && (
                                                <p className="mt-2 text-[12px] text-primary font-medium">{errors.phone_number.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* 4. Message Description */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label htmlFor="message" className="label-caps text-body-slate">
                                                Describe your issue or query *
                                            </label>
                                            <span className="text-[10px] uppercase tracking-[0.08em] text-body-slate/70">
                                                {currentMessage.length}/1000
                                            </span>
                                        </div>
                                        <textarea
                                            id="message"
                                            {...register('message')}
                                            rows={5}
                                            placeholder="Please provide details about your query (e.g. tracking issue, item condition, question regarding fabric or fit)..."
                                            className={`${inputBase} resize-none ${errors.message ? inputError : inputIdle}`}
                                        />
                                        {errors.message && (
                                            <p className="mt-2 text-[12px] text-primary font-medium">{errors.message.message}</p>
                                        )}
                                    </div>

                                    {/* 5. Action Buttons & Consent Note */}
                                    <div className="pt-5 border-t border-border-line flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <p className="text-[12px] leading-[1.55] text-body-slate">
                                            By submitting, you agree to receive support updates via Email, SMS, or WhatsApp.
                                        </p>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="sv-btn-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Submitting Ticket...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    <span>Submit Support Ticket</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                4. FREQUENTLY ASKED QUESTIONS
            ══════════════════════════════════════════════════════ */}
            <section className="w-full bg-surface-subtle border-b border-border-line">
                <div className="max-w-site mx-auto site-pad section-y">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="label-caps text-primary block mb-2">Quick Solutions</span>
                        <h2 className="display-section text-on-surface">Frequently Asked</h2>
                        <p className="text-[15px] leading-[1.55] text-body-slate mt-3">
                            Answers to common queries on ordering, dispatch, refunds, and garment care.
                        </p>
                    </div>

                    {/* Search in FAQs */}
                    <div className="max-w-xl mx-auto mb-6">
                        <div className="relative flex items-center border border-border-line bg-pure-white focus-within:border-on-surface transition-colors">
                            <Search className="w-4 h-4 text-body-slate absolute left-4 pointer-events-none" />
                            <input
                                type="text"
                                value={faqSearch}
                                onChange={(e) => setFaqSearch(e.target.value)}
                                placeholder="Search help topics (e.g. return, tracking, refund)..."
                                className="w-full pl-11 pr-4 py-3 bg-transparent text-[14px] text-on-surface placeholder:text-body-slate/60 outline-none border-0"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
                        {faqCategories.map((category) => (
                            <button
                                key={category}
                                type="button"
                                onClick={() => setSelectedFaqCategory(category)}
                                className={`px-4 py-2.5 border text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors cursor-pointer ${
                                    selectedFaqCategory === category
                                        ? 'bg-surface-dark text-surface border-surface-dark'
                                        : 'bg-surface text-body-slate border-border-line hover:border-on-surface hover:text-on-surface'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* FAQ Accordion List */}
                    <div className="max-w-3xl mx-auto">
                        {filteredFaqs.length > 0 ? (
                            <div className="border-t border-border-line">
                                {filteredFaqs.map((faq, index) => {
                                    const isOpen = openFaqIndex === index;
                                    return (
                                        <div key={index} className="border-b border-border-line bg-surface">
                                            <button
                                                type="button"
                                                onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                                                className="w-full px-5 py-5 flex items-center justify-between gap-5 text-left hover:bg-surface-ivory/60 transition-colors cursor-pointer"
                                            >
                                                <span className="text-[14px] sm:text-[15px] font-semibold text-on-surface flex items-center gap-4">
                                                    <span className="label-caps text-primary flex-shrink-0">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </span>
                                                    {faq.question}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-body-slate transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                                            </button>

                                            {isOpen && (
                                                <div className="px-5 pb-5 pl-[4.25rem] text-[15px] leading-[1.55] text-body-slate">
                                                    <p>{faq.answer}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10 px-6 bg-surface border border-border-line text-[14px] text-body-slate">
                                No matching answers for &quot;{faqSearch}&quot;. Send us a message above or chat on WhatsApp.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                5. MOBILE STICKY CONTACT ACTION BAR
            ══════════════════════════════════════════════════════ */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-on-surface/15 px-4 py-3 flex items-center gap-3">
                <a
                    href={`https://wa.me/${whatsappNumber}?text=Hi%20SVastra%20Support,%20I%20need%20help%20with%20my%20order.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-3 bg-surface-dark text-surface text-[11px] font-semibold uppercase tracking-[0.08em]"
                >
                    <RiWhatsappLine className="text-lg" />
                    <span>WhatsApp</span>
                </a>
                <a
                    href="tel:+919729310456"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-3 bg-primary text-surface text-[11px] font-semibold uppercase tracking-[0.08em]"
                >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                </a>
            </div>
        </div>
    );
}
