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
    <section
      id="concierge"
      className="w-full bg-surface-subtle border-b border-border-line scroll-mt-24"
      aria-labelledby="concierge-title"
    >
      <div className="max-w-site mx-auto site-pad section-y">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-stretch">
          <div className="lg:col-span-6 bg-surface p-6 sm:p-8 lg:p-12 border border-border-line space-y-5 flex flex-col">
            <span className="label-caps text-primary">Help &amp; Support</span>
            <h3 id="concierge-title" className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
              Need help choosing?
            </h3>
            <p className="text-[15px] leading-[1.6] text-body-slate flex-grow">
              Not sure which weave suits the occasion, or need help with sizing, blouse fabric or a gift?
              Message us and someone from the team will get back to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <Link
                href="/contact-us"
                className="bg-surface-dark hover:bg-primary text-surface px-6 py-3.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-center transition-colors min-h-[48px] flex items-center justify-center"
              >
                Contact Us
              </Link>
              <Link href="/track-shipment" className="sv-btn-outline">
                Track Order
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5 flex flex-col justify-center">
            <span className="label-caps text-primary block">Newsletter</span>
            <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
              New arrivals &amp; offers
            </h3>
            <p className="text-[15px] leading-[1.6] text-body-slate">
              Add your email to hear when new sarees drop and when there&apos;s a sale. No spam — a few
              emails a month at most.
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
                  className="flex-1 bg-surface border border-on-surface px-4 py-3.5 text-[13px] text-on-surface placeholder:text-body-slate/60 focus:outline-none focus:border-primary min-h-[48px]"
                  placeholder="you@example.com"
                  required
                  type="email"
                />
                <button className="sv-btn-primary" type="submit">
                  Subscribe
                </button>
              </div>
              {msgVisible && (
                <p className="text-[13px] text-primary font-semibold" role="status" aria-live="polite">
                  Thanks — you&apos;re subscribed.
                </p>
              )}
              <p className="text-[12px] text-body-slate">
                By subscribing you agree to our{" "}
                <Link href="/privacy-policy" className="underline hover:text-primary">
                  privacy policy
                </Link>
                .
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
