"use client";

import { useState } from "react";
import Link from "next/link";

const MOODS: Record<
  string,
  {
    num: string;
    label: string;
    tag: string;
    title: string;
    desc: string;
    points: string[];
    btn: string;
    query: string;
    img1Title: string;
    img2Title: string;
  }
> = {
  power: {
    num: "01",
    label: "Power",
    tag: "Frequency: Power & Presence",
    title: "The Unapologetic Stance",
    desc: "Structured shoulder articulation, deep Indian Red contrast drapes, and high-twist tussar silken weight. Tailored for days when the room must align with your voice before you speak.",
    points: [
      "Weighted architectural pallu with engineered stay-put friction",
      "Zero needle-drop pure raw silk handloom base",
      "Engineered concealed side seam utility pockets",
    ],
    btn: "Shop Power Capsule",
    query: "silk",
    img1Title: "Crimson Raw Silk Overcoat & Noir Slip",
    img2Title: "Architectural Pallu & Structured Collar",
  },
  minimal: {
    num: "02",
    label: "Minimal",
    tag: "Frequency: Monochromatic Purity",
    title: "Uncluttered Intellect",
    desc: "Pristine raw ivory and unbleached cotton-silk blends with razor hairlines. A visual breath of fresh air that strips away excess to reveal supreme quiet confidence.",
    points: [
      "Undyed kora cotton spun on Amber Charkha",
      "Concealed placket tunic shirts with seamless drapes",
      "Zero zari, 100% natural selvage borders",
    ],
    btn: "Shop Minimal Capsule",
    query: "linen",
    img1Title: "Kora Ivory Pure Muslin Tunic",
    img2Title: "Natural Selvage Tailored Saree",
  },
  festive: {
    num: "03",
    label: "Festive",
    tag: "Frequency: Ceremonial Modernism",
    title: "Contemporary Celebration",
    desc: "Celebratory handcraft completely divorced from cliché. Deep jewel tones, burnished antique copper zari lines, and drapes designed to dance without pins.",
    points: [
      "Authentic real metal antique silver and copper zari",
      "Dual-tone shot silk woven in Maheshwar looms",
      "Architectural blouse patterns with sharp geometrics",
    ],
    btn: "Shop Festive Capsule",
    query: "banarasi",
    img1Title: "Burnished Copper Shot Silk Drape",
    img2Title: "Geometric Zari Cape Set",
  },
  brunch: {
    num: "04",
    label: "Brunch",
    tag: "Frequency: Daylight Ease",
    title: "Effortless Horizons",
    desc: "Crisp warm ivory, ochre sun pigments, and featherlight organic Chanderi weaves that breathe with ambient afternoon breezes.",
    points: [
      "Lightweight 200-count organic muslin and silk",
      "Modular silhouettes that untie and flow freely",
      "Sun-bleached natural madder and haldi tints",
    ],
    btn: "Shop Brunch Capsule",
    query: "chanderi",
    img1Title: "Ochre Handloom Overlay",
    img2Title: "Chanderi Linen Modular Co-ord",
  },
  travel: {
    num: "05",
    label: "Travel",
    tag: "Frequency: Transcontinental Fluidity",
    title: "Transit & Horizons",
    desc: "Crease-resistant hand-twisted wild tussar silk engineered for long-haul travel and immediate podium appearances upon arrival.",
    points: [
      "Resilient wild tussar fiber with natural spring",
      "Integrated passport & notebook concealed pockets",
      "Transitions effortlessly across climatic variations",
    ],
    btn: "Shop Travel Capsule",
    query: "tussar",
    img1Title: "Travel-Grade Raw Tussar Kimono Suit",
    img2Title: "Packable Reversible Silk Wrap",
  },
  celebration: {
    num: "06",
    label: "Celebration",
    tag: "Frequency: Midnight Soiree",
    title: "The Noir Monologue",
    desc: "Deep indigo-black dyes, liquid draping georgette, and stark sculptural lines that capture low ambient candlelight and gallery spot lamps.",
    points: [
      "Natural fermented indigo dip-dyed multiple times",
      "Bias-cut skirts with modular handloom pallus",
      "High-contrast silhouette definition",
    ],
    btn: "Shop Celebration Capsule",
    query: "georgette",
    img1Title: "Midnight Indigo Silk Column Gown",
    img2Title: "Noir Georgette Architectural Saree",
  },
};

const TAB_KEYS = ["power", "minimal", "festive", "brunch", "travel", "celebration"] as const;

