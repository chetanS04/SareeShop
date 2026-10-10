"use client";

import Link from "next/link";

const TENSION_MATRIX_IMG = "/svastra/tension-matrix.png";

const PRINCIPLES = [
  {
    title: "Indian",
    copy: "But never stereotypical or ornamental costume.",
    border: "border-primary",
  },
  {
    title: "Feminine",
    copy: "Softness engineered with undeniable backbone.",
    border: "border-accent-magenta",
  },
  {
    title: "Bold",
    copy: "Quiet command through material weight.",
    border: "border-accent-ochre",
  },
  {
    title: "Modern",
    copy: "Without relinquishing historical roots.",
    border: "border-accent-blue",
  },
] as const;

/** Tension matrix visual — same asset & frame as home.html */
export function TensionMatrixGraphic() {
  return (
    <div className="relative aspect-[16/9] bg-black border border-surface/20 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={TENSION_MATRIX_IMG}
        alt="Indian Feminine Bold Modern — SVastra Tension Matrix"
        className="w-full h-full object-contain bg-black"
        width={960}
        height={540}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

/**
 * Home manifesto block — port of home.html SECTION 5 (lines 504–571).
 */
export default function SvastraManifesto() {
  return (
    <section
      id="manifesto"
      className="w-full bg-surface-dark text-surface border-b border-border-line scroll-mt-24"
      aria-labelledby="manifesto-title"
    >
      <div className="max-w-site mx-auto site-pad section-y">
        {/* Tension Matrix Visual Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-16">
          <div className="lg:col-span-6">
            <TensionMatrixGraphic />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <h3
              id="manifesto-title"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight text-surface"
            >
              Uncompromising Duality
            </h3>
            <p className="text-base sm:text-lg leading-[1.6] text-surface/80">
              SVastra operates strictly in the creative tension between ancestral heritage and modern
              sovereign identity. We reject nostalgic ornamentalism in favor of pure fiber
              architecture.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 text-[13px]">
              {PRINCIPLES.map((item) => (
                <div key={item.title} className={`border-l-2 ${item.border} pl-4`}>
                  <span className="font-bold text-surface uppercase block text-[14px]">
                    {item.title}
                  </span>
                  <span className="text-surface/60">{item.copy}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Manifesto Core Quote & Textile Metrics */}
        <div className="pt-12 border-t border-border-line-dark mt-12 sm:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-primary">
                Our Philosophy
              </span>
              <h2 className="text-[clamp(1.35rem,4.5vw,3rem)] font-bold uppercase tracking-tight text-surface leading-[1.12]">
                We do not design costumes for occasions.
                <br />
                We craft modern armour for real life.
              </h2>
            </div>
            <div className="lg:col-span-4 flex flex-wrap items-center gap-6 sm:gap-8 lg:justify-end border-t lg:border-t-0 border-border-line-dark pt-6 lg:pt-0">
              <div>
                <span className="text-3xl lg:text-4xl font-bold text-accent-ochre block">4,200+</span>
                <span className="text-[10px] font-semibold tracking-wider text-surface/60 uppercase">
                  Weaver hours per piece
                </span>
              </div>
              <div className="h-10 w-px bg-surface/20" aria-hidden="true" />
              <div>
                <span className="text-3xl lg:text-4xl font-bold text-surface block">0%</span>
                <span className="text-[10px] font-semibold tracking-wider text-surface/60 uppercase">
                  Synthetic polyester
                </span>
              </div>
            </div>
          </div>

          <div className="pt-10">
            <Link
              href="/about-us"
              className="inline-flex items-center justify-center min-h-[48px] px-8 border border-surface/40 text-surface text-[12px] font-semibold tracking-[0.06em] uppercase hover:bg-surface hover:text-on-surface transition-colors"
            >
              About SVastra
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
