"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function SvastraConcierge() {
  const [msgVisible, setMsgVisible] = useState(false);

  const handleDispatch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
    if (!email) return;
    setMsgVisible(true);
    form.reset();
  };

  return (
    <section id="concierge" className="w-full bg-surface-subtle border-b border-border-line scroll-mt-24" aria-labelledby="concierge-title">
      <div className="max-w-site mx-auto site-pad section-y">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-stretch">
          <div className="lg:col-span-6 bg-surface p-6 sm:p-8 lg:p-12 border border-border-line space-y-5 flex flex-col">
            <div className="flex items-center gap-2 text-primary">
              <span className="label-caps">Bespoke Services</span>
            </div>
            <h3 id="concierge-title" className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
              The Private Atelier Concierge
            </h3>
            <p className="text-[15px] leading-[1.6] text-body-slate flex-grow">
              Need bespoke drape engineering for a key global keynote or a private fitting in New Delhi, Mumbai, or London? Our private sartorial concierge offers direct dialogue with our pattern-makers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <Link href="/contact-us" className="bg-surface-dark hover:bg-primary text-surface px-6 py-3.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-center transition-colors min-h-[48px] flex items-center justify-center">
                Book Private Salon
              </Link>
              <Link href="/contact-us" className="sv-btn-outline">
                Drape Consultation
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5 flex flex-col justify-center">
            <span className="label-caps text-primary block">The Dispatch // Archival Access</span>
            <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">Join the Conversation</h3>
            <p className="text-[15px] leading-[1.6] text-body-slate">
              A quiet monthly dispatch of cultural essays, invitations to private listening salons, and 48-hour early access to limited handloom edition drops. Strictly substance.
            </p>
            <form className="space-y-4 pt-1" onSubmit={handleDispatch} noValidate>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="sr-only" htmlFor="dispatch-email">
                  Email address
                </label>
                <input
                  id="dispatch-email"
                  name="email"
                  autoComplete="email"
                  className="flex-1 bg-surface border border-on-surface px-4 py-3.5 text-[11px] font-semibold tracking-wider text-on-surface placeholder:text-body-slate/60 focus:outline-none uppercase min-h-[48px]"
                  placeholder="Your preferred email address"
                  required
                  type="email"
                />
                <button className="sv-btn-primary" type="submit">
                  Join Dispatch
                </button>
              </div>
              {msgVisible && (
                <p className="text-[12px] text-primary font-semibold" role="status" aria-live="polite">
                  Thank you. You have been added to the private SVastra editorial ledger.
                </p>
              )}
              <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wider uppercase text-body-slate">
                <span className="text-primary" aria-hidden="true">
                  ✓
                </span>
                <span>Confidential Archive &amp; Worldwide Client Protection</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
