"use client";

import { useState } from "react";
import Link from "next/link";

const MOODS: Record<
  string,
  { tag: string; title: string; desc: string; bullets: string[]; btn: string; cap1: string; cap2: string }
> = {
  power: {
    tag: "Frequency: Power & Presence",
    title: "The Unapologetic Stance",
    desc: "Structured shoulder articulation, deep Indian Red contrast drapes, and high-twist tussar silken weight. Tailored for days when the room must align with your voice before you speak.",
    bullets: [
      "Weighted architectural pallu with engineered stay-put friction",
      "Zero needle-drop pure raw silk handloom base",
      "Engineered concealed side seam utility pockets",
    ],
    btn: "Shop Power Capsule",
    cap1: "Crimson Raw Silk Overcoat & Noir Slip",
    cap2: "Architectural Pallu & Structured Collar",
  },
  minimal: {
    tag: "Frequency: Monochromatic Purity",
    title: "Uncluttered Intellect",
    desc: "Pristine raw ivory and unbleached cotton-silk blends with razor hairlines. A visual breath of fresh air that strips away excess to reveal supreme quiet confidence.",
    bullets: [
      "Undyed kora cotton spun on Amber Charkha",
      "Concealed placket tunic shirts with seamless drapes",
      "Zero zari, 100% natural selvage borders",
    ],
    btn: "Shop Minimal Capsule",
    cap1: "Kora Ivory Pure Muslin Tunic",
    cap2: "Natural Selvage Tailored Saree",
  },
  festive: {
    tag: "Frequency: Ceremonial Modernism",
    title: "Contemporary Celebration",
    desc: "Celebratory handcraft completely divorced from cliché. Deep jewel tones, burnished antique copper zari lines, and drapes designed to dance without pins.",
    bullets: [
      "Authentic real metal antique silver and copper zari",
      "Dual-tone shot silk woven in Maheshwar looms",
      "Architectural blouse patterns with sharp geometrics",
    ],
    btn: "Shop Festive Capsule",
    cap1: "Burnished Copper Shot Silk Drape",
    cap2: "Geometric Zari Cape Set",
  },
  brunch: {
    tag: "Frequency: Daylight Ease",
    title: "Effortless Horizons",
    desc: "Crisp warm ivory, ochre sun pigments, and featherlight organic Chanderi weaves that breathe with ambient afternoon breezes.",
    bullets: [
      "Lightweight 200-count organic muslin and silk",
      "Modular silhouettes that untie and flow freely",
      "Sun-bleached natural madder and haldi tints",
    ],
    btn: "Shop Brunch Capsule",
    cap1: "Ochre Handloom Overlay",
    cap2: "Chanderi Linen Modular Co-ord",
  },
  travel: {
    tag: "Frequency: Transcontinental Fluidity",
    title: "Transit & Horizons",
    desc: "Crease-resistant hand-twisted wild tussar silk engineered for long-haul transcontinental travel and immediate podium appearances upon arrival.",
    bullets: [
      "Resilient wild tussar fiber with natural spring",
      "Integrated passport & notebook concealed pockets",
      "Transitions effortlessly across climatic variations",
    ],
    btn: "Shop Travel Capsule",
    cap1: "Travel-Grade Raw Tussar Kimono Suit",
    cap2: "Packable Reversible Silk Wrap",
  },
  celebration: {
    tag: "Frequency: Midnight Soiree",
    title: "The Noir Monologue",
    desc: "Deep indigo-black dyes, liquid draping georgette, and stark sculptural lines that capture low ambient candlelight and gallery spot lamps.",
    bullets: [
      "Natural fermented indigo dip-dyed multiple times",
      "Bias-cut skirts with modular handloom pallus",
      "High-contrast silhouette definition",
    ],
    btn: "Shop Celebration Capsule",
    cap1: "Midnight Indigo Silk Column Gown",
    cap2: "Noir Georgette Architectural Saree",
  },
};

const TAB_KEYS = [
  { key: "power", label: "Power", n: "01" },
  { key: "minimal", label: "Minimal", n: "02" },
  { key: "festive", label: "Festive", n: "03" },
  { key: "brunch", label: "Brunch", n: "04" },
  { key: "travel", label: "Travel", n: "05" },
  { key: "celebration", label: "Celebration", n: "06" },
] as const;

