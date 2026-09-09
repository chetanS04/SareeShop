"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchSettingByKey } from "../../../utils/settingsApi";

const LOGO_MARK = "/svastra/logo-mark.png";

const Footer = () => {
  const [whatsappNumber, setWhatsappNumber] = useState<string>("919729310456");

  useEffect(() => {
    fetchSettingByKey("whatsapp_number")
      .then((setting) => {
        if (setting?.value) setWhatsappNumber(setting.value);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="w-full bg-surface-subtle border-t border-border-line pb-24 md:pb-0">
      <div className="max-w-site mx-auto site-pad pt-12 sm:pt-16 lg:pt-20 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-10 lg:gap-12 mb-12 sm:mb-16">
          <div className="col-span-2 md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img src={LOGO_MARK} alt="" className="h-8 w-8 object-contain" width={32} height={32} />
              <span className="text-xl font-bold uppercase tracking-tight text-on-surface">SVASTRA</span>
            </div>
            <p className="text-[14px] leading-relaxed text-body-slate max-w-sm">
              Wear Yourself. Rooted in architectural modernism and archival Indian artistry, crafting fluid luxury silhouettes for sovereign identities.
            </p>
            <div className="pt-1">
              <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-primary block mb-2">
                Headquarters
              </span>
              <span className="text-[12px] text-body-slate block">
                Atelier Mumbai · Design Studio New Delhi
              </span>
            </div>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[11px] font-semibold tracking-[0.08em] uppercase text-primary hover:text-on-surface transition-colors pt-2"
            >
              WhatsApp Concierge →
            </a>
          </div>

          <div className="md:col-span-2 md:col-start-7 space-y-4">
            <h4 className="label-caps text-on-surface">Collections</h4>
            <ul className="space-y-2.5 text-[13px] text-body-slate list-none p-0 m-0">
              <li>
                <Link className="hover:text-primary transition-colors" href="/new-arrivals">
                  New In Edits
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/#shop-who">
                  Shop Who You Are
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/#shop-feel">
                  Shop How You Feel
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/products">
                  The Independent Cut
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="label-caps text-on-surface">Editorial</h4>
            <ul className="space-y-2.5 text-[13px] text-body-slate list-none p-0 m-0">
              <li>
                <Link className="hover:text-primary transition-colors" href="/about-us">
                  The SVastra Manifesto
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/about-us">
                  Women of SVastra
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/categories">
                  Categories
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/brands">
                  Brands
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1 md:col-span-2 space-y-4">
            <h4 className="label-caps text-on-surface">Services</h4>
            <ul className="space-y-2.5 text-[13px] text-body-slate list-none p-0 m-0">
              <li>
                <Link className="hover:text-primary transition-colors" href="/contact-us">
                  Private Concierge
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/orders">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/profile">
                  My Account
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/wishlist">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-line pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[10px] font-semibold tracking-[0.08em] uppercase text-body-slate">
          <p className="m-0">
            © {new Date().getFullYear()} SVastra Luxury Atelier. All Rights Reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link className="hover:text-on-surface transition-colors" href="/terms-conditions">
              Terms of Service
            </Link>
            <Link className="hover:text-on-surface transition-colors" href="/privacy-policy">
              Privacy Policy
            </Link>
            <Link className="hover:text-on-surface transition-colors" href="/contact-us">
              Authenticity Guarantee
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
