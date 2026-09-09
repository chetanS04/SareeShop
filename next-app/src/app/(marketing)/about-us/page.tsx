'use client';

import Link from 'next/link';

const MATRIX_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC3p8dJiP3tP5b9DqkcMnsdnmemTj4fYT8tvQ_fdiZRHjVNHWsMNAYBtNI2zyTfbjjGqIXVGhfBbu_hKFcn32mnQyqLh8C4a34XiWcJ-9-ioaLsMpKXmlQVxOBIQHEHO6XrIkGcoDx2eNtkrvcGuMWb90UL6IO7WfAGgC2fuscKgnJhFXNcBsbz6nG7pACp9-5KAwwPe6zs7PiIU1YEMJ3PknYhRvUVruEQTGiwMxUJKgvunI4j-CqC2JRwvphFyVJmYQ';

const HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB-Je9M0u_55q0wHrmqWEMsBDbXWPlohDaHcOthm2xdUaMDIDFH1SibWapnFx7cC3cOaYGG8jJdj8GO3kJVswgXEOHWAGh8wOPlKMXGlQNKnUn0LwfJLNpVb5HBbs7W8s9nSDYkBgd5uoy99Eh0xTcsJwIPPA63NlksemhlWtsqIf2s6SaMloO3CAAw1R4q7ftWeeEE_dobeQtFETk7wjZmHEoD6XOY8luMSxN2tq62o5Mo3DVCyCuo';

const RHEA =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDWzk91P7wT9g7xbJTg-xt0a7rdUfd8EhBqFa_5d9qeUXKwQBHqlFbLSGzRIJ1eXVkmpyRs7yrLi3U41wFaykMzQMp0lzkzuxaoquynssqV3tuuRIKSuvok-3Fe0oLbXbvtuDQXLBdb6rTvZ4UKwNrMz4pTdEOajPsOZ5y5rw46mpQbdrOcp_v9OdTBuBqQW84HQta81KWKE0ls0et8Yo_RDGEvWUZvskHT_OI02Hrb3GOl15RMMGoN';

const FACETS = [
  {
    num: '01',
    title: 'The Strategist',
    line: 'Presence & Strategy',
    copy: 'Structured silhouettes for rooms where decisions are authored, not borrowed.',
  },
  {
    num: '02',
    title: 'The Contemplative',
    line: 'Depth & Equanimity',
    copy: 'Quiet weight in fiber — pieces that hold stillness without disappearing.',
  },
  {
    num: '03',
    title: 'The Fluid',
    line: 'Fluidity & Visceral Poise',
    copy: 'Movement engineered into drape; softness with undeniable backbone.',
  },
  {
    num: '04',
    title: 'The Sanctuary',
    line: 'Tactile Sanctuary',
    copy: 'At-home armour — tactile luxury that never performs ornament.',
  },
];

