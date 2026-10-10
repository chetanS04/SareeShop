const TENSION_PILLARS = [
  {
    title: "Indian",
    titleClass: "text-primary",
    subtitle: "But not stereotypical",
    body:
      "We reject bridal clichés, heavy sequins, and costume caricature in favor of pure fiber gravitas.",
  },
  {
    title: "Feminine",
    titleClass: "text-surface",
    subtitle: "But not delicate",
    body:
      "Softness engineered with backbone. Drapes that stride through public life with authority.",
  },
  {
    title: "Bold",
    titleClass: "text-accent-ochre",
    subtitle: "But not loud",
    body:
      "Quiet command through material weight, unexpected cuts, and flawless sartorial precision.",
  },
  {
    title: "Modern",
    titleClass: "text-surface",
    subtitle: "Without losing roots",
    body:
      "Archival pit-loom techniques preserved inside radical, forward-looking contemporary design.",
  },
] as const;

export default function SvastraFoundationalPrinciples() {
  return (
    <section
      id="foundational-principles"
      className="w-full bg-surface-dark text-surface border-b border-border-line scroll-mt-24"
      aria-labelledby="foundational-principles-title"
    >
      <div className="max-w-site mx-auto site-pad section-y">
        <span
          id="foundational-principles-title"
          className="text-[11px] font-semibold tracking-[0.18em] uppercase text-accent-ochre block mb-8 sm:mb-10"
        >
          The SVastra Tension Matrix // Foundational Principles
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-border-line-dark divide-y sm:divide-y lg:divide-y-0 sm:divide-x divide-border-line-dark">
          {TENSION_PILLARS.map((pillar) => (
            <article key={pillar.title} className="px-5 sm:px-6 py-6 sm:py-8">
              <h3
                className={`text-2xl sm:text-[1.75rem] font-bold uppercase tracking-tight leading-none mb-2 ${pillar.titleClass}`}
              >
                {pillar.title}
              </h3>
              <p className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.12em] text-surface/75 mb-3">
                {pillar.subtitle}
              </p>
              <p className="text-[13px] sm:text-[14px] leading-[1.65] text-surface/60">
                {pillar.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
