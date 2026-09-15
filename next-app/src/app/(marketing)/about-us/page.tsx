"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TensionMatrixGraphic } from "@/components/(frontend)/svastra/SvastraManifesto";
import {
  fetchActiveSliderImage,
  fetchProductsList,
  loadShopWhoYouAreFacets,
  productImageUrl,
  type ShopFacetCard,
} from "@/utils/archetypeCatalog";

const FALLBACK = "/svastra/logo-mark.png";

const COMMITMENTS = [
  {
    title: "100% Handloom",
    copy: "Pure fiber architecture. No synthetic polyester. Weaver hours over shortcuts.",
  },
  {
    title: "Zero Filigree",
    copy: "We reject nostalgic costume. Ornament never replaces structure.",
  },
  {
    title: "Concierge Care",
    copy: "Complimentary atelier guidance — fit, occasion, and edit curation.",
  },
  {
    title: "Global Dispatch",
    copy: "Curated edits ship with archival packing and tracked delivery.",
  },
];

export default function AboutUsPage() {
  const [heroImg, setHeroImg] = useState(FALLBACK);
  const [facets, setFacets] = useState<ShopFacetCard[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [slider, products, cards] = await Promise.all([
        fetchActiveSliderImage(),
        fetchProductsList({ per_page: 8, page: 1 }),
        loadShopWhoYouAreFacets(4),
      ]);
      if (cancelled) return;
      setHeroImg(slider || productImageUrl(products[0]) || FALLBACK);
      setFacets(cards);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <section className="w-full bg-surface border-b border-border-line">
        <div className="max-w-site mx-auto site-pad section-y">
          <nav className="label-caps text-body-slate mb-8 flex flex-wrap items-center gap-2">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="text-on-surface/30" aria-hidden="true">
              /
            </span>
            <span className="text-on-surface">About</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-block bg-surface-ivory px-3 py-1.5 border border-border-line label-caps text-primary">
                The Atelier · Wear Yourself
              </div>
              <h1 className="display-hero text-on-surface">
                One Woman.
                <br />
                <span className="text-primary">Many Roles.</span>
                <br />
                Many Moods.
              </h1>
              <p className="text-[15px] sm:text-lg leading-relaxed text-body-slate max-w-xl">
                SVastra crafts architectural Indian handlooms for sovereign identities — rooted in
                modernism and archival artistry, never in costume or cliché.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link href="/products" className="sv-btn-primary">
                  Discover Your Edit
                </Link>
                <Link href="/contact-us" className="sv-btn-outline">
                  Concierge
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="media-frame hero-media border border-on-surface/20 bg-surface-dark">
                <img
                  src={heroImg}
                  alt="SVastra atelier portrait"
                  className="object-cover w-full h-full"
                  loading="eager"
                  width={960}
                  height={720}
                />
                <div className="absolute bottom-0 inset-x-0 bg-surface-dark/90 text-surface p-3.5 sm:p-5 border-t border-surface/15">
                  <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-surface/60 block">
                    Foundational Ethos
                  </span>
                  <p className="text-[12px] sm:text-[13px] font-semibold tracking-tight text-surface uppercase truncate">
                    Wear Yourself // Never a Costume
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-surface-subtle border-b border-border-line">
        <div className="max-w-site mx-auto site-pad py-10 sm:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {[
              { value: "4", label: "Identity Facets" },
              { value: "0%", label: "Synthetic Polyester" },
              { value: "100%", label: "Handloom Focus" },
              { value: "∞", label: "Roles · One Wardrobe" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center lg:text-left lg:border-l lg:first:border-l-0 border-border-line lg:pl-6 first:pl-0"
              >
                <span className="text-3xl sm:text-4xl font-bold text-primary tracking-tight block">
                  {stat.value}
                </span>
                <span className="label-caps text-body-slate mt-2 block">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="manifesto"
        className="w-full bg-surface-dark text-surface border-b border-border-line scroll-mt-24"
      >
        <div className="max-w-site mx-auto site-pad section-y">
          <div className="border-b border-border-line-dark pb-5 sm:pb-6 mb-8 sm:mb-12">
            <span className="label-caps text-accent-ochre block tracking-[0.18em]">
              The SVastra Tension Matrix // Foundational Principles
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center mb-12 sm:mb-16">
            <div className="lg:col-span-6">
              <TensionMatrixGraphic />
            </div>
            <div className="lg:col-span-6 space-y-5 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight">
                Uncompromising Duality
              </h2>
              <p className="text-[15px] sm:text-lg leading-[1.6] text-surface/80">
                SVastra operates in the creative tension between ancestral heritage and modern
                sovereign identity. We reject nostalgic ornamentalism in favor of pure fiber
                architecture.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 pt-2 text-[13px]">
                <div className="border-l-2 border-primary pl-4">
                  <span className="font-bold text-surface uppercase block text-[14px]">Indian</span>
                  <span className="text-surface/60">But never stereotypical or ornamental costume.</span>
                </div>
                <div className="border-l-2 border-accent-magenta pl-4">
                  <span className="font-bold text-surface uppercase block text-[14px]">Feminine</span>
                  <span className="text-surface/60">Softness engineered with undeniable backbone.</span>
                </div>
                <div className="border-l-2 border-accent-ochre pl-4">
                  <span className="font-bold text-surface uppercase block text-[14px]">Bold</span>
                  <span className="text-surface/60">Quiet command through material weight.</span>
                </div>
                <div className="border-l-2 border-accent-blue pl-4">
                  <span className="font-bold text-surface uppercase block text-[14px]">Modern</span>
                  <span className="text-surface/60">Without relinquishing historical roots.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 sm:pt-12 border-t border-border-line-dark">
            <span className="label-caps text-primary block mb-4">The Atelier Manifesto</span>
            <h2 className="text-xl sm:text-3xl lg:text-5xl font-bold uppercase tracking-tight text-surface leading-[1.12] max-w-4xl">
              We do not design costumes for occasions.
              <br className="hidden sm:block" />
              We craft modern armour for real life.
            </h2>
          </div>
        </div>
      </section>

      <section className="w-full bg-surface border-b border-border-line">
        <div className="max-w-site mx-auto site-pad section-y">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <span className="label-caps text-primary block mb-3">Our Story</span>
              <h2 className="display-section text-on-surface">Built for Real Life</h2>
            </div>
            <div className="lg:col-span-8 space-y-5 text-[15px] sm:text-base leading-relaxed text-body-slate">
              <p>
                SVastra is a small, independent saree label. We started it because we wanted handloom
                sarees that felt modern and easy to wear — without heavy ornament or inflated pricing.
              </p>
              <p>
                We work directly with weavers on handloom cotton, tussar, chanderi and linen, and keep
                the design clean: restrained borders, considered colour, honest finishing.
              </p>
              <p>
                Everything is checked before it&apos;s packed, priced on the fabric rather than the
                label, and backed by a straightforward returns policy. If something isn&apos;t right,
                write to us at{" "}
                <a
                  href="mailto:svastrastore@gmail.com"
                  className="text-primary hover:text-on-surface transition-colors"
                >
                  svastrastore@gmail.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-surface-subtle border-b border-border-line">
        <div className="max-w-site mx-auto site-pad section-y">
          <div className="border-b border-on-surface/15 pb-6 sm:pb-8 mb-8 sm:mb-12">
            <span className="label-caps text-primary block mb-2">Shop Who You Are</span>
            <h2 className="display-section text-on-surface">Live Categories</h2>
            <p className="text-[15px] text-body-slate mt-2 max-w-2xl">
              Names and images from the atelier catalog — not placeholder facets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {facets.map((facet, index) => (
              <article
                key={facet.id}
                className="bg-surface border border-border-line overflow-hidden flex flex-col hover:border-on-surface transition-colors"
              >
                <div className="aspect-[16/10] bg-surface-ivory overflow-hidden border-b border-border-line">
                  <img
                    src={facet.imageUrl || FALLBACK}
                    alt={facet.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 sm:p-7 flex flex-col justify-between gap-6 flex-1">
                  <div>
                    <span className="inline-block bg-surface-dark text-surface px-2 py-1 text-[10px] font-semibold tracking-widest uppercase mb-4">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="label-caps text-primary block mb-2">Category</span>
                    <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-on-surface">
                      {facet.name}
                    </h3>
                    {facet.description ? (
                      <p className="text-[14px] text-body-slate mt-3 leading-relaxed line-clamp-3">
                        {facet.description}
                      </p>
                    ) : null}
                    <p className="text-[11px] tracking-wider uppercase text-body-slate mt-3">
                      {facet.productCount} pieces in edit
                    </p>
                  </div>
                  <Link
                    href={facet.href}
                    className="label-caps text-on-surface hover:text-primary transition-colors inline-flex items-center gap-2"
                  >
                    Shop Category →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-surface border-b border-border-line">
        <div className="max-w-site mx-auto site-pad section-y">
          <div className="mb-8 sm:mb-10">
            <span className="label-caps text-primary block mb-2">Commitments</span>
            <h2 className="display-section text-on-surface">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMMITMENTS.map((c) => (
              <div key={c.title} className="border border-border-line bg-surface-subtle p-5 sm:p-6">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-on-surface mb-3">
                  {c.title}
                </h3>
                <p className="text-[13px] text-body-slate leading-relaxed">{c.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-surface-dark text-surface">
        <div className="max-w-site mx-auto site-pad py-16 lg:py-24 text-center">
          <span className="label-caps text-surface/50 block mb-4">SVastra Ethos</span>
          <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-[-0.03em] mb-6">
            Wear Yourself.
          </h2>
          <Link href="/#shop-who" className="sv-btn-outline !border-surface/30 !text-surface hover:!bg-surface hover:!text-on-surface inline-flex">
            Shop Who You Are
          </Link>
        </div>
      </section>
    </div>
  );
}
