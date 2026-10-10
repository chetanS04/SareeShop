"use client";

import Link from "next/link";
import { Truck, RotateCcw, Leaf, ShieldCheck, BadgeCheck } from "lucide-react";

const MANIFESTO_SPECS = [
  { label: "Specs", value: "100% Organic Handloom" },
  { label: "Purity", value: "Zero Synthetic Weft" },
  { label: "Function", value: "All-Day Thermal Reg" },
] as const;

const BRAND_PERSONALITY = "/svastra/brand-personality.png";
const STORY_IMAGE = "/svastra/hero-she-knows.png";

const PROMISES = [
  {
    icon: Leaf,
    title: "Handloom Fabric",
    body: "Every saree is a genuine handloom weave in cotton, silk, or linen. No polyester blends.",
  },
  {
    icon: Truck,
    title: "Delivered Across India",
    body: "Carefully packed and shipped nationwide, with tracking on every order.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    body: "Return or exchange eligible pieces within the return window shown on each product.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    body: "Pay by UPI, card, or net banking. Cash on delivery available on eligible orders.",
  },
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface overflow-x-hidden">
      {/* Hero */}
      <section className="w-full bg-surface border-b border-border-line">
        <div className="max-w-site mx-auto site-pad pt-6 sm:pt-8 pb-12 sm:pb-16 lg:pb-20">
          <nav
            className="label-caps text-body-slate mb-5 sm:mb-6 flex flex-wrap items-center gap-2"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="text-on-surface/30" aria-hidden="true">/</span>
            <span className="text-on-surface">About</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 order-2 lg:order-1">
              <span className="label-caps text-primary block">About Svastra</span>

              <h1 className="text-[clamp(2.35rem,5.2vw,3.75rem)] font-bold tracking-[-0.03em] leading-[1.05] text-on-surface">
                Many roles. Many moods.
                <br />
                <span className="text-primary">Always you.</span>
              </h1>

              <p className="text-[15px] sm:text-[17px] leading-[1.65] text-body-slate max-w-xl">
                What a woman wears should reflect who she is and the strength she carries within.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link href="/products" className="sv-btn-primary">
                  Explore The Collection
                </Link>
                <Link href="/contact-us" className="sv-btn-outline">
                  Contact Us
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <figure className="media-frame hero-media border border-on-surface/15 bg-surface-dark relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={BRAND_PERSONALITY}
                  alt="Svastra brand personality — confident, bold, feminine, ambitious, rooted, and unapologetic"
                  className="object-cover w-full h-full object-center"
                  loading="eager"
                  width={960}
                  height={540}
                />
                <figcaption className="absolute bottom-0 inset-x-0 bg-surface-dark/95 text-surface px-4 py-3.5 sm:px-5 sm:py-4 border-t border-surface/10">
                  <span className="label-caps text-surface/55 block mb-1">Brand Personality</span>
                  <p className="text-[12px] sm:text-[13px] font-semibold tracking-[0.06em] uppercase text-surface">
                    Wear Yourself
                  </p>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto note */}
      <section
        id="philosophy"
        className="w-full bg-surface-dark text-surface border-b border-border-line scroll-mt-24"
        aria-labelledby="about-manifesto-title"
      >
        <div className="max-w-site mx-auto site-pad py-14 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-8 space-y-6 sm:space-y-8">
              <div>
                <span className="inline-flex items-center gap-2 label-caps text-accent-ochre mb-4">
                  <span className="w-2 h-2 bg-primary shrink-0" aria-hidden="true" />
                  Our Philosophy
                </span>
                <h2
                  id="about-manifesto-title"
                  className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold uppercase tracking-[-0.025em] leading-[1.05] text-surface max-w-3xl"
                >
                  The Architecture of Quiet Power.
                </h2>
                <p className="text-[15px] sm:text-[17px] leading-[1.7] text-surface/75 mt-5 max-w-2xl">
                  Managing worlds requires garments that never bind, pinch, or demand performance.
                  Pure unforced fabric engineered for the woman who centers everything.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl">
                {MANIFESTO_SPECS.map((spec) => (
                  <div
                    key={spec.label}
                    className="bg-surface/10 border border-surface/15 p-4 sm:p-5"
                  >
                    <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-accent-ochre block mb-2">
                      {spec.label}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-surface tracking-tight">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <aside className="lg:col-span-4 bg-surface/10 border border-surface/15 p-6 sm:p-8 flex flex-col">
              <BadgeCheck className="w-8 h-8 text-accent-ochre mb-5 shrink-0" strokeWidth={1.5} aria-hidden />
              <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-surface mb-4">
                Unforced Reverence
              </h3>
              <p className="text-[14px] sm:text-[15px] leading-[1.7] text-surface/75 flex-1">
                We do not believe luxury should ask you to suffer for a silhouette. Our master
                weavers in Chanderi set the loom tension to deliberate low-density breathability so
                every drape feels like clean air.
              </p>
              <Link
                href="#story"
                className="mt-6 label-caps text-accent-ochre hover:text-surface transition-colors inline-flex items-center gap-2"
              >
                <span>Explore Weaver Diaries</span>
                <span aria-hidden="true">→</span>
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section id="story" className="w-full bg-surface-subtle border-b border-border-line scroll-mt-24">
        <div className="max-w-site mx-auto site-pad section-y">
          <div className="mb-8 sm:mb-10 max-w-2xl">
            <span className="label-caps text-primary block mb-2">Our Story</span>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-[-0.025em] text-on-surface leading-tight">
              Built on belief. Worn with confidence.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <figure className="lg:col-span-4 w-full max-w-[min(100%,320px)] sm:max-w-[360px] mx-auto lg:mx-0">
              <div className="media-frame aspect-[3/4] sm:max-h-[420px] lg:max-h-none border border-on-surface/15 bg-surface-dark relative overflow-hidden w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={STORY_IMAGE}
                  alt="Svastra founder story — a woman in confidence and poise"
                  className="object-cover w-full h-full object-center"
                  loading="lazy"
                  width={800}
                  height={1000}
                />
              </div>
              <figcaption className="mt-4 border-l-2 border-primary pl-4">
                <span className="label-caps text-primary block mb-1">Founded by Sapna Acharya</span>
                <p className="text-[13px] sm:text-[14px] text-body-slate leading-relaxed">
                  A working professional, mother, and entrepreneur who believes every woman should
                  wear herself with confidence.
                </p>
              </figcaption>
            </figure>

            <div className="lg:col-span-8 space-y-6 sm:space-y-7">
              <p className="text-[16px] sm:text-[18px] leading-[1.7] text-on-surface">
                Svastra began with a simple belief: what a woman wears should reflect who she is and
                the strength she carries within.
              </p>

              <p className="text-[15px] sm:text-[16px] leading-[1.75] text-body-slate">
                Founded by Sapna Acharya, Svastra brings together a love for sarees and a vision of
                women feeling confident, comfortable, and connected to their roots. As a working
                professional, mother, and entrepreneur, Sapna understands the many roles a woman
                moves through—and the importance of keeping her own identity within them.
              </p>

              <p className="text-[15px] sm:text-[16px] leading-[1.75] text-on-surface font-medium border-l-2 border-primary pl-4 py-1">
                That thought is at the heart of Svastra: Wear Yourself.
              </p>

              <p className="text-[15px] sm:text-[16px] leading-[1.75] text-body-slate">
                Our collections celebrate your different moods and moments. From soft cottons for
                everyday living and work to elegant sarees for celebrations, we choose pieces with
                comfort, individuality, and understated beauty in mind.
              </p>

              <p className="text-[15px] sm:text-[16px] leading-[1.75] text-body-slate">
                We believe a saree belongs wherever you choose to take it—to an important meeting, a
                festive gathering, a lunch with friends, or simply a day when you feel like wearing
                one.
              </p>

              <p className="text-[15px] sm:text-[16px] leading-[1.75] text-body-slate">
                Whether you are building a career, nurturing a home, pursuing a dream, or
                discovering something new about yourself, Svastra celebrates the woman you are—and
                the woman you are becoming.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Promises */}
      <section
        className="w-full bg-surface border-b border-border-line"
        aria-labelledby="promises-title"
      >
        <div className="max-w-site mx-auto site-pad section-y">
          <div className="border-b border-border-line pb-6 sm:pb-8 mb-8 sm:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="label-caps text-primary block mb-2">Why Svastra</span>
              <h2 id="promises-title" className="display-section text-on-surface uppercase">
                What You Can Count On
              </h2>
              <p className="text-[14px] sm:text-[15px] text-body-slate mt-2 max-w-xl leading-relaxed">
                Straightforward promises on the fabric, the delivery, and the returns.
              </p>
            </div>
            <Link
              href="/contact-us"
              className="label-caps text-on-surface hover:text-primary transition-colors inline-flex items-center gap-2 shrink-0"
            >
              Get In Touch
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {PROMISES.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="p-6 sm:p-7 flex flex-col gap-3 bg-surface-subtle border border-border-line"
                >
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} aria-hidden />
                  <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface">
                    {p.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-body-slate">{p.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="w-full bg-surface-dark text-surface">
        <div className="max-w-site mx-auto site-pad py-16 lg:py-24 text-center">
          <span className="text-[10px] font-semibold tracking-[0.18em] text-surface/50 block mb-4">
            Svastra
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] mb-4 text-surface">
            Draped in Confidence.
          </h2>
          <p className="text-sm sm:text-base text-surface/65 max-w-xl mx-auto mb-8 leading-relaxed">
            Wear Yourself. Celebrate the woman you are and the woman you are becoming.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link href="/products" className="sv-btn-primary">
              Shop The Collection
            </Link>
            <Link
              href="/contact-us"
              className="sv-btn-outline !border-surface/35 !text-surface hover:!bg-surface hover:!text-on-surface"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
