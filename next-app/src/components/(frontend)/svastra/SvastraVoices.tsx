import Link from "next/link";
import { ArrowRight } from "lucide-react";

const RHEA_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDWzk91P7wT9g7xbJTg-xt0a7rdUfd8EhBqFa_5d9qeUXKwQBHqlFbLSGzRIJ1eXVkmpyRs7yrLi3U41wFaykMzQMp0lzkzuxaoquynssqV3tuuRIKSuvok-3Fe0oLbXbvtuDQXLBdb6rTvZ4UKwNrMz4pTdEOajPsOZ5y5rw46mpQbdrOcp_v9OdTBuBqQW84HQta81KWKE0ls0et8Yo_RDGEvWUZvskHT_OI02Hrb3GOl15RMMGoN";

const MAYA_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB-Je9M0u_55q0wHrmqWEMsBDbXWPlohDaHcOthm2xdUaMDIDFH1SibWapnFx7cC3cOaYGG8jJdj8GO3kJVswgXEOHWAGh8wOPlKMXGlQNKnUn0LwfJLNpVb5HBbs7W8s9nSDYkBgd5uoy99Eh0xTcsJwIPPA63NlksemhlWtsqIf2s6SaMloO3CAAw1R4q7ftWeeEE_dobeQtFETk7wjZmHEoD6XOY8luMSxN2tq62o5Mo3DVCyCuo";

export default function SvastraVoices() {
  return (
    <section
      id="voices"
      className="w-full bg-surface border-b border-border-line scroll-mt-24"
      aria-labelledby="voices-title"
    >
      <div className="max-w-site mx-auto site-pad section-y">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-on-surface/15 pb-6 sm:pb-8 mb-8 sm:mb-12 gap-4">
          <div>
            <span className="label-caps text-primary block mb-2">Cultural Voices</span>
            <h2 id="voices-title" className="display-section text-on-surface uppercase">
              Women of SVastra
            </h2>
            <p className="text-[15px] sm:text-base text-body-slate mt-2 max-w-xl">
              Portraits of sovereign thinkers, creators, and leaders who author their own spaces.
            </p>
          </div>
          <Link
            href="/about-us#voices"
            className="label-caps text-on-surface hover:text-primary transition-colors flex items-center gap-2 shrink-0 self-start md:self-end"
          >
            <span className="hidden sm:inline">Read All Atelier Conversations</span>
            <span className="sm:hidden">Read More</span>
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          <article className="lg:col-span-7 bg-surface-subtle border border-border-line p-6 sm:p-8 lg:p-12 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-line pb-4 label-caps text-body-slate">
                <span>Essay No. 18 · Urban Neurology</span>
                <span>Mumbai</span>
              </div>
              <blockquote className="text-xl sm:text-2xl lg:text-[26px] leading-[1.35] font-semibold text-on-surface tracking-tight">
                &ldquo;I don&apos;t dress to fit into an expectation or validate someone&apos;s nostalgic
                ideal of an Indian woman. I dress as the primary author of my own room.&rdquo;
              </blockquote>
            </div>

            <div className="pt-8 mt-6 border-t border-border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={RHEA_IMG}
                  alt="Dr. Rhea Verma"
                  className="w-12 h-12 object-cover border border-on-surface shrink-0"
                  width={48}
                  height={48}
                  loading="lazy"
                />
                <div className="min-w-0">
                  <span className="text-[14px] font-bold uppercase tracking-tight text-on-surface block">
                    Dr. Rhea Verma
                  </span>
                  <span className="text-[12px] text-body-slate block">
                    Chief Neurological Researcher &amp; Author
                  </span>
                </div>
              </div>
              <Link
                href="/about-us"
                className="label-caps text-primary hover:text-on-surface transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>Read Essay</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </article>

          <article className="lg:col-span-5 bg-surface-ivory border border-border-line p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="relative aspect-[16/10] overflow-hidden bg-surface-dark mb-6 border border-border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={MAYA_IMG}
                  alt="Maya Sen"
                  className="w-full h-full object-cover"
                  width={640}
                  height={400}
                  loading="lazy"
                />
                <div className="absolute bottom-2 left-2 bg-surface-dark text-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-widest">
                  Berlin / Kolkata
                </div>
              </div>
              <span className="text-[14px] font-bold uppercase tracking-tight text-on-surface block">
                Maya Sen
              </span>
              <p className="text-[14px] leading-relaxed text-body-slate mt-2">
                &ldquo;The weight of authentic tussar silk is like gravity. It anchors your thoughts
                when you are pitching to eighty people in Berlin.&rdquo;
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-border-line">
              <Link
                href="/products"
                className="label-caps text-on-surface hover:text-primary transition-colors flex items-center justify-between gap-2"
              >
                <span>Explore Maya&apos;s Wardrobe</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
