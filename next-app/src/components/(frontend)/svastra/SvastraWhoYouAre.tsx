"use client";

import Link from "next/link";
import { ARCHETYPES } from "@/data/archetypes";

export default function SvastraWhoYouAre() {
  return (
    <section
      id="shop-who"
      className="w-full bg-surface-subtle border-b border-border-line scroll-mt-24"
      aria-labelledby="who-title"
    >
      <div className="max-w-site mx-auto site-pad section-y">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-on-surface/15 pb-6 sm:pb-8 mb-8 sm:mb-12 gap-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3 label-caps text-primary">
              <span>Chapter 01</span>
              <span className="text-on-surface/30" aria-hidden="true">
                /
              </span>
              <span className="text-body-slate">Interior Archetypes</span>
            </div>
            <h2 id="who-title" className="display-section text-on-surface">
              Shop Who You Are
            </h2>
            <p className="text-[15px] sm:text-[17px] leading-[1.6] text-body-slate mt-3">
              Facets of the same sovereign woman, not fixed customer personas. You navigate the board,
              cultivate sanctuary, manifest visions, and impart quiet wisdom.
            </p>
          </div>
          <Link
            href="/shop/the-leader"
            className="label-caps text-on-surface hover:text-primary transition-colors flex items-center gap-2 self-start md:self-end shrink-0"
          >
            <span>Explore All Archetypes</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
          {ARCHETYPES.map((facet) => (
            <article
              key={facet.slug}
              className="bg-surface border border-border-line flex flex-col justify-between group hover:border-on-surface transition-colors max-w-md sm:max-w-none mx-auto sm:mx-0 w-full"
            >
              <div>
                <div className="media-frame facet-media">
                  <Link
                    href={`/shop/${facet.slug}`}
                    className="absolute inset-0 z-[1]"
                    aria-label={facet.name}
                  />
                  <img
                    alt={facet.name}
                    className="group-hover:scale-105 transition-transform duration-700 object-cover object-top w-full h-full"
                    loading="lazy"
                    decoding="async"
                    width={600}
                    height={800}
                    src={facet.heroImg}
                  />
                  <div className="absolute top-3 left-3 z-[2] bg-surface-dark text-surface px-2 py-1 text-[10px] font-semibold tracking-widest uppercase">
                    {facet.roleNo}
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-primary block mb-2">
                    {facet.tag}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold uppercase tracking-[-0.015em]">
                    <Link href={`/shop/${facet.slug}`} className="hover:text-primary transition-colors">
                      {facet.name}
                    </Link>
                  </h3>
                  <p className="text-[14px] leading-[1.6] text-body-slate mt-3 line-clamp-3">{facet.blurb}</p>
                </div>
              </div>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-border-line/60">
                <Link
                  href={`/shop/${facet.slug}`}
                  className="pt-4 flex items-center justify-between text-[11px] font-semibold tracking-[0.1em] uppercase group-hover:text-primary transition-colors"
                >
                  <span>Enter Facet</span>
                  <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">
                    →
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