const COMMITMENTS = [
  {
    title: '100% Handloom',
    copy: 'Pure fiber architecture. No synthetic polyester. Weaver hours over shortcuts.',
  },
  {
    title: 'Zero Filigree',
    copy: 'We reject nostalgic costume. Ornament never replaces structure.',
  },
  {
    title: 'Concierge Care',
    copy: 'Complimentary atelier guidance — fit, occasion, and edit curation.',
  },
  {
    title: 'Global Dispatch',
    copy: 'Curated edits ship with archival packing and tracked delivery.',
  },
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Hero */}
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
                SVastra crafts architectural Indian handlooms for sovereign identities —
                rooted in modernism and archival artistry, never in costume or cliché.
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
                  src={HERO_IMG}
                  alt="SVastra atelier portrait"
                  className="object-cover"
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

      {/* Stats */}
      <section className="w-full bg-surface-subtle border-b border-border-line">
        <div className="max-w-site mx-auto site-pad py-10 sm:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {[
              { value: '4,200+', label: 'Weaver Hours Per Piece' },
              { value: '0%', label: 'Synthetic Polyester' },
              { value: '4', label: 'Identity Facets' },
              { value: '∞', label: 'Roles · One Wardrobe' },
            ].map((stat) => (
              <div key={stat.label} className="text-center lg:text-left lg:border-l lg:first:border-l-0 border-border-line lg:pl-6 first:pl-0">
                <span className="text-3xl sm:text-4xl font-bold text-primary tracking-tight block">
                  {stat.value}
                </span>
                <span className="label-caps text-body-slate mt-2 block">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto / Tension Matrix */}
      <section id="manifesto" className="w-full bg-surface-dark text-surface border-b border-border-line scroll-mt-24">
        <div className="max-w-site mx-auto site-pad section-y">
          <div className="border-b border-border-line-dark pb-5 sm:pb-6 mb-8 sm:mb-12">
            <span className="label-caps text-accent-ochre block tracking-[0.18em]">
              The SVastra Tension Matrix // Foundational Principles
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center mb-12 sm:mb-16">
            <div className="lg:col-span-6">
              <div className="media-frame aspect-video sm:aspect-[16/9] bg-black border border-surface/20">
                <img
                  alt="Indian Feminine Bold Modern — SVastra Tension Matrix"
                  className="object-contain bg-black"
                  loading="lazy"
                  width={960}
                  height={540}
                  src={MATRIX_IMG}
                />
              </div>
            </div>
            <div className="lg:col-span-6 space-y-5 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight">
                Uncompromising Duality
              </h2>
              <p className="text-[15px] sm:text-lg leading-[1.6] text-surface/80">
                SVastra operates in the creative tension between ancestral heritage and modern
                sovereign identity. We reject nostalgic ornamentalism in favor of pure fiber architecture.
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

      {/* Story */}
      <section className="w-full bg-surface border-b border-border-line">
        <div className="max-w-site mx-auto site-pad section-y">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <span className="label-caps text-primary block mb-3">Our Story</span>
              <h2 className="display-section text-on-surface">Built for Real Life</h2>
            </div>
            <div className="lg:col-span-8 space-y-5 text-[15px] sm:text-base leading-relaxed text-body-slate">
              <p>
                SVastra began as a refusal — of costume, of filigree-for-filigree&apos;s-sake, of
                wardrobes that ask a woman to shrink into a single role.
              </p>
              <p>
                From Atelier Mumbai and Design Studio New Delhi, we work with handloom lineages and
                contemporary cut. Every release is an independent cut: archival fiber, architectural
                line, and intentional silence where ornament would usually shout.
              </p>
              <p>
                Our customers are strategists, creators, leaders, and contemplatives — women who
                author their own rooms. SVastra is the wardrobe that moves with them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facets */}
      <section className="w-full bg-surface-subtle border-b border-border-line">
        <div className="max-w-site mx-auto site-pad section-y">
          <div className="border-b border-on-surface/15 pb-6 sm:pb-8 mb-8 sm:mb-12">
            <span className="label-caps text-primary block mb-2">Shop Who You Are</span>
            <h2 className="display-section text-on-surface">Four Identity Facets</h2>
            <p className="text-[15px] text-body-slate mt-2 max-w-2xl">
              Not seasons. Not trends. Roles and moods — mapped into edits you can live in.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {FACETS.map((facet) => (
              <article
                key={facet.num}
                className="bg-surface border border-border-line p-5 sm:p-7 flex flex-col justify-between gap-6 hover:border-on-surface transition-colors"
              >
                <div>
                  <span className="inline-block bg-surface-dark text-surface px-2 py-1 text-[10px] font-semibold tracking-widest uppercase mb-4">
                    {facet.num}
                  </span>
                  <span className="label-caps text-primary block mb-2">{facet.line}</span>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-on-surface">
                    {facet.title}
                  </h3>
                  <p className="text-[14px] text-body-slate mt-3 leading-relaxed">{facet.copy}</p>
                </div>
                <Link
                  href="/#shop-who"
                  className="label-caps text-on-surface hover:text-primary transition-colors inline-flex items-center gap-2"
                >
                  Enter Facet <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Commitments */}
      <section className="w-full bg-surface border-b border-border-line">
        <div className="max-w-site mx-auto site-pad section-y">
          <div className="border-b border-on-surface/15 pb-6 sm:pb-8 mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="label-caps text-primary block mb-2">Why SVastra</span>
              <h2 className="display-section text-on-surface">Atelier Commitments</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMMITMENTS.map((item) => (
              <div
                key={item.title}
                className="border border-border-line bg-surface-ivory p-5 sm:p-6 hover:border-on-surface transition-colors"
              >
                <h3 className="text-[14px] font-bold uppercase tracking-tight text-on-surface mb-3">
                  {item.title}
                </h3>
                <p className="text-[13px] text-body-slate leading-relaxed">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voice / essay */}
      <section id="voices" className="w-full bg-surface-subtle border-b border-border-line scroll-mt-24">
        <div className="max-w-site mx-auto site-pad section-y">
          <div className="border-b border-on-surface/15 pb-6 sm:pb-8 mb-8 sm:mb-12">
            <span className="label-caps text-primary block mb-2">Cultural Voices</span>
            <h2 className="display-section text-on-surface">Women of SVastra</h2>
          </div>

          <div className="bg-surface border border-border-line p-6 sm:p-10 lg:p-12">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-line pb-4 label-caps text-body-slate mb-6">
              <span>Essay № 18 · Urban Neurology</span>
              <span>Mumbai</span>
            </div>
            <blockquote className="text-lg sm:text-2xl lg:text-[26px] leading-[1.35] font-semibold tracking-tight m-0 text-on-surface max-w-4xl">
              “I don’t dress to fit into an expectation or validate someone’s nostalgic ideal of an
              Indian woman. I dress as the primary author of my own room.”
            </blockquote>
            <div className="pt-8 mt-8 border-t border-border-line flex items-center gap-4">
              <img
                alt=""
                className="w-12 h-12 object-cover border border-on-surface shrink-0"
                width={48}
                height={48}
                loading="lazy"
                src={RHEA}
              />
              <div>
                <span className="text-[14px] font-bold uppercase tracking-tight block">
                  Dr. Rhea Verma
                </span>
                <span className="text-[12px] text-body-slate">
                  Chief Neurological Researcher &amp; Author
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="w-full bg-surface border-b border-border-line">
        <div className="max-w-site mx-auto site-pad section-y">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5">
              <div className="media-frame aspect-[4/5] border border-border-line bg-surface-ivory">
                <img
                  src="/owner-profile.png"
                  alt="Gurwinder Singh — Founder & CEO, SVastra"
                  className="object-cover object-top"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="w-20 h-20 bg-surface-dark text-surface flex items-center justify-center text-2xl font-bold uppercase tracking-tight">
                    G
                  </span>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-surface-dark/90 text-surface p-4 border-t border-surface/15">
                  <span className="text-[14px] font-bold uppercase tracking-tight block">
                    Gurwinder Singh
                  </span>
                  <span className="text-[11px] text-surface/70 uppercase tracking-wider">
                    Founder &amp; CEO
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5">
              <span className="label-caps text-primary block">Leadership</span>
              <h2 className="display-section text-on-surface">
                &ldquo;We win when she authors her own room.&rdquo;
              </h2>
              <p className="text-[15px] sm:text-base leading-relaxed text-body-slate border-l-2 border-primary pl-5">
                At SVastra, satisfaction is not a metric dashboard — it is whether a woman feels
                more herself in the garment than before she put it on. Every partnership, weave, and
                cut answers that question.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'Direct loom & atelier sourcing',
                  'Zero compromise on fiber',
                  'Customer-first returns',
                  'Concierge before checkout',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2 text-[13px] text-on-surface font-medium">
                    <span className="text-primary mt-0.5" aria-hidden="true">
                      ✓
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-surface-dark text-surface border-b border-border-line">
        <div className="max-w-site mx-auto site-pad section-y text-center">
          <span className="label-caps text-accent-ochre block mb-4">Begin the Edit</span>
          <h2 className="display-section text-surface max-w-3xl mx-auto">
            Experience the SVastra difference.
          </h2>
          <p className="text-[15px] text-surface/70 mt-4 max-w-xl mx-auto leading-relaxed">
            Architectural handlooms. Independent cuts. A wardrobe built for one woman, many roles,
            many moods.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link href="/products" className="sv-btn-primary w-full sm:w-auto">
              Browse the Archive
            </Link>
            <Link
              href="/contact-us"
              className="inline-flex items-center justify-center min-h-[48px] px-8 text-[11px] font-semibold tracking-[0.12em] uppercase border border-surface/40 text-surface hover:bg-surface hover:text-on-surface transition-colors w-full sm:w-auto"
            >
              Speak to Concierge
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
