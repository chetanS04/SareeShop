import Link from "next/link";

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBtCE2WnzpoelmZQhqQX0KCkDNT1n1pi3OVz4po-0G4iwkp0YrC9-jut34UTPEb3iYQbkWJ8a1D7RVjxQq3RVzWcR0c0CyfWzOOygtcrDkU8DDayb6R-TJa9BIDnsk9pV723QKQhgSil0orX6sPksk1wAimpcRmG4fkOt26nd0OW7uVRNFzrTf7O_rg66oupa-xZ6oxIKkz5NfUZGPw7m1gSx5I74b8qU0wQBR7ijfyLM-8f1xZS9gdo2OnNRmgawlTuA";

export default function SvastraHero() {
  return (
    <section className="w-full bg-surface border-b border-border-line" aria-labelledby="hero-title">
      <div className="max-w-site mx-auto site-pad pt-8 sm:pt-10 pb-12 sm:pb-16 lg:pb-24">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-on-surface/15 pb-3.5 sm:pb-4 mb-8 sm:mb-10 label-caps text-body-slate">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-block w-2 h-2 bg-primary shrink-0" aria-hidden="true" />
            <span className="truncate">Autumn / Winter Archive 2025</span>
          </div>
          <span className="hidden md:inline-block">Volume IV · Architectural Textile Edits</span>
          <span className="shrink-0">№ 04 // Wear Yourself</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-6 flex flex-col justify-between order-2 lg:order-1">
            <div>
              <div className="inline-block bg-surface-ivory px-3 py-1.5 mb-5 sm:mb-6 border border-border-line label-caps text-primary">
                Brand Philosophy · Wear Yourself
              </div>
              <h1 id="hero-title" className="display-hero text-on-surface">
                One Woman.
                <br />
                <span className="text-primary">Many Roles.</span>
                <br />
                Many Moods.
                <br />
                One SVastra.
              </h1>
              <p className="text-[15px] sm:text-base lg:text-[19px] leading-[1.58] text-body-slate mt-5 sm:mt-7 max-w-xl">
                Which version of you is showing up today? Crafted at the convergence of Indian textile mastery and contemporary razor-sharp tailoring. Unapologetic. Grounded. Sovereign.
              </p>
            </div>

            <div className="mt-8 sm:mt-10 lg:mt-14 pt-6 border-t border-border-line">
              <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
                <Link href="#shop-who" className="sv-btn-primary group">
                  <span>Discover Your Edit</span>
                  <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">
                    →
                  </span>
                </Link>
                <Link href="#manifesto" className="sv-btn-outline">
                  Explore Manifesto
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-7 sm:mt-8 pt-6 border-t border-border-line">
                <div>
                  <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-on-surface block">
                    100% Handloom
                  </span>
                  <span className="text-[12px] sm:text-[13px] text-body-slate mt-1 block">
                    Tussar &amp; Organic Chanderi
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-on-surface block">
                    Zero Filigree
                  </span>
                  <span className="text-[12px] sm:text-[13px] text-body-slate mt-1 block">
                    Architectural Lines Only
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative order-1 lg:order-2">
            <div className="media-frame hero-media border border-on-surface/20 bg-surface-dark">
              <img
                alt="She Knows Who She Is — SVastra Hero Editorial"
                className="w-full h-full object-cover object-center grayscale contrast-110 hover:grayscale-0 transition-all duration-700"
                width={1200}
                height={750}
                decoding="async"
                fetchPriority="high"
                src={HERO_IMG}
              />
              <div className="absolute bottom-0 inset-x-0 bg-surface-dark/90 text-surface p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-surface/15">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-surface/60 block">
                    Archival Keynote
                  </span>
                  <p className="text-[12px] sm:text-[13px] font-semibold tracking-tight text-surface uppercase truncate">
                    Facet 01 // The Strategist in Raw Tussar
                  </p>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-surface/60 block">
                    Origin
                  </span>
                  <span className="text-[12px] font-semibold text-accent-ochre">Bhagalpur Weave</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-[10px] sm:text-[11px] font-medium tracking-[0.08em] text-body-slate uppercase">
              <span>Edition: SV-2025-01</span>
              <span className="text-right">Limited Artisanal Release</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