const IMG1 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDiLQ3a2MgZr9KnPaqozyDYR-9CJ3w3kP1wGnjIfJIsxFhNZKaiWnBPPb3nJkEI8-3Q-3Drgzj4CeU7XFJ8ui7nprDbAsEDMDbT6XloESGXv64_MZ9K6eJ4azr3FVBOBgYQn66Y6LVQYziH6hicfZLcIyeZR_jO6zarCYG9Bbyj-PaRF717-9umXvZIP0YMOw3lsSlrCvX3ig5XqfzmEnPKKgqjSeJkQ7uaG23C4J4PnD9-F0oFNRSb";
const IMG2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCaUoAocyNjIioz-caVKI3RsZL7yjvzimzb5uImOHUcxvQ6lV7gOr1ZzY5mKuupieKEbZwxFYFEQJKVhqVwan9jBqAZOFd1ZNJntmaaGjnVwMznS63kG4C1CKoTumFEc7QFUHB4WNJuxRZ-WnyiRNujTWoXYoLlQ1-E1SOSzLNbG4YI_LcEF8PO_HYOrJVwnREC0YsNzVgDL1A1LqK8S3GIBhjKxwXUz6VV5lzqZjpx3Iltzg5W1gv7";

export default function SvastraHowYouFeel() {
  const [active, setActive] = useState<(typeof TAB_KEYS)[number]>("power");
  const data = MOODS[active];

  return (
    <section
      id="shop-feel"
      className="w-full bg-surface border-b border-border-line scroll-mt-24"
      aria-labelledby="feel-title"
    >
      <div className="max-w-site mx-auto site-pad section-y">
        <div className="max-w-3xl mb-10 sm:mb-12">
          <div className="flex items-center gap-2 mb-3 label-caps text-primary">
            <span>Chapter 02</span>
            <span className="text-on-surface/30" aria-hidden="true">
              /
            </span>
            <span className="text-body-slate">Affective Frequencies</span>
          </div>
          <h2 id="feel-title" className="display-section text-on-surface uppercase">
            Shop How You Feel
          </h2>
          <p className="text-[15px] sm:text-[17px] leading-[1.6] text-body-slate mt-3">
            Curations driven by inner frequency, not calendar seasons or conventional market categories.
            Select the state of being you wish to embody.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8" role="tablist">
          {TAB_KEYS.map((key) => {
            const mood = MOODS[key];
            const isActive = active === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(key)}
                className={`text-left p-4 border transition-all ${
                  isActive
                    ? "bg-surface-dark text-surface border-surface-dark"
                    : "bg-surface-ivory text-on-surface border-border-line hover:bg-surface-dark hover:text-surface hover:border-surface-dark"
                }`}
              >
                <span className="text-[10px] tracking-widest block opacity-70 mb-1">
                  {mood.num} // Frequency
                </span>
                <span className="text-[12px] font-bold tracking-[0.12em] uppercase">{mood.label}</span>
              </button>
            );
          })}
        </div>

        <div className="border border-on-surface bg-surface-subtle p-6 sm:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-block px-3 py-1 bg-primary text-surface text-[11px] font-semibold tracking-[0.14em] uppercase">
                {data.tag}
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight text-on-surface">
                {data.title}
              </h3>
              <p className="text-base sm:text-[17px] leading-[1.6] text-body-slate">{data.desc}</p>
              <div className="space-y-3 pt-2 text-[14px] text-on-surface font-medium">
                {data.points.map((p) => (
                  <div key={p} className="flex items-start gap-3">
                    <span className="text-primary mt-0.5 shrink-0" aria-hidden="true">
                      ✓
                    </span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
              <Link
                href={`/products?search=${encodeURIComponent(data.query)}`}
                className="sv-btn-primary inline-flex mt-2"
              >
                {data.btn}
              </Link>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
              <figure className="space-y-2">
                <div className="aspect-[3/4] overflow-hidden border border-border-line bg-surface-ivory">
                  <img
                    src={IMG1}
                    alt={data.img1Title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <figcaption className="text-[11px] font-semibold tracking-[0.06em] uppercase text-body-slate">
                  {data.img1Title}
                </figcaption>
              </figure>
              <figure className="space-y-2 mt-6 sm:mt-10">
                <div className="aspect-[3/4] overflow-hidden border border-border-line bg-surface-ivory">
                  <img
                    src={IMG2}
                    alt={data.img2Title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <figcaption className="text-[11px] font-semibold tracking-[0.06em] uppercase text-body-slate">
                  {data.img2Title}
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