const IMG1 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDiLQ3a2MgZr9KnPaqozyDYR-9CJ3w3kP1wGnjIfJIsxFhNZKaiWnBPPb3nJkEI8-3Q-3Drgzj4CeU7XFJ8ui7nprDbAsEDMDbT6XloESGXv64_MZ9K6eJ4azr3FVBOBgYQn66Y6LVQYziH6hicfZLcIyeZR_jO6zarCYG9Bbyj-PaRF717-9umXvZIP0YMOw3lsSlrCvX3ig5XqfzmEnPKKgqjSeJkQ7uaG23C4J4PnD9-F0oFNRSb";
const IMG2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCaUoAocyNjIioz-caVKI3RsZL7yjvzimzb5uImOHUcxvQ6lV7gOr1ZzY5mKuupieKEbZwxFYFEQJKVhqVwan9jBqAZOFd1ZNJntmaaGjnVwMznS63kG4C1CKoTumFEc7QFUHB4WNJuxRZ-WnyiRNujTWoXYoLlQ1-E1SOSzLNbG4YI_LcEF8PO_HYOrJVwnREC0YsNzVgDL1A1LqK8S3GIBhjKxwXUz6VV5lzqZjpx3Iltzg5W1gv7";

export default function SvastraHowYouFeel() {
  const [active, setActive] = useState<keyof typeof MOODS>("power");
  const data = MOODS[active];

  return (
    <section id="shop-feel" className="w-full bg-surface border-b border-border-line scroll-mt-24" aria-labelledby="feel-title">
      <div className="max-w-site mx-auto site-pad section-y">
        <div className="max-w-3xl mb-8 sm:mb-12">
          <div className="flex items-center gap-2 mb-3 label-caps text-primary">
            <span>Chapter 02</span>
            <span className="text-on-surface/30" aria-hidden="true">
              /
            </span>
            <span className="text-body-slate">Affective Frequencies</span>
          </div>
          <h2 id="feel-title" className="display-section text-on-surface">
            Shop How You Feel
          </h2>
          <p className="text-[15px] sm:text-[17px] leading-[1.6] text-body-slate mt-3">
            Curations driven by inner frequency, not calendar seasons or conventional market categories. Select the state of being you wish to embody.
          </p>
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6 sm:mb-8 overflow-x-auto"
          role="tablist"
          aria-label="Mood frequencies"
        >
          {TAB_KEYS.map((tab) => {
            const selected = active === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(tab.key)}
                className={`text-left p-3.5 sm:p-4 border min-h-[4.25rem] transition-colors ${
                  selected
                    ? "bg-surface-dark text-surface border-surface-dark"
                    : "bg-surface-ivory text-on-surface border-border-line hover:bg-surface-dark hover:text-surface hover:border-surface-dark"
                }`}
              >
                <span className="text-[10px] tracking-widest block opacity-70 mb-1">{tab.n} // Frequency</span>
                <span className="text-[12px] font-bold tracking-[0.08em] uppercase">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="border border-on-surface bg-surface-subtle p-5 sm:p-8 lg:p-14" role="tabpanel">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            <div className="lg:col-span-6 space-y-5 sm:space-y-6">
              <div className="inline-block px-3 py-1.5 bg-primary text-surface label-caps">{data.tag}</div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight">{data.title}</h3>
              <p className="text-[15px] sm:text-[17px] leading-[1.6] text-body-slate">{data.desc}</p>
              <ul className="space-y-3 pt-1 text-[14px] text-on-surface font-medium list-none p-0 m-0">
                {data.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="text-primary mt-0.5 shrink-0" aria-hidden="true">
                      ✓
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2">
                <Link href={`/products?q=${encodeURIComponent(active)}`} className="sv-btn-primary w-full sm:w-auto">
                  <span>{data.btn}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="media-frame aspect-[3/4] bg-surface-dark border border-border-line">
                <img alt={data.cap1} className="object-cover" loading="lazy" src={IMG1} width={500} height={667} />
                <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 bg-surface-dark/85 text-surface text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider leading-snug">
                  {data.cap1}
                </div>
              </div>
              <div className="media-frame aspect-[3/4] bg-surface-dark border border-border-line">
                <img alt={data.cap2} className="object-cover" loading="lazy" src={IMG2} width={500} height={667} />
                <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 bg-surface-dark/85 text-surface text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider leading-snug">
                  {data.cap2}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
