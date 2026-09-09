"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Home,
  Flame,
  Sparkles,
  Truck,
  HelpCircle,
} from "lucide-react";

const LOGO_MARK = "/svastra/logo-mark.png";

export default function NotFoundView() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const popularShortcuts = [
    { label: "New Arrivals", href: "/new-arrivals", icon: Sparkles },
    { label: "Best Sellers", href: "/products", icon: Flame },
    { label: "Track Shipment", href: "/track-shipment", icon: Truck },
    { label: "Customer Help", href: "/contact-us", icon: HelpCircle },
  ];

  return (
    <div className="sv-theme min-h-screen flex flex-col justify-between bg-surface text-on-surface">
      <header className="w-full border-b border-border-line bg-surface site-pad py-5 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5 hover:opacity-80 transition" aria-label="SVastra Home">
          <img src={LOGO_MARK} alt="" className="h-8 w-8 object-contain shrink-0" width={32} height={32} />
          <span className="text-[22px] sm:text-[26px] font-semibold tracking-tight uppercase text-on-surface leading-none">
            SVASTRA
          </span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-7">
          <Link href="/" className="nav-link hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/products" className="nav-link hover:text-primary transition-colors">
            Shop
          </Link>
          <Link href="/new-arrivals" className="nav-link hidden sm:inline hover:text-primary transition-colors">
            New Arrivals
          </Link>
          <Link href="/contact-us" className="nav-link hover:text-primary transition-colors">
            Help
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center py-16 sm:py-20 site-pad">
        <div className="max-w-2xl w-full text-center space-y-10">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-surface-ivory border border-border-line flex items-center justify-center text-primary">
                <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.5]" />
              </div>
              <span className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-surface-dark text-surface text-[11px] font-semibold tracking-[0.08em] uppercase">
                404
              </span>
            </div>

            <span className="label-caps text-primary block mb-3">Off the Loom</span>
            <h1 className="display-hero text-on-surface">Page Not Found</h1>
            <p className="text-[15px] sm:text-base text-body-slate max-w-lg mx-auto mt-4 leading-[1.6]">
              We couldn&apos;t find what you&apos;re looking for. The piece or page may have been moved, retired
              from the archive, or is no longer available.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="max-w-lg mx-auto text-left">
            <label htmlFor="notfound-search" className="label-caps text-body-slate block mb-2">
              Search the Archive
            </label>
            <div className="flex items-stretch border border-border-line bg-pure-white focus-within:border-on-surface transition-colors">
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-body-slate absolute left-4 pointer-events-none" />
                <input
                  id="notfound-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, edits, collections..."
                  className="w-full pl-11 pr-4 py-3.5 bg-transparent text-[14px] text-on-surface placeholder:text-body-slate/60 outline-none border-0"
                />
              </div>
              <button
                type="submit"
                className="px-6 bg-surface-dark hover:bg-primary text-surface text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/products" className="sv-btn-primary w-full sm:w-auto">
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
            <Link href="/" className="sv-btn-outline w-full sm:w-auto gap-3">
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="pt-8 border-t border-border-line">
            <p className="label-caps text-body-slate mb-4">Popular Destinations</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {popularShortcuts.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={i}
                    href={item.href}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-ivory hover:bg-surface-dark border border-border-line text-[11px] font-semibold tracking-[0.08em] uppercase text-body-slate hover:text-surface transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-5 site-pad text-center border-t border-border-line label-caps text-body-slate">
        <p>© {new Date().getFullYear()} SVastra · Wear Yourself</p>
      </footer>
    </div>
  );
}
