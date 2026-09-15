"use client";

import Link from "next/link";

const TENSION_LINES = [
  { word: "Indian", phrase: "but not stereotypical", color: "text-primary" },
  { word: "Feminine", phrase: "but not delicate", color: "text-accent-magenta" },
  { word: "Bold", phrase: "but not loud", color: "text-accent-ochre" },
  { word: "Modern", phrase: "without losing its roots", color: "text-accent-blue" },
] as const;

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

/** Pure CSS tension matrix — Inter only (same font family as home.html) */
export function TensionMatrixGraphic() {
  return (
    <div
      className="relative w-full aspect-[16/9] bg-black border border-surface/20 overflow-hidden flex items-center"
      role="img"
      aria-label="Indian but not stereotypical. Feminine but not delicate. Bold but not loud. Modern without losing its roots."
    >
      <div className="w-full px-5 sm:px-7 lg:px-8 py-6 sm:py-8 space-y-0" aria-hidden="true">
        {TENSION_LINES.map((line) => (
          <div
            key={line.word}
            className="flex flex-wrap items-baseline gap-x-3 sm:gap-x-4 lg:gap-x-5"
          >
            <span className={`sv-tension-word uppercase ${line.color}`}>{line.word}</span>
            <span className="sv-tension-phrase">{line.phrase}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SvastraManifesto() {
  return (
    <section
      id="manifesto"
      className="w-full bg-surface-dark text-surface border-b border-border-line scroll-mt-24"
      aria-labelledby="manifesto-title"
    >
      <div className="max-w-site mx-auto site-pad section-y">
        <div className="border-b border-border-line-dark pb-5 sm:pb-6 mb-10 sm:mb-12">
          <span className="label-caps text-accent-ochre block tracking-[0.18em]">
            The SVastra Tension Matrix // Foundational Principles
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-12 sm:mb-16">
          <div className="lg:col-span-6">
            <TensionMatrixGraphic />
          </div>

          <div className="lg:col-span-6 space-y-5 sm:space-y-6">
            <h2
              id="manifesto-title"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight text-surface"
            >
              Uncompromising Duality
            </h2>
            <p className="text-[15px] sm:text-lg leading-[1.6] text-surface/80">
              SVastra operates strictly in the creative tension between ancestral heritage and modern
              sovereign identity. We reject nostalgic ornamentalism in favor of pure fiber
              architecture.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 pt-2 text-[13px]">
              {PRINCIPLES.map((item) => (
                <div key={item.title} className={`border-l-2 ${item.border} pl-4`}>
                  <span className="font-bold text-surface uppercase block text-[14px]">
                    {item.title}
                  </span>
                  <span className="text-surface/60">{item.copy}</span>
                </div>
              ))}
            </div>
            <div className="pt-1">
              <Link
                href="/about-us"
                className="inline-flex items-center justify-center min-h-[48px] px-8 border border-surface/40 text-surface text-[12px] font-semibold tracking-[0.06em] uppercase hover:bg-surface hover:text-on-surface transition-colors"
              >
                About SVastra
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-10 sm:pt-12 border-t border-border-line-dark">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">
            <div className="lg:col-span-8 space-y-4">
              <span className="label-caps text-primary block">The Atelier Manifesto</span>
              <p className="text-2xl sm:text-3xl lg:text-5xl font-bold uppercase tracking-tight text-surface leading-[1.12]">
                We do not design costumes for occasions.
                <br className="hidden sm:block" />
                We craft modern armour for real life.
              </p>
            </div>
            <div className="lg:col-span-4 flex items-center gap-8 lg:justify-end border-t lg:border-t-0 border-border-line-dark pt-6 lg:pt-0">
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
        </div>
      </div>
    </section>
  );
}
