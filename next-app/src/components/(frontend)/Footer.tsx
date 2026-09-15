"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchSettingByKey } from "../../../utils/settingsApi";

const LOGO_MARK = "/svastra/logo-mark.png";

const Footer = () => {
  const [whatsappNumber, setWhatsappNumber] = useState<string>("917507599315");

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
              Handwoven sarees and drapes — tussar, chanderi and linen weaves in clean, modern
              colours. Natural fabrics, honest pricing.
            </p>
            <div className="pt-1 space-y-1.5">
              <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-primary block">
                Customer Support
              </span>
              <a
                href="mailto:svastrastore@gmail.com"
                className="text-[13px] text-body-slate hover:text-primary transition-colors block"
              >
                svastrastore@gmail.com
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-body-slate hover:text-primary transition-colors block"
              >
                +91 75075 99315
              </a>
              <span className="text-[12px] text-body-slate block">Every day · 9:00 AM – 9:00 PM IST</span>
              <span className="text-[12px] text-body-slate block">Nagpur, Maharashtra, India</span>
            </div>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[11px] font-semibold tracking-[0.08em] uppercase text-primary hover:text-on-surface transition-colors pt-2"
            >
              Chat on WhatsApp →
            </a>
          </div>

          <div className="md:col-span-2 md:col-start-7 space-y-4">
            <h4 className="label-caps text-on-surface">Shop</h4>
            <ul className="space-y-2.5 text-[13px] text-body-slate list-none p-0 m-0">
              <li>
                <Link className="hover:text-primary transition-colors" href="/#shop-who">
                  Shop Who You Are
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/shop/the-leader">
                  The Leader
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/shop/the-mentor">
                  The Mentor
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/shop/the-creator">
                  The Creator
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/shop/the-home-manager">
                  The Home Manager
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/products">
                  The Edit
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="label-caps text-on-surface">Help</h4>
            <ul className="space-y-2.5 text-[13px] text-body-slate list-none p-0 m-0">
              <li>
                <Link className="hover:text-primary transition-colors" href="/contact-us">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/track-shipment">
                  Track Order
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/refund-policy">
                  Returns &amp; Refunds
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/shipping-policy">
                  Shipping &amp; Delivery
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1 md:col-span-2 space-y-4">
            <h4 className="label-caps text-on-surface">Account</h4>
            <ul className="space-y-2.5 text-[13px] text-body-slate list-none p-0 m-0">
              <li>
                <Link className="hover:text-primary transition-colors" href="/about-us">
                  About Us
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/orders">
                  My Orders
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
            © {new Date().getFullYear()} SVASTRA. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link className="hover:text-on-surface transition-colors" href="/terms-conditions">
              Terms &amp; Conditions
            </Link>
            <Link className="hover:text-on-surface transition-colors" href="/privacy-policy">
              Privacy Policy
            </Link>
            <Link className="hover:text-on-surface transition-colors" href="/refund-policy">
              Refund Policy
            </Link>
            <Link className="hover:text-on-surface transition-colors" href="/shipping-policy">
              Shipping Policy
            </Link>
            <Link className="hover:text-on-surface transition-colors" href="/authenticity-guarantee">
              Authenticity Guarantee
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
