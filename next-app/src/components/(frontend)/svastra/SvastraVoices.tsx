import Link from "next/link";

const RHEA =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDWzk91P7wT9g7xbJTg-xt0a7rdUfd8EhBqFa_5d9qeUXKwQBHqlFbLSGzRIJ1eXVkmpyRs7yrLi3U41wFaykMzQMp0lzkzuxaoquynssqV3tuuRIKSuvok-3Fe0oLbXbvtuDQXLBdb6rTvZ4UKwNrMz4pTdEOajPsOZ5y5rw46mpQbdrOcp_v9OdTBuBqQW84HQta81KWKE0ls0et8Yo_RDGEvWUZvskHT_OI02Hrb3GOl15RMMGoN";
const MAYA =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB-Je9M0u_55q0wHrmqWEMsBDbXWPlohDaHcOthm2xdUaMDIDFH1SibWapnFx7cC3cOaYGG8jJdj8GO3kJVswgXEOHWAGh8wOPlKMXGlQNKnUn0LwfJLNpVb5HBbs7W8s9nSDYkBgd5uoy99Eh0xTcsJwIPPA63NlksemhlWtsqIf2s6SaMloO3CAAw1R4q7ftWeeEE_dobeQtFETk7wjZmHEoD6XOY8luMSxN2tq62o5Mo3DVCyCuo";

export default function SvastraVoices() {
  return (
    <section id="voices" className="w-full bg-surface border-b border-border-line scroll-mt-24" aria-labelledby="voices-title">
      <div className="max-w-site mx-auto site-pad section-y">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-on-surface/15 pb-6 sm:pb-8 mb-8 sm:mb-12 gap-4">
          <div>
            <span className="label-caps text-primary block mb-2">Cultural Voices</span>
            <h2 id="voices-title" className="display-section text-on-surface">
              Women of SVastra
            </h2>
            <p className="text-[15px] sm:text-base text-body-slate mt-2">
              Portraits of sovereign thinkers, creators, and leaders who author their own spaces.
            </p>
          </div>
          <Link href="/about-us" className="label-caps text-on-surface hover:text-primary transition-colors flex items-center gap-2 shrink-0">
            <span>Read All Atelier Conversations</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-stretch">
          <div className="lg:col-span-7 bg-surface-subtle p-6 sm:p-8 lg:p-12 border border-border-line flex flex-col justify-between gap-8">
            <div className="space-y-5 sm:space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-line pb-4 text-[11px] font-semibold tracking-[0.08em] uppercase text-body-slate">
                <span>Essay № 18 · Urban Neurology</span>
                <span>Mumbai</span>
              </div>
              <blockquote className="text-lg sm:text-2xl lg:text-[26px] leading-[1.35] font-semibold tracking-tight m-0">
                “I don’t dress to fit into an expectation or validate someone’s nostalgic ideal of an Indian woman. I dress as the primary author of my own room.”
              </blockquote>
            </div>
            <div className="pt-6 border-t border-border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <img alt="" className="w-12 h-12 object-cover border border-on-surface shrink-0" width={48} height={48} loading="lazy" src={RHEA} />
                <div className="min-w-0">
                  <span className="text-[14px] font-bold uppercase tracking-tight block">Dr. Rhea Verma</span>
                  <span className="text-[12px] text-body-slate">Chief Neurological Researcher &amp; Author</span>
                </div>
              </div>
              <Link href="/about-us" className="text-[11px] font-semibold tracking-[0.1em] uppercase text-primary hover:text-on-surface transition-colors flex items-center gap-1 shrink-0">
                <span>Read Essay</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-surface-ivory p-6 sm:p-8 border border-border-line flex flex-col justify-between">
            <div>
              <div className="media-frame aspect-[16/10] mb-5 sm:mb-6 border border-border-line bg-surface-dark">
                <img alt="Maya Sen" className="object-cover" loading="lazy" width={800} height={500} src={MAYA} />
                <div className="absolute bottom-2 left-2 bg-surface-dark text-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-widest">
                  Berlin / Kolkata
                </div>
              </div>
              <span className="text-[14px] font-bold uppercase tracking-tight block">Maya Sen</span>
              <p className="text-[14px] leading-relaxed text-body-slate mt-2">
                &quot;The weight of authentic tussar silk is like gravity. It anchors your thoughts when you are pitching to eighty people in Berlin.&quot;
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-on-surface/10">
              <Link href="/products" className="text-[11px] font-semibold tracking-[0.1em] uppercase text-on-surface hover:text-primary transition-colors flex items-center justify-between">
                <span>Explore Maya&apos;s Wardrobe</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
