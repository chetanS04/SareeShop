'use client';

import React from 'react';
import Link from 'next/link';
import { BadgeCheck, Leaf, Ruler, ShieldCheck, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AuthenticityGuaranteePage() {
    return (
        <div className="min-h-screen bg-surface text-on-surface">
            {/* MASTHEAD */}
            <section className="w-full bg-surface border-b border-border-line">
                <div className="max-w-site mx-auto site-pad section-y">
                    <nav className="label-caps text-body-slate mb-8 flex flex-wrap items-center gap-2">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="text-on-surface/30" aria-hidden="true">/</span>
                        <span className="text-body-slate">Our Commitment</span>
                        <span className="text-on-surface/30" aria-hidden="true">/</span>
                        <span className="text-on-surface">Authenticity Guarantee</span>
                    </nav>

                    <div className="space-y-5 max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-surface-ivory px-3 py-1.5 border border-border-line label-caps text-primary">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            <span>Genuine Handloom · Checked Before Dispatch</span>
                        </div>
                        <h1 className="display-hero text-on-surface">
                            Authenticity
                            <br />
                            <span className="text-primary">Guarantee</span>
                        </h1>
                        <p className="text-[15px] sm:text-base leading-[1.6] text-body-slate max-w-2xl">
                            Every saree sold on SVastra is a genuine handloom weave. Here is exactly what we promise, and what to do if a piece does not match its description.
                        </p>
                    </div>

                    <div className="mt-10 pt-6 border-t border-border-line grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-4">
                        <div className="flex items-center gap-2 label-caps text-body-slate sm:border-l sm:first:border-l-0 border-border-line sm:pl-5 first:pl-0">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>Last updated: September 2026</span>
                        </div>
                        <div className="flex items-center gap-2 label-caps text-body-slate sm:border-l border-border-line sm:pl-5">
                            <Leaf className="w-3.5 h-3.5 text-accent-ochre" />
                            <span>No Polyester Blends</span>
                        </div>
                        <div className="flex items-center gap-2 label-caps text-body-slate sm:border-l border-border-line sm:pl-5">
                            <ShieldCheck className="w-3.5 h-3.5 text-accent-magenta" />
                            <span>Backed by Our Return Policy</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* BODY */}
            <section className="w-full bg-surface-subtle border-b border-border-line">
                <div className="max-w-site mx-auto site-pad section-y">
                    <div className="max-w-4xl space-y-14 sm:space-y-16">

                        {/* 01 What we guarantee */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">01</span>
                                <h2 className="display-section text-on-surface">What We Guarantee</h2>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-4 text-[14px] leading-[1.55] text-body-slate">
                                <div className="bg-surface border border-border-line p-5 space-y-2.5">
                                    <Leaf className="w-5 h-5 text-primary" strokeWidth={1.5} />
                                    <h3 className="label-caps text-on-surface">Genuine fabric</h3>
                                    <p>Handloom cotton, tussar, chanderi, silk or linen as stated on the product page — never a synthetic substitute.</p>
                                </div>
                                <div className="bg-surface border border-border-line p-5 space-y-2.5">
                                    <Ruler className="w-5 h-5 text-primary" strokeWidth={1.5} />
                                    <h3 className="label-caps text-on-surface">Honest description</h3>
                                    <p>Weave, length, blouse-piece details and care instructions are described as accurately as we can.</p>
                                </div>
                                <div className="bg-surface border border-border-line p-5 space-y-2.5">
                                    <CheckCircle2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
                                    <h3 className="label-caps text-on-surface">Checked before dispatch</h3>
                                    <p>Each order is inspected for weaving faults, stains and damage before it is packed.</p>
                                </div>
                            </div>
                        </article>

                        {/* 02 The nature of handloom */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">02</span>
                                <h2 className="display-section text-on-surface">The Nature of Handloom</h2>
                            </div>
                            <p className="text-[15px] sm:text-base leading-[1.55] text-body-slate">
                                Handloom fabric is woven by hand, so small slubs, uneven texture and slight variation between pieces are normal and are a sign of genuine handwork — not defects. Colours may look slightly different on your screen versus in person. These variations are not grounds for a &quot;not as described&quot; claim.
                            </p>
                        </article>

                        {/* 03 If a piece is not right */}
                        <article>
                            <div className="flex items-baseline gap-4 border-b border-border-line pb-4 mb-5">
                                <span className="label-caps text-primary">03</span>
                                <h2 className="display-section text-on-surface">If a Piece Is Not as Described</h2>
                            </div>
                            <div className="bg-surface-ivory border border-border-line p-5 sm:p-7 divide-y divide-border-line text-[15px] leading-[1.55] text-body-slate">
                                <div className="flex items-start gap-3 pb-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>Contact us within <strong className="text-on-surface font-semibold">7 days of delivery</strong> with your order ID and photos of the issue.</span>
                                </div>
                                <div className="flex items-start gap-3 py-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>If the fabric, weave or condition genuinely does not match the listing, we arrange a free pickup and a full refund or a replacement — your choice.</span>
                                </div>
                                <div className="flex items-start gap-3 pt-3.5">
                                    <span className="text-primary mt-0.5" aria-hidden="true">—</span>
                                    <span>Full return and refund terms are in our <Link href="/refund-policy" className="text-primary underline hover:text-on-surface">Refund &amp; Cancellation Policy</Link>.</span>
                                </div>
                            </div>
                        </article>

                        {/* Contact */}
                        <div className="bg-surface-dark text-surface p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5">
                            <div className="w-10 h-10 bg-primary text-surface flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="space-y-2">
                                <span className="label-caps text-accent-ochre block">Authenticity Support</span>
                                <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-surface">
                                    Not Sure About a Piece?
                                </h3>
                                <p className="text-[14px] leading-[1.55] text-surface/70">
                                    Email us before or after your purchase and we will help.
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
