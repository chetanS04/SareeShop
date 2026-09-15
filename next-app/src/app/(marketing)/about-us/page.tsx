"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TensionMatrixGraphic } from "@/components/(frontend)/svastra/SvastraManifesto";
import { ARCHETYPES } from "@/data/archetypes";
import { fetchActiveSliderImage } from "@/utils/archetypeCatalog";

const FALLBACK = "/svastra/logo-mark.png";

const COMMITMENTS = [
  {
    title: "100% Handloom",
    copy: "Pure fiber architecture. No synthetic polyester. Generational weaver hours over shortcuts.",
  },
  {
    title: "Zero Filigree",
    copy: "We reject nostalgic costume. Structural integrity and fabric weight over decorative clutter.",
  },
  {
    title: "Concierge Care",
    copy: "Complimentary atelier guidance — drape engineering, sizing precision, and edit curation.",
  },
  {
    title: "Archival Dispatch",
    copy: "Curated edits ship in signature archival protection with worldwide tracked delivery.",
  },
];

const PROVENANCE_HIGHLIGHTS = [
  {
    title: "The Architect Saree",
    silhouette: "Noir & Haldi Raw Silk",
    gsm: "380 GSM",
    origin: "Bhagalpur, Bihar",
    discipline: "Monolithic drape weight engineered to settle into an uncompromising vertical line.",
  },
  {
    title: "The Razor Pallu Overlay",
    silhouette: "Structured Habotai Silk",
    gsm: "340 GSM",
    origin: "Bengal Handloom",
    discipline: "Engineered drape system that stays crisp without safety pins or costume constraints.",
  },
  {
    title: "The Grounded Drape",
    silhouette: "Wild Tussar & Chanderi",
    gsm: "320 GSM",
    origin: "Chanderi & Kutch",
    discipline: "Organic mineral pigments and natural raw slubs that deepen with age and poise.",
  },
  {
    title: "The Kinetic Pleat",
    silhouette: "Mulberry Silk Architecture",
    gsm: "360 GSM",
    origin: "Calcutta & Bagru",
    discipline: "Accordion micro-folds that compress in stillness and expand in fluid motion.",
  },
];

const AFFECTIVE_FREQUENCIES = [
  {
    tag: "POWER",
    tagline: "Command Without Costume",
    desc: "High-density 380 GSM raw silks and razor-sharp pallu overlays that anchor the room without raising their voice.",
    href: "/products?search=silk",
  },
  {
    tag: "MINIMAL",
    tagline: "Quiet Structural Clarity",
    desc: "Unbleached wild tussar and crisp linen-silk blends with zero distraction and disciplined mathematical geometry.",
    href: "/products?search=linen",
  },
  {
    tag: "CELEBRATION",
    tagline: "Presence For The Occasion",
    desc: "Deep mineral-dyed artisanal weaves engineered for sovereign gravitas rather than nostalgic bridal ornament.",
    href: "/products?search=georgette",
  },
];

