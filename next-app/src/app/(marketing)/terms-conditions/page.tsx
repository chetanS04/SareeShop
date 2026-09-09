'use client';

import React from 'react';
import Link from 'next/link';
import {
    ShoppingCart,
    RotateCcw,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Lock,
    Scale,
    Headphones,
    Clock,
    Globe
} from 'lucide-react';

export default function TermsConditionsPage() {
    return (
        <div className="min-h-screen bg-surface text-on-surface">

            {/* ══════════════════════════════════════════════════════
                1. MASTHEAD — Editorial legal document header
            ══════════════════════════════════════════════════════ */}
            <section className="w-full bg-surface border-b border-border-line">
                <div className="max-w-site mx-auto site-pad section-y">
                    {/* Breadcrumbs */}
                    <nav className="label-caps text-body-slate mb-8 flex flex-wrap items-center gap-2">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="text-on-surface/30" aria-hidden="true">/</span>
                        <span className="text-body-slate">Legal &amp; Policy</span>
                        <span className="text-on-surface/30" aria-hidden="true">/</span>
                        <span className="text-on-surface">Terms &amp; Conditions</span>
                    </nav>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                        <div className="space-y-5 max-w-3xl">
                            <div className="inline-flex items-center gap-2 bg-surface-ivory px-3 py-1.5 border border-border-line label-caps text-primary">
                                <Scale className="w-3.5 h-3.5" />
                                <span>Platform Agreement &amp; Guidelines</span>
                            </div>
                            <h1 className="display-hero text-on-surface">
                                Terms &amp;
                                <br />
                                <span className="text-primary">Conditions</span>
                            </h1>
                            <p className="text-[15px] sm:text-base leading-[1.6] text-body-slate max-w-2xl">
                                Please review these terms carefully before browsing or placing orders on SVastra. By using our platform, you agree to these legal conditions.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <Link href="/contact-us" className="sv-btn-outline">
                                <Headphones className="w-3.5 h-3.5 mr-2" />
                                <span>Contact Concierge</span>
                            </Link>
                        </div>
                    </div>

                    {/* Meta Bar */}
                    <div className="mt-10 pt-6 border-t border-border-line grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-4">
                        <div className="flex items-center gap-2 label-caps text-body-slate sm:border-l sm:first:border-l-0 border-border-line sm:pl-5 first:pl-0">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>Last Updated February 2026</span>
                        </div>
                        <div className="flex items-center gap-2 label-caps text-body-slate sm:border-l border-border-line sm:pl-5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent-ochre" />
                            <span>Governed by the Laws of India</span>
                        </div>
                        <div className="flex items-center gap-2 label-caps text-body-slate sm:border-l border-border-line sm:pl-5">
                            <Globe className="w-3.5 h-3.5 text-accent-magenta" />
                            <span>Applies to Web &amp; Mobile</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                2. DOCUMENT BODY — Long-form editorial clauses
            ══════════════════════════════════════════════════════ */}
            <section className="w-full bg-surface-subtle border-b border-border-line">
                <div className="max-w-site mx-auto site-pad section-y">
                    <div className="max-w-4xl space-y-14 sm:space-y-16">

                        {/* Section 1: Introduction */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">01</span>
                                <h2 className="display-section text-on-surface">Introduction &amp; Acceptance</h2>
                            </div>
                            <p className="text-[15px] sm:text-base leading-[1.55] text-body-slate">
                                Welcome to SVastra (&quot;SVastra&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). These Terms and Conditions govern your access to and use of the website, mobile services, and purchasing systems. By accessing, browsing, or placing an order on our platform, you acknowledge that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy.
                            </p>
                        </article>

                        {/* Section 2: Account Terms & Eligibility */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">02</span>
                                <h2 className="display-section text-on-surface">Account Registration &amp; Security</h2>
                            </div>
                            <div className="bg-surface-ivory border border-border-line p-5 sm:p-7 divide-y divide-border-line text-[15px] leading-[1.55] text-body-slate">
                                <div className="flex items-start gap-3 pb-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>You must be at least 18 years of age or possess legal parental/guardian consent to make purchases.</span>
                                </div>
                                <div className="flex items-start gap-3 py-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>You are solely responsible for maintaining the confidentiality of your login credentials and password.</span>
                                </div>
                                <div className="flex items-start gap-3 py-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>You agree to provide true, accurate, and current contact and address details during checkout.</span>
                                </div>
                                <div className="flex items-start gap-3 pt-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>SVastra reserves the right to suspend or terminate accounts that engage in fraudulent behavior or policy violations.</span>
                                </div>
                            </div>
                        </article>

                        {/* Section 3: Orders & Pricing */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">03</span>
                                <h2 className="display-section text-on-surface">Orders, Pricing &amp; Payments</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-[15px] leading-[1.55] text-body-slate">
                                <div className="bg-surface border border-border-line p-5 sm:p-6 space-y-2.5">
                                    <div className="flex items-center gap-2 label-caps text-on-surface">
                                        <ShoppingCart className="w-4 h-4 text-primary" />
                                        <span>Order Placement &amp; Verification</span>
                                    </div>
                                    <p>
                                        All orders are subject to stock availability and validation checks. Order confirmation emails or SMS do not signify final acceptance; SVastra reserves the right to cancel any order due to pricing errors or inventory discrepancies.
                                    </p>
                                </div>

                                <div className="bg-surface border border-border-line p-5 sm:p-6 space-y-2.5">
                                    <div className="flex items-center gap-2 label-caps text-on-surface">
                                        <Lock className="w-4 h-4 text-primary" />
                                        <span>Currency &amp; Secure Payments</span>
                                    </div>
                                    <p>
                                        All transactions are processed in Indian National Rupees (INR). We accept major Credit/Debit cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD). Payment gateways are 256-bit encrypted and PCI-DSS compliant.
                                    </p>
                                </div>
                            </div>
                        </article>

                        {/* Section 4: Shipping & Logistics */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">04</span>
                                <h2 className="display-section text-on-surface">Shipping, Delivery &amp; Risk of Loss</h2>
                            </div>
                            <div className="bg-surface border border-border-line p-5 sm:p-7 divide-y divide-border-line text-[15px] leading-[1.55] text-body-slate">
                                <div className="flex items-start gap-3 pb-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>Estimated delivery times (typically 3–6 business days) are approximate and may vary due to logistics or location factors.</span>
                                </div>
                                <div className="flex items-start gap-3 py-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>Shipment tracking information will be provided via SMS and WhatsApp once the package is dispatched with our courier partners (Delhivery, etc.).</span>
                                </div>
                                <div className="flex items-start gap-3 pt-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>Risk of loss transfers to the customer once physical delivery has been completed and verified at the provided shipping address.</span>
                                </div>
                            </div>
                        </article>

                        {/* Section 5: Returns & Replacements */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">05</span>
                                <h2 className="display-section text-on-surface">7-Day Return &amp; Replacement</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-[15px] leading-[1.55] text-body-slate">
                                <div className="bg-surface border-l-2 border-l-accent-ochre border-y border-r border-border-line p-5 sm:p-6 space-y-2.5">
                                    <div className="flex items-center gap-2 label-caps text-on-surface">
                                        <RotateCcw className="w-4 h-4 text-accent-ochre" />
                                        <span>Return Eligibility</span>
                                    </div>
                                    <p>
                                        Eligible items may be returned or replaced within 7 days of delivery. Items must be unused, unwashed, with all original tags, boxes, and accessories intact.
                                    </p>
                                </div>

                                <div className="bg-surface border-l-2 border-l-primary border-y border-r border-border-line p-5 sm:p-6 space-y-2.5">
                                    <div className="flex items-center gap-2 label-caps text-on-surface">
                                        <ShieldCheck className="w-4 h-4 text-primary" />
                                        <span>Refund Disbursement</span>
                                    </div>
                                    <p>
                                        Upon return verification at our fulfillment warehouse, refunds are initiated within 24 hours to the original payment mode or verified UPI account for COD orders.
                                    </p>
                                </div>
                            </div>
                        </article>

                        {/* Section 6: Intellectual Property & Governing Law */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">06</span>
                                <h2 className="display-section text-on-surface">Intellectual Property &amp; Law</h2>
                            </div>
                            <p className="text-[15px] sm:text-base leading-[1.55] text-body-slate">
                                All materials, trademarks, brand logos, product descriptions, website designs, and source code are the exclusive intellectual property of SVastra. These terms are governed by the laws of India. Any legal dispute shall be subject to the exclusive jurisdiction of the competent courts in India.
                            </p>
                        </article>

                        {/* Contact & Support Notice */}
                        <div className="bg-surface-dark text-surface p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5">
                            <div className="w-10 h-10 bg-primary text-surface flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="space-y-2">
                                <span className="label-caps text-accent-ochre block">Legal &amp; Customer Desk</span>
                                <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-surface">
                                    Questions or Clarifications?
                                </h3>
                                <p className="text-[14px] leading-[1.55] text-surface/70">
                                    For inquiries concerning these Terms &amp; Conditions or order compliance, contact our legal and customer team:
                                </p>
                                <div className="pt-2 flex flex-wrap gap-x-8 gap-y-2 label-caps text-surface/80">
                                    <span>Email: <a href="mailto:legal@SVastra.co.in" className="text-accent-ochre hover:text-surface transition-colors">legal@SVastra.co.in</a></span>
                                    <span>Phone: <a href="tel:+919729310456" className="text-accent-ochre hover:text-surface transition-colors">+91 9729310456</a></span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

        </div>
    );
}
