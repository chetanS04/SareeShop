'use client';

import React from 'react';
import Link from 'next/link';
import { RotateCcw, Clock, CreditCard, XCircle, CheckCircle2, AlertCircle, Ban } from 'lucide-react';

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen bg-surface text-on-surface">
            {/* MASTHEAD */}
            <section className="w-full bg-surface border-b border-border-line">
                <div className="max-w-site mx-auto site-pad section-y">
                    <nav className="label-caps text-body-slate mb-8 flex flex-wrap items-center gap-2">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="text-on-surface/30" aria-hidden="true">/</span>
                        <span className="text-body-slate">Legal &amp; Policy</span>
                        <span className="text-on-surface/30" aria-hidden="true">/</span>
                        <span className="text-on-surface">Refund &amp; Cancellation</span>
                    </nav>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                        <div className="space-y-5 max-w-3xl">
                            <div className="inline-flex items-center gap-2 bg-surface-ivory px-3 py-1.5 border border-border-line label-caps text-primary">
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Returns · Refunds · Cancellations</span>
                            </div>
                            <h1 className="display-hero text-on-surface">
                                Refund &amp;
                                <br />
                                <span className="text-primary">Cancellation Policy</span>
                            </h1>
                            <p className="text-[15px] sm:text-base leading-[1.6] text-body-slate max-w-2xl">
                                How to cancel an order, return an item, and when to expect your money back. This policy applies to all orders placed on SVastra.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <Link href="/orders" className="sv-btn-outline">Track / Manage Orders</Link>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-border-line grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-4">
                        <div className="flex items-center gap-2 label-caps text-body-slate sm:border-l sm:first:border-l-0 border-border-line sm:pl-5 first:pl-0">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>Last updated: September 2026</span>
                        </div>
                        <div className="flex items-center gap-2 label-caps text-body-slate sm:border-l border-border-line sm:pl-5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent-ochre" />
                            <span>7-Day Return Window</span>
                        </div>
                        <div className="flex items-center gap-2 label-caps text-body-slate sm:border-l border-border-line sm:pl-5">
                            <CreditCard className="w-3.5 h-3.5 text-accent-magenta" />
                            <span>Refunds in 5–7 Business Days</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* BODY */}
            <section className="w-full bg-surface-subtle border-b border-border-line">
                <div className="max-w-site mx-auto site-pad section-y">
                    <div className="max-w-4xl space-y-14 sm:space-y-16">

                        {/* 01 Order Cancellation */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">01</span>
                                <h2 className="display-section text-on-surface">Order Cancellation</h2>
                            </div>
                            <div className="bg-surface border border-border-line p-5 sm:p-7 divide-y divide-border-line text-[15px] leading-[1.55] text-body-slate">
                                <div className="flex items-start gap-3 pb-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>You can cancel an order free of charge any time <strong className="text-on-surface font-semibold">before it is dispatched</strong>. Request cancellation from the <Link href="/orders" className="text-primary underline hover:text-on-surface">My Orders</Link> page or by emailing us.</span>
                                </div>
                                <div className="flex items-start gap-3 py-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>Once an order has been dispatched it cannot be cancelled. You may instead refuse delivery or raise a return after delivery, subject to the conditions below.</span>
                                </div>
                                <div className="flex items-start gap-3 pt-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>For prepaid orders cancelled before dispatch, the full amount is refunded to the original payment method.</span>
                                </div>
                            </div>
                        </article>

                        {/* 02 Return Eligibility */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">02</span>
                                <h2 className="display-section text-on-surface">Return &amp; Exchange Eligibility</h2>
                            </div>
                            <p className="text-[15px] sm:text-base leading-[1.55] text-body-slate mb-5">
                                You may request a return or exchange within <strong className="text-on-surface font-semibold">7 days of delivery</strong>, unless a different window is shown on the product page. To be eligible, the item must be:
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4 text-[15px] leading-[1.55] text-body-slate">
                                <div className="bg-surface border border-border-line p-5 sm:p-6 space-y-2.5">
                                    <div className="flex items-center gap-2 label-caps text-on-surface">
                                        <CheckCircle2 className="w-4 h-4 text-accent-ochre" />
                                        <span>Accepted for return</span>
                                    </div>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2.5"><span className="text-primary" aria-hidden="true">—</span><span>Unused, unwashed and undamaged</span></li>
                                        <li className="flex items-start gap-2.5"><span className="text-primary" aria-hidden="true">—</span><span>With all original tags and packaging</span></li>
                                        <li className="flex items-start gap-2.5"><span className="text-primary" aria-hidden="true">—</span><span>Wrong item received, or item damaged / defective on arrival</span></li>
                                    </ul>
                                </div>
                                <div className="bg-surface border border-border-line p-5 sm:p-6 space-y-2.5">
                                    <div className="flex items-center gap-2 label-caps text-on-surface">
                                        <Ban className="w-4 h-4 text-primary" />
                                        <span>Not eligible for return</span>
                                    </div>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2.5"><span className="text-primary" aria-hidden="true">—</span><span>Items marked &quot;non-returnable&quot; or &quot;final sale&quot; on the product page</span></li>
                                        <li className="flex items-start gap-2.5"><span className="text-primary" aria-hidden="true">—</span><span>Blouses / fabric that has been stitched, altered or washed</span></li>
                                        <li className="flex items-start gap-2.5"><span className="text-primary" aria-hidden="true">—</span><span>Items returned without tags, or after the return window</span></li>
                                    </ul>
                                </div>
                            </div>
                            <p className="text-[14px] leading-[1.55] text-body-slate mt-4">
                                Minor variation in colour due to screen settings, and the natural irregularities of handloom weaves, are not considered defects.
                            </p>
                        </article>

                        {/* 03 How to return */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">03</span>
                                <h2 className="display-section text-on-surface">How to Raise a Return</h2>
                            </div>
                            <ol className="space-y-3 text-[15px] leading-[1.55] text-body-slate list-none p-0 m-0">
                                <li className="flex items-start gap-3"><span className="label-caps text-primary shrink-0 pt-0.5">1</span><span>Go to <Link href="/orders" className="text-primary underline hover:text-on-surface">My Orders</Link>, select the item and choose &quot;Return / Exchange&quot;, or email <a href="mailto:svastrastore@gmail.com" className="text-primary underline hover:text-on-surface">svastrastore@gmail.com</a> with your order ID and reason.</span></li>
                                <li className="flex items-start gap-3"><span className="label-caps text-primary shrink-0 pt-0.5">2</span><span>Our team reviews the request within 1–2 business days and arranges a pickup where the pincode is serviceable, or shares a self-ship address.</span></li>
                                <li className="flex items-start gap-3"><span className="label-caps text-primary shrink-0 pt-0.5">3</span><span>Once the item reaches us and passes a quick quality check, your refund or exchange is processed.</span></li>
                            </ol>
                        </article>

                        {/* 04 Refund timelines */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">04</span>
                                <h2 className="display-section text-on-surface">Refund Method &amp; Timeline</h2>
                            </div>
                            <div className="bg-surface-ivory border border-border-line p-5 sm:p-7 divide-y divide-border-line text-[15px] leading-[1.55] text-body-slate">
                                <div className="flex items-start gap-3 pb-3.5">
                                    <CreditCard className="w-4 h-4 text-accent-ochre flex-shrink-0 mt-1" />
                                    <span><strong className="text-on-surface font-semibold">Prepaid orders:</strong> refunded to the original payment method (UPI / card / netbanking). The amount is initiated within 2 business days of the return passing quality check and typically reflects in your account within <strong className="text-on-surface font-semibold">5–7 business days</strong>, depending on your bank.</span>
                                </div>
                                <div className="flex items-start gap-3 py-3.5">
                                    <CreditCard className="w-4 h-4 text-accent-ochre flex-shrink-0 mt-1" />
                                    <span><strong className="text-on-surface font-semibold">Cash on Delivery orders:</strong> refunded by UPI or bank transfer to the account details you provide, within the same 5–7 business day window.</span>
                                </div>
                                <div className="flex items-start gap-3 py-3.5">
                                    <CheckCircle2 className="w-4 h-4 text-accent-ochre flex-shrink-0 mt-1" />
                                    <span><strong className="text-on-surface font-semibold">Exchanges:</strong> the replacement is dispatched once the original item is received and checked. If the new item costs more, the difference is payable; if less, the difference is refunded.</span>
                                </div>
                                <div className="flex items-start gap-3 pt-3.5">
                                    <XCircle className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                                    <span><strong className="text-on-surface font-semibold">Shipping charges</strong> (if any) are non-refundable, except where the return is due to our error (wrong or damaged item), in which case the full amount including shipping is refunded.</span>
                                </div>
                            </div>
                        </article>

                        {/* 05 Failed / not received */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">05</span>
                                <h2 className="display-section text-on-surface">Failed Payments &amp; Non-Delivery</h2>
                            </div>
                            <p className="text-[15px] sm:text-base leading-[1.55] text-body-slate">
                                If money is debited but the order is not confirmed, it is normally auto-reversed by your bank or the payment provider within 5–7 business days. If it is not, contact us with your transaction reference and we will assist. If a shipment is lost in transit or marked undelivered and returned to us, we will re-ship or refund in full.
                            </p>
                        </article>

                        {/* Contact */}
                        <div className="bg-surface-dark text-surface p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5">
                            <div className="w-10 h-10 bg-primary text-surface flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="space-y-2">
                                <span className="label-caps text-accent-ochre block">Returns &amp; Refunds Support</span>
                                <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-surface">
                                    Need Help With a Return?
                                </h3>
                                <p className="text-[14px] leading-[1.55] text-surface/70">
                                    Email us with your order ID and we will respond within 24–48 business hours.
                                </p>
                                <div className="pt-2 flex flex-wrap gap-x-8 gap-y-2 label-caps text-surface/80">
                                    <span>Email: <a href="mailto:svastrastore@gmail.com" className="text-accent-ochre hover:text-surface transition-colors">svastrastore@gmail.com</a></span>
                                    <span>Phone / WhatsApp: <a href="tel:+917507599315" className="text-accent-ochre hover:text-surface transition-colors">+91 75075 99315</a></span>
                                    <span>Hours: 9:00 AM – 9:00 PM, all days</span>
                                    <span>Location: Nagpur, Maharashtra, India</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