export default function AboutUsPage() {
  const [heroImg, setHeroImg] = useState(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const slider = await fetchActiveSliderImage();
      if (!cancelled && slider) {
        setHeroImg(slider);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* 1. TOP BREADCRUMB & HERO */}
      <section className="w-full bg-surface border-b border-border-line">
        <div className="max-w-site mx-auto site-pad section-y">
          <nav className="label-caps text-body-slate mb-8 flex flex-wrap items-center gap-2">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="text-on-surface/30" aria-hidden="true">
              /
            </span>
            <span className="text-on-surface">The Atelier & Manifesto</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-block bg-surface-ivory px-3 py-1.5 border border-border-line label-caps text-primary">
                The Atelier · Wear Yourself
              </div>
              <h1 className="text-[clamp(2.4rem,5.5vw,4.25rem)] font-bold uppercase tracking-[-0.03em] leading-[0.96] text-on-surface">
                ONE WOMAN.
                <br />
                <span className="text-primary">MANY ROLES.</span>
                <br />
                MANY MOODS.
              </h1>
              <p className="text-[15px] sm:text-lg leading-[1.65] text-body-slate max-w-xl font-normal">
                SVastra crafts architectural Indian handlooms for sovereign identities — rooted in
                structural modernism and archival artistry, never in costume or cliché.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/products" className="sv-btn-primary">
                  Explore Collections
                </Link>
                <Link href="/contact-us" className="sv-btn-outline">
                  Atelier Concierge
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="media-frame hero-media border border-on-surface/20 bg-surface-dark relative">
                <img
                  src={heroImg}
                  alt="SVastra atelier portrait"
                  className="object-cover w-full h-full"
                  loading="eager"
                  width={960}
                  height={720}
                />
                <div className="absolute bottom-0 inset-x-0 bg-surface-dark/95 text-surface p-4 sm:p-5 border-t border-surface/15">
                  <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-surface/60 block mb-1">
                    Foundational Ethos
                  </span>
                  <p className="text-[13px] sm:text-[14px] font-semibold tracking-tight text-surface uppercase">
                    PRESENCE OVER NOISE // NEVER A COSTUME
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ARCHITECTURAL METRICS */}
      <section className="w-full bg-surface-subtle border-b border-border-line">
        <div className="max-w-site mx-auto site-pad py-10 sm:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {[
              { value: "4", label: "Sovereign Roles", note: "One Unified Wardrobe" },
              { value: "0%", label: "Synthetic Polyester", note: "Pure Fiber Architecture" },
              { value: "380 GSM", label: "High-Density Silks", note: "Monolithic Drape Weight" },
              { value: "0.0%", label: "Decorative Filigree", note: "Structure Over Cliché" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center lg:text-left lg:border-l lg:first:border-l-0 border-border-line lg:pl-6 first:pl-0"
              >
                <span className="text-3xl sm:text-4xl font-bold text-primary tracking-[-0.025em] block">
                  {stat.value}
                </span>
                <span className="label-caps text-on-surface mt-2 block font-semibold">{stat.label}</span>
                <span className="text-[11px] text-body-slate mt-0.5 block">{stat.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE TENSION MATRIX & ATELIER MANIFESTO (Full-Bleed Noir) */}
      <section
        id="manifesto"
        className="w-full bg-surface-dark text-surface border-b border-border-line scroll-mt-24"
      >
        <div className="max-w-site mx-auto site-pad section-y">
          <div className="border-b border-border-line-dark pb-5 sm:pb-6 mb-8 sm:mb-12">
            <span className="label-caps text-accent-ochre block tracking-[0.18em]">
              THE SVASTRA TENSION MATRIX // FOUNDATIONAL PRINCIPLES
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center mb-12 sm:mb-16">
            <div className="lg:col-span-6">
              <TensionMatrixGraphic />
            </div>
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-[-0.025em] text-surface">
                PRESENCE OVER NOISE
              </h2>
              <div className="bg-surface-dark border-l-2 border-primary pl-4 sm:pl-5 py-2">
                <p className="text-base sm:text-lg font-medium text-surface/90 leading-relaxed">
                  “She doesn’t ask the room for permission to belong. She leads without needing to announce it.”
                </p>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-surface/50 mt-2 block">
                  — The Leader Manifesto
                </span>
              </div>
              <p className="text-[14px] sm:text-base leading-[1.65] text-surface/75 font-normal">
                Leadership in her world is not costume. It is posture, fabric weight, and the refusal of
                ornamental distraction. Every seam is a decision. Every drape holds the room without raising its voice.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-2 text-[13px]">
                <div className="border-l-2 border-primary pl-3.5 py-1">
                  <span className="font-bold text-surface uppercase block text-[13px] tracking-wide">Indian</span>
                  <span className="text-surface/60 text-xs">Never stereotypical or ornamental costume.</span>
                </div>
                <div className="border-l-2 border-accent-magenta pl-3.5 py-1">
                  <span className="font-bold text-surface uppercase block text-[13px] tracking-wide">Feminine</span>
                  <span className="text-surface/60 text-xs">Softness engineered with undeniable backbone.</span>
                </div>
                <div className="border-l-2 border-accent-ochre pl-3.5 py-1">
                  <span className="font-bold text-surface uppercase block text-[13px] tracking-wide">Bold</span>
                  <span className="text-surface/60 text-xs">Quiet command through material weight.</span>
                </div>
                <div className="border-l-2 border-accent-blue pl-3.5 py-1">
                  <span className="font-bold text-surface uppercase block text-[13px] tracking-wide">Modern</span>
                  <span className="text-surface/60 text-xs">Without relinquishing historical roots.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 sm:pt-14 border-t border-border-line-dark">
            <span className="label-caps text-primary block mb-3">Atelier Manifesto</span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-[-0.03em] text-surface leading-[1.1] max-w-4xl">
              We do not design costumes for occasions.
              <br className="hidden sm:block" />
              We craft modern armour for real life.
            </h2>
          </div>
        </div>
      </section>

      {/* 4. ATELIER CRAFT & PROVENANCE DISCIPLINE */}
      <section className="w-full bg-surface border-b border-border-line">
        <div className="max-w-site mx-auto site-pad section-y">
          <div className="border-b border-border-line pb-6 sm:pb-8 mb-8 sm:mb-12">
            <span className="label-caps text-primary block mb-2">Atelier Craft Discipline</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-[-0.025em] text-on-surface">
              FABRIC ARCHITECTURE & PROVENANCE
            </h2>
            <p className="text-[14px] sm:text-base text-body-slate mt-2 max-w-2xl font-normal">
              Structured drapes, razor pallu engineering, and monolithic fabric density designed for long-term presence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROVENANCE_HIGHLIGHTS.map((item, index) => (
              <article
                key={item.title}
                className="bg-surface-ivory border border-border-line p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-border-line pb-3">
                    <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-primary">
                      Spec 0{index + 1}
                    </span>
                    <span className="text-[11px] font-semibold tracking-wider text-body-slate uppercase">
                      {item.gsm}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-on-surface mb-1">
                    {item.title}
                  </h3>
                  <span className="text-[12px] font-semibold text-primary block uppercase tracking-wider mb-3">
                    {item.silhouette}
                  </span>
                  <p className="text-[13px] text-body-slate leading-relaxed mb-4">
                    {item.discipline}
                  </p>
                </div>
                <div className="pt-3 border-t border-border-line/60">
                  <span className="text-[10px] font-bold tracking-widest text-body-slate uppercase block">
                    Weave Origin
                  </span>
                  <span className="text-[12px] font-semibold text-on-surface uppercase">
                    {item.origin}
                  </span>
                </div>
              </article>
            ))}
          </div>

          {/* Provenance specs ribbon */}
          <div className="mt-8 bg-surface-subtle border border-border-line p-5 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-body-slate block">
                Primary Fibers
              </span>
              <span className="text-[13px] sm:text-[14px] font-bold text-on-surface uppercase block mt-1">
                Tussar · Mulberry · Chanderi · Linen
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-body-slate block">
                Weave Clusters
              </span>
              <span className="text-[13px] sm:text-[14px] font-bold text-on-surface uppercase block mt-1">
                Bhagalpur · Bengal · Chanderi · Kutch
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-body-slate block">
                Drape System
              </span>
              <span className="text-[13px] sm:text-[14px] font-bold text-on-surface uppercase block mt-1">
                Razor Pallu · Zero Pins Required
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-body-slate block">
                Geometry & Finish
              </span>
              <span className="text-[13px] sm:text-[14px] font-bold text-on-surface uppercase block mt-1">
                0px Sharp Edge · Restrained Border
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AFFECTIVE FREQUENCIES ("HOW THE WEARER FEELS") */}
      <section className="w-full bg-surface-subtle border-b border-border-line">
        <div className="max-w-site mx-auto site-pad section-y">
          <div className="border-b border-border-line pb-6 mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="label-caps text-primary block mb-2">Affective Frequencies</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-[-0.025em] text-on-surface">
                HOW THE LEADER FEELS
              </h2>
            </div>
            <p className="text-[14px] text-body-slate max-w-md font-normal">
              Draping as an intentional state of mind. Curated across three essential frequencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {AFFECTIVE_FREQUENCIES.map((freq) => (
              <div
                key={freq.tag}
                className="bg-surface border border-border-line p-6 sm:p-8 flex flex-col justify-between hover:border-on-surface transition-colors"
              >
                <div>
                  <span className="inline-block bg-surface-dark text-surface px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase mb-4">
                    {freq.tag}
                  </span>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-on-surface mb-2">
                    {freq.tagline}
                  </h3>
                  <p className="text-[13px] sm:text-[14px] text-body-slate leading-relaxed mt-3">
                    {freq.desc}
                  </p>
                </div>
                <Link
                  href={freq.href}
                  className="mt-6 pt-4 border-t border-border-line label-caps text-primary hover:text-on-surface inline-flex items-center gap-1.5 transition-colors font-semibold text-[11px]"
                >
                  Explore {freq.tag} Edits →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SOVEREIGN IDENTITIES ("DISCOVER ANOTHER VERSION OF YOU") */}
      <section className="w-full bg-surface border-b border-border-line">
        <div className="max-w-site mx-auto site-pad section-y">
          <div className="border-b border-border-line pb-6 sm:pb-8 mb-8 sm:mb-12">
            <span className="label-caps text-primary block mb-2">Chapter Navigation</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-[-0.025em] text-on-surface">
              DISCOVER ANOTHER VERSION OF YOU
            </h2>
            <p className="text-[14px] sm:text-base text-body-slate mt-2 max-w-2xl font-normal">
              Four distinct sovereign roles engineered into one modern wardrobe. Move fluidly between who you are and who you choose to be.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ARCHETYPES.map((arch) => (
              <article
                key={arch.slug}
                className="bg-surface-ivory border border-border-line p-6 flex flex-col justify-between hover:border-on-surface transition-colors"
              >
                <div>
                  <span className="inline-block bg-surface-dark text-surface px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase mb-3">
                    {arch.chapter} · {arch.roleNo}
                  </span>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-on-surface">
                    {arch.name}
                  </h3>
                  <span className="text-[12px] font-semibold text-primary block uppercase tracking-wider mt-1 mb-3">
                    {arch.tag}
                  </span>
                  <div className="border-l-2 border-border-line pl-3 py-1 my-3 bg-surface/50">
                    <p className="text-[12px] italic text-on-surface/90 leading-snug">
                      “{arch.quote}”
                    </p>
                  </div>
                  <p className="text-[13px] text-body-slate leading-relaxed line-clamp-3">
                    {arch.blurb}
                  </p>
                </div>
                <Link
                  href={`/shop/${arch.slug}`}
                  className="mt-6 pt-3 border-t border-border-line label-caps text-on-surface hover:text-primary transition-colors inline-flex items-center gap-1.5 text-[11px]"
                >
                  Explore {arch.name} →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 7. OUR STORY & COMMITMENTS */}
      <section className="w-full bg-surface-subtle border-b border-border-line">
        <div className="max-w-site mx-auto site-pad section-y">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-4">
              <span className="label-caps text-primary block mb-3">Our Story</span>
              <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-[-0.025em] text-on-surface leading-tight">
                BUILT FOR REAL LIFE
              </h2>
              <p className="text-[13px] text-body-slate mt-4 leading-relaxed">
                Direct weaver partnerships across Bhagalpur, Chanderi, Bengal, and Kutch. Honest pricing based on material density rather than label markup.
              </p>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COMMITMENTS.map((c) => (
                <div key={c.title} className="border border-border-line bg-surface p-5 sm:p-6">
                  <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] text-on-surface mb-2">
                    {c.title}
                  </h3>
                  <p className="text-[13px] text-body-slate leading-relaxed">{c.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. EDITORIAL CODA */}
      <section className="w-full bg-surface-dark text-surface">
        <div className="max-w-site mx-auto site-pad py-16 lg:py-24 text-center">
          <span className="label-caps text-surface/50 block mb-4">SVastra Ethos</span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-[-0.03em] mb-4 text-surface">
            WEAR YOURSELF.
          </h2>
          <p className="text-sm sm:text-base text-surface/70 max-w-xl mx-auto mb-8 leading-relaxed font-normal">
            Leadership looks different on everyone. The same silhouette, rewritten by the woman who wears it.
            Authority is not a size — it is a stance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/products" className="sv-btn-primary !bg-primary hover:!bg-surface-ivory hover:!text-on-surface">
              Explore The Edit
            </Link>
            <Link href="/contact-us" className="sv-btn-outline !border-surface/30 !text-surface hover:!bg-surface hover:!text-on-surface">
              Atelier Concierge
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
