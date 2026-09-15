'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, Clock, MapPin, Package, CheckCircle2, AlertCircle, IndianRupee } from 'lucide-react';

export default function ShippingPolicyPage() {
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
                        <span className="text-on-surface">Shipping &amp; Delivery</span>
                    </nav>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                        <div className="space-y-5 max-w-3xl">
                            <div className="inline-flex items-center gap-2 bg-surface-ivory px-3 py-1.5 border border-border-line label-caps text-primary">
                                <Truck className="w-3.5 h-3.5" />
                                <span>Dispatch · Delivery · Tracking</span>
                            </div>
                            <h1 className="display-hero text-on-surface">
                                Shipping &amp;
                                <br />
                                <span className="text-primary">Delivery Policy</span>
                            </h1>
                            <p className="text-[15px] sm:text-base leading-[1.6] text-body-slate max-w-2xl">
                                Where we ship, how long it takes, what it costs, and how to track your order.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <Link href="/track-shipment" className="sv-btn-outline">Track a Shipment</Link>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-border-line grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-4">
                        <div className="flex items-center gap-2 label-caps text-body-slate sm:border-l sm:first:border-l-0 border-border-line sm:pl-5 first:pl-0">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>Last updated: September 2026</span>
                        </div>
                        <div className="flex items-center gap-2 label-caps text-body-slate sm:border-l border-border-line sm:pl-5">
                            <MapPin className="w-3.5 h-3.5 text-accent-ochre" />
                            <span>Delivered Across India</span>
                        </div>
                        <div className="flex items-center gap-2 label-caps text-body-slate sm:border-l border-border-line sm:pl-5">
                            <Package className="w-3.5 h-3.5 text-accent-magenta" />
                            <span>Tracking on Every Order</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* BODY */}
            <section className="w-full bg-surface-subtle border-b border-border-line">
                <div className="max-w-site mx-auto site-pad section-y">
                    <div className="max-w-4xl space-y-14 sm:space-y-16">

                        {/* 01 Processing & dispatch */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">01</span>
                                <h2 className="display-section text-on-surface">Order Processing &amp; Dispatch</h2>
                            </div>
                            <div className="bg-surface border border-border-line p-5 sm:p-7 divide-y divide-border-line text-[15px] leading-[1.55] text-body-slate">
                                <div className="flex items-start gap-3 pb-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>Orders are processed on business days (Monday to Saturday, excluding public holidays).</span>
                                </div>
                                <div className="flex items-start gap-3 py-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>Most orders are dispatched within <strong className="text-on-surface font-semibold">1–3 business days</strong> of payment confirmation. During sales or festive periods this may take slightly longer.</span>
                                </div>
                                <div className="flex items-start gap-3 pt-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>Once dispatched, you receive a tracking link by email and SMS/WhatsApp. You can also track from the <Link href="/orders" className="text-primary underline hover:text-on-surface">My Orders</Link> page.</span>
                                </div>
                            </div>
                        </article>

                        {/* 02 Delivery timelines */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">02</span>
                                <h2 className="display-section text-on-surface">Delivery Timelines</h2>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4 text-[15px] leading-[1.55] text-body-slate">
                                <div className="bg-surface border-l-2 border-l-primary border-y border-r border-border-line p-5 sm:p-6 space-y-2.5">
                                    <div className="flex items-center gap-2 label-caps text-on-surface">
                                        <Truck className="w-4 h-4 text-primary" />
                                        <span>Metro &amp; Tier-1 cities</span>
                                    </div>
                                    <p>Typically <strong className="text-on-surface font-semibold">3–6 business days</strong> from dispatch.</p>
                                </div>
                                <div className="bg-surface border-l-2 border-l-accent-ochre border-y border-r border-border-line p-5 sm:p-6 space-y-2.5">
                                    <div className="flex items-center gap-2 label-caps text-on-surface">
                                        <MapPin className="w-4 h-4 text-accent-ochre" />
                                        <span>Other locations</span>
                                    </div>
                                    <p>Typically <strong className="text-on-surface font-semibold">5–8 business days</strong> from dispatch, and longer for remote pincodes.</p>
                                </div>
                            </div>
                            <p className="text-[14px] leading-[1.55] text-body-slate mt-4">
                                These are estimates, not guarantees. Delivery can be affected by courier delays, weather, strikes or events outside our control.
                            </p>
                        </article>

                        {/* 03 Charges */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">03</span>
                                <h2 className="display-section text-on-surface">Shipping Charges</h2>
                            </div>
                            <div className="bg-surface-ivory border border-border-line p-5 sm:p-7 divide-y divide-border-line text-[15px] leading-[1.55] text-body-slate">
                                <div className="flex items-start gap-3 pb-3.5">
                                    <IndianRupee className="w-4 h-4 text-accent-ochre flex-shrink-0 mt-1" />
                                    <span>Shipping charges, if applicable, are shown at checkout before payment. Many orders ship free above a threshold shown on site.</span>
                                </div>
                                <div className="flex items-start gap-3 py-3.5">
                                    <IndianRupee className="w-4 h-4 text-accent-ochre flex-shrink-0 mt-1" />
                                    <span>Cash on Delivery, where available, may carry a small handling fee, also shown at checkout.</span>
                                </div>
                                <div className="flex items-start gap-3 pt-3.5">
                                    <CheckCircle2 className="w-4 h-4 text-accent-ochre flex-shrink-0 mt-1" />
                                    <span>All charges are in Indian Rupees (INR) and inclusive of applicable taxes.</span>
                                </div>
                            </div>
                        </article>

                        {/* 04 Serviceability & address */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">04</span>
                                <h2 className="display-section text-on-surface">Serviceable Areas &amp; Address</h2>
                            </div>
                            <div className="bg-surface border border-border-line p-5 sm:p-7 divide-y divide-border-line text-[15px] leading-[1.55] text-body-slate">
                                <div className="flex items-start gap-3 pb-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>We currently ship within India only. A few pincodes may not be serviceable by our courier partners; if so, we will contact you with options.</span>
                                </div>
                                <div className="flex items-start gap-3 py-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>Please enter a complete address with a correct pincode and a reachable phone number. We are not responsible for delays or non-delivery caused by an incorrect or incomplete address.</span>
                                </div>
                                <div className="flex items-start gap-3 pt-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>Address changes are only possible before dispatch. Contact us as soon as possible if you need to change it.</span>
                                </div>
                            </div>
                        </article>

                        {/* 05 Failed delivery */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">05</span>
                                <h2 className="display-section text-on-surface">Failed or Delayed Delivery</h2>
                            </div>
                            <p className="text-[15px] sm:text-base leading-[1.55] text-body-slate">
                                Couriers usually attempt delivery 2–3 times. If they cannot reach you or the recipient refuses the parcel, it is returned to us. For prepaid orders we will re-ship (re-shipping charges may apply) or refund as per our{" "}
                                <Link href="/refund-policy" className="text-primary underline hover:text-on-surface">Refund &amp; Cancellation Policy</Link>. If your tracking has not updated for several days, please contact us.
                            </p>
                        </article>

                        {/* Contact */}
                        <div className="bg-surface-dark text-surface p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5">
                            <div className="w-10 h-10 bg-primary text-surface flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="space-y-2">
                                <span className="label-caps text-accent-ochre block">Shipping Support</span>
                                <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-surface">
                                    Question About a Delivery?
                                </h3>
                                <p className="text-[14px] leading-[1.55] text-surface/70">
                                    Email us with your order ID and we will check with the courier and get back to you within 24–48 business hours.
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
