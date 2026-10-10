"use client";

import Link from "next/link";
import { RiExternalLinkLine } from "react-icons/ri";

/** Brand campaign artwork for the Live Archive panel */
const HERO_ARCHIVE = "/svastra/hero-she-knows.png";

type Props = {
  /** Optional override; defaults to the SVastra campaign banner */
  heroImage?: string | null;
};

export default function SvastraHero({ heroImage }: Props) {
  const img = heroImage || HERO_ARCHIVE;

  return (
    <section className="w-full bg-surface border-b border-border-line" aria-labelledby="hero-title">
      <div className="max-w-site mx-auto site-pad pt-8 sm:pt-10 pb-12 sm:pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-6 order-2 lg:order-1 min-w-0">
            <div className="inline-block bg-surface-ivory px-3 py-1.5 mb-5 sm:mb-6 border border-border-line label-caps text-primary">
              Brand Philosophy · Wear Yourself
            </div>
            <h1 id="hero-title" className="display-hero text-on-surface">
              <span className="sv-hero-line sv-hero-line-1">
                <span>One Woman.</span>
              </span>
              <span className="sv-hero-line sv-hero-line-2">
                <span className="text-primary">Many Roles.</span>
              </span>
              <span className="sv-hero-line sv-hero-line-3">
                <span>Many Moods.</span>
              </span>
              <span className="sv-hero-line sv-hero-line-4">
                <span>One SVastra.</span>
              </span>
            </h1>
            <p className="text-[15px] sm:text-base lg:text-[19px] leading-[1.58] text-body-slate mt-5 sm:mt-7 max-w-xl">
              Beautiful sarees for work, celebrations, and everyday life. Comfortable, timeless, and
              made for the woman you are — because every drape should feel like you.
            </p>
          </div>

          <div className="lg:col-span-6 relative order-1 lg:order-2 min-w-0 w-full">
            <div className="media-frame hero-media border border-on-surface/20 bg-surface-dark mt-0 lg:mt-[30px] relative overflow-hidden w-full">
              <img
                alt="She knows who she is — SVastra Live Archive"
                className="w-full h-full object-cover object-center"
                width={1200}
                height={675}
                decoding="async"
                fetchPriority="high"
                src={img}
              />
              <div className="absolute bottom-0 inset-x-0 bg-surface-dark/90 text-surface p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-surface/15">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-surface/60 block">
                    Live Archive
                  </span>
                  <p className="text-[12px] sm:text-[13px] font-semibold tracking-tight text-surface uppercase truncate">
                    Curated from the current collection
                  </p>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-surface/60 block">
                    Source
                  </span>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-accent-ochre hover:text-surface transition-colors"
                  >
                    Catalog
                    <RiExternalLinkLine className="text-[14px] shrink-0" aria-hidden="true" />
                    <span className="sr-only"> (opens catalog)</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
