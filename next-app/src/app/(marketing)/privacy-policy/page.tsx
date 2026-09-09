'use client';

import React from 'react';
import Link from 'next/link';
import {
    Lock,
    UserCheck,
    Database,
    AlertCircle,
    CheckCircle2,
    ShieldCheck,
    Clock,
    Headphones,
    KeyRound,
    Check
} from 'lucide-react';

export default function PrivacyPolicyPage() {
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
                        <span className="text-body-slate">Security &amp; Compliance</span>
                        <span className="text-on-surface/30" aria-hidden="true">/</span>
                        <span className="text-on-surface">Privacy Policy</span>
                    </nav>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                        <div className="space-y-5 max-w-3xl">
                            <div className="inline-flex items-center gap-2 bg-surface-ivory px-3 py-1.5 border border-border-line label-caps text-primary">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>256-Bit SSL Encrypted &amp; Data Protected</span>
                            </div>
                            <h1 className="display-hero text-on-surface">
                                Privacy &amp;
                                <br />
                                <span className="text-primary">Data Protection</span>
                            </h1>
                            <p className="text-[15px] sm:text-base leading-[1.6] text-body-slate max-w-2xl">
                                We value the trust you place in us. This document outlines how your personal information is collected, processed, and safeguarded when shopping on SVastra.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <Link href="/contact-us" className="sv-btn-outline">
                                <Headphones className="w-3.5 h-3.5 mr-2" />
                                <span>Privacy Officer</span>
                            </Link>
                        </div>
                    </div>

                    {/* Meta Bar */}
                    <div className="mt-10 pt-6 border-t border-border-line grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-4">
                        <div className="flex items-center gap-2 label-caps text-body-slate sm:border-l sm:first:border-l-0 border-border-line sm:pl-5 first:pl-0">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>Effective February 2026</span>
                        </div>
                        <div className="flex items-center gap-2 label-caps text-body-slate sm:border-l border-border-line sm:pl-5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent-ochre" />
                            <span>PCI-DSS &amp; SSL Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 label-caps text-body-slate sm:border-l border-border-line sm:pl-5">
                            <Lock className="w-3.5 h-3.5 text-accent-magenta" />
                            <span>Zero Third-Party Data Selling</span>
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

                        {/* Section 1: Overview */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">01</span>
                                <h2 className="display-section text-on-surface">Commitment to User Privacy</h2>
                            </div>
                            <p className="text-[15px] sm:text-base leading-[1.55] text-body-slate">
                                SVastra respects your privacy and is committed to protecting the personally identifiable information you share with us. We adhere to the highest consumer data protection standards in India and ensure that all customer interactions remain confidential and secure.
                            </p>
                        </article>

                        {/* Section 2: Information We Collect */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">02</span>
                                <h2 className="display-section text-on-surface">Information We Collect</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-surface border border-border-line p-5 sm:p-6 space-y-3">
                                    <div className="flex items-center gap-2 label-caps text-on-surface">
                                        <UserCheck className="w-4 h-4 text-primary" />
                                        <span>Personal &amp; Delivery Details</span>
                                    </div>
                                    <ul className="space-y-2 text-[14px] leading-[1.55] text-body-slate">
                                        <li className="flex items-start gap-2.5">
                                            <span className="text-primary" aria-hidden="true">—</span>
                                            <span>Full name, email address, and active mobile number</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <span className="text-primary" aria-hidden="true">—</span>
                                            <span>Shipping &amp; billing address with pincode</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <span className="text-primary" aria-hidden="true">—</span>
                                            <span>Order history, reviews, and support ticket records</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-surface border border-border-line p-5 sm:p-6 space-y-3">
                                    <div className="flex items-center gap-2 label-caps text-on-surface">
                                        <Database className="w-4 h-4 text-primary" />
                                        <span>Automated Technical Data</span>
                                    </div>
                                    <ul className="space-y-2 text-[14px] leading-[1.55] text-body-slate">
                                        <li className="flex items-start gap-2.5">
                                            <span className="text-primary" aria-hidden="true">—</span>
                                            <span>Device type, browser version, and IP address</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <span className="text-primary" aria-hidden="true">—</span>
                                            <span>Session cookies for login authentication and cart persistence</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <span className="text-primary" aria-hidden="true">—</span>
                                            <span>Anonymized usage analytics to optimize site performance</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </article>

                        {/* Section 3: How We Use Your Data */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">03</span>
                                <h2 className="display-section text-on-surface">How We Use Collected Information</h2>
                            </div>
                            <div className="bg-surface-ivory border border-border-line p-5 sm:p-7 divide-y divide-border-line text-[15px] leading-[1.55] text-body-slate">
                                <div className="flex items-start gap-3 pb-3.5">
                                    <Check className="w-4 h-4 text-accent-ochre flex-shrink-0 mt-1" />
                                    <span><strong className="text-on-surface font-semibold">Order Fulfillment:</strong> Processing transactions, printing shipping waybills, and delivering packages to your doorstep.</span>
                                </div>
                                <div className="flex items-start gap-3 py-3.5">
                                    <Check className="w-4 h-4 text-accent-ochre flex-shrink-0 mt-1" />
                                    <span><strong className="text-on-surface font-semibold">Delivery Notifications:</strong> Dispatching real-time SMS and WhatsApp updates regarding shipment tracking and estimated delivery dates.</span>
                                </div>
                                <div className="flex items-start gap-3 py-3.5">
                                    <Check className="w-4 h-4 text-accent-ochre flex-shrink-0 mt-1" />
                                    <span><strong className="text-on-surface font-semibold">Customer Support:</strong> Assisting you with returns, replacements, refunds, or general product inquiries.</span>
                                </div>
                                <div className="flex items-start gap-3 pt-3.5">
                                    <Check className="w-4 h-4 text-accent-ochre flex-shrink-0 mt-1" />
                                    <span><strong className="text-on-surface font-semibold">Fraud Prevention:</strong> Detecting fraudulent transactions and securing payment gateway interactions.</span>
                                </div>
                            </div>
                        </article>

                        {/* Section 4: Data Security Protocols */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">04</span>
                                <h2 className="display-section text-on-surface">Data Protection &amp; Payment Security</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-[15px] leading-[1.55] text-body-slate">
                                <div className="bg-surface border-l-2 border-l-primary border-y border-r border-border-line p-5 sm:p-6 space-y-2.5">
                                    <div className="flex items-center gap-2 label-caps text-on-surface">
                                        <Lock className="w-4 h-4 text-primary" />
                                        <span>256-Bit SSL Encryption</span>
                                    </div>
                                    <p>
                                        All data exchanged between your browser and our servers is secured via industry-standard SSL encryption. We never store raw debit/credit card CVVs.
                                    </p>
                                </div>

                                <div className="bg-surface border-l-2 border-l-accent-ochre border-y border-r border-border-line p-5 sm:p-6 space-y-2.5">
                                    <div className="flex items-center gap-2 label-caps text-on-surface">
                                        <KeyRound className="w-4 h-4 text-accent-ochre" />
                                        <span>Zero Data Selling Promise</span>
                                    </div>
                                    <p>
                                        We strictly do not sell, lease, or rent customer personal information to third-party advertisers. Your data is used exclusively for service fulfillment.
                                    </p>
                                </div>
                            </div>
                        </article>

                        {/* Section 5: Customer Rights */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">05</span>
                                <h2 className="display-section text-on-surface">Your Privacy Rights &amp; Choices</h2>
                            </div>
                            <p className="text-[15px] sm:text-base leading-[1.55] text-body-slate mb-5">
                                As a valued SVastra customer, you have full control over your personal data:
                            </p>
                            <div className="grid sm:grid-cols-2 gap-px bg-border-line border border-border-line">
                                <div className="p-4 bg-surface flex items-center gap-2.5 text-[14px] text-on-surface">
                                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span>Right to review &amp; update address book</span>
                                </div>
                                <div className="p-4 bg-surface flex items-center gap-2.5 text-[14px] text-on-surface">
                                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span>Right to request complete account deletion</span>
                                </div>
                                <div className="p-4 bg-surface flex items-center gap-2.5 text-[14px] text-on-surface">
                                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span>Right to opt out of promotional emails</span>
                                </div>
                                <div className="p-4 bg-surface flex items-center gap-2.5 text-[14px] text-on-surface">
                                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span>Right to manage non-essential browser cookies</span>
                                </div>
                            </div>
                        </article>

                        {/* Contact & Support Notice */}
                        <div className="bg-surface-dark text-surface p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5">
                            <div className="w-10 h-10 bg-primary text-surface flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="space-y-2">
                                <span className="label-caps text-accent-ochre block">Privacy &amp; Compliance Desk</span>
                                <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-surface">
                                    Contact the Compliance Team
                                </h3>
                                <p className="text-[14px] leading-[1.55] text-surface/70">
                                    If you have questions regarding our data collection policies or wish to exercise your data rights:
                                </p>
                                <div className="pt-2 flex flex-wrap gap-x-8 gap-y-2 label-caps text-surface/80">
                                    <span>Email: <a href="mailto:privacy@SVastra.co.in" className="text-accent-ochre hover:text-surface transition-colors">privacy@SVastra.co.in</a></span>
                                    <span>Desk: <a href="tel:+919729310456" className="text-accent-ochre hover:text-surface transition-colors">+91 9729310456</a></span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

        </div>
    );
}
