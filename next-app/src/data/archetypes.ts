export type ArchetypeSlug =
  | "the-leader"
  | "the-mentor"
  | "the-creator"
  | "the-home-manager";

export type ArchetypeConfig = {
  slug: ArchetypeSlug;
  chapter: string;
  roleNo: string;
  name: string;
  /** Exact / preferred category name in admin catalog */
  categoryNames: string[];
  tag: string;
  tagline: string;
  quote: string;
  quoteAttr: string;
  blurb: string;
  storyEyebrow: string;
  storyTitle: string;
  storyBody: string;
  storyCards: { title: string; body: string }[];
  specs: { label: string; value: string; note: string }[];
  /** Optional fallback only — live pages prefer category/product images from API */
  heroImg?: string;
  heroBadge: string;
  heroCaptionTitle: string;
  heroCaptionBody: string;
  moodTitle: string;
  moods: { label: string; href: string; desc: string }[];
  interludeTitle: string;
  interludeBody: string;
  accent?: "leader" | "mentor" | "creator" | "home";
};

export const ARCHETYPES: ArchetypeConfig[] = [
  {
    slug: "the-leader",
    chapter: "CHAPTER 01",
    roleNo: "01",
    name: "The Leader",
    categoryNames: [
      "The Leader",
      "Leader",
      "Silk Sarees",
      "Banarasi Sarees",
      "Kanjivaram Sarees",
      "Paithani Sarees",
      "Tussar & Raw Silk Sarees",
    ],
    tag: "Presence & Strategy",
    tagline: "Confident. Composed. Decisive.",
    quote: "She doesn’t ask the room for permission to belong.",
    quoteAttr: "— SVastra Archetype Manifesto",
    blurb:
      "Structured drapes, crisp-collared silk overlays, and weighted hems engineered for presence without concession.",
    storyEyebrow: "Atelier Essay",
    storyTitle: "Presence Over Noise",
    storyBody:
      "Leadership in her world is not costume. It is posture, fabric weight, and the refusal of ornamental distraction. Every seam is a decision. Every drape holds the room without raising its voice.",
    storyCards: [
      {
        title: "The Razor Pallu",
        body: "Engineered overlay that holds without pins — clean architecture for rooms that demand certainty.",
      },
      {
        title: "Weighted Authority",
        body: "Heavy raw silks that settle into a monolithic line. Presence through density, not decoration.",
      },
    ],
    specs: [
      { label: "Fabric Discipline", value: "380 GSM", note: "Heavy Raw Habotai" },
      { label: "Weave Origin", value: "Tussar", note: "Hand-Spun Bhagalpur" },
      { label: "Ornamentation", value: "0.0%", note: "Zero Decorative Filigree" },
    ],
    heroBadge: "Role No. 01 / Sovereign",
    heroCaptionTitle: "Signature Drape",
    heroCaptionBody: "The Razor Pallu Overlay — engineered without safety pins or drape constraints.",
    moodTitle: "How The Leader Feels",
    moods: [
      { label: "Power", href: "/products?search=silk", desc: "Command without costume" },
      { label: "Minimal", href: "/products?search=linen", desc: "Quiet structural clarity" },
      { label: "Celebration", href: "/products?search=georgette", desc: "Presence for the occasion" },
    ],
    interludeTitle: "Leadership Looks Different On Everyone.",
    interludeBody:
      "The same silhouette, rewritten by the woman who wears it. Authority is not a size — it is a stance.",
    accent: "leader",
  },
  {
    slug: "the-mentor",
    chapter: "CHAPTER 02",
    roleNo: "02",
    name: "The Mentor",
    categoryNames: [
      "The Mentor",
      "Mentor",
      "Regional & Handloom Sarees",
      "Chanderi Sarees",
      "Maheshwari Sarees",
      "Bhagalpuri Sarees",
    ],
    tag: "Depth & Equanimity",
    tagline: "Warm. Intelligent. Grounded.",
    quote: "She doesn’t need the spotlight to leave an impact.",
    quoteAttr: "— SVastra Archetype Manifesto",
    blurb:
      "Earth-pigment handlooms, understated linen-silk blends, and modular capes designed for prolonged intellectual ease.",
    storyEyebrow: "Prose & Posture",
    storyTitle: "Wisdom Has Its Own Presence",
    storyBody:
      "She listens before she speaks. Influence is never loud — but it stays. Her drape anchors the room the way her counsel anchors people.",
    storyCards: [
      {
        title: "The Grounded Drape",
        body: "Heavy organic wild silks that settle with natural posture — uninterrupted silhouette, silent respect.",
      },
      {
        title: "The Generous Collar",
        body: "Open architecture at the neckline for ease, breath, and long conversations that matter.",
      },
    ],
    specs: [
      { label: "Density", value: "320 GSM", note: "Raw Tussar" },
      { label: "Provenance", value: "Chanderi", note: "& Kutch" },
      { label: "Construction", value: "Zero", note: "Ornamental Filigree" },
    ],
    heroBadge: "Portrait No. 02",
    heroCaptionTitle: "100% Handloom",
    heroCaptionBody: "Unbleached wild silk with structured pleat.",
    moodTitle: "How The Mentor Feels",
    moods: [
      { label: "Minimal", href: "/products?search=linen", desc: "Quiet clarity" },
      { label: "Power", href: "/products?search=silk", desc: "Soft authority" },
      { label: "Brunch", href: "/products?search=chanderi", desc: "Easy intellect" },
    ],
    interludeTitle: "Influence Is Not Volume.",
    interludeBody: "The mentor edits the room by being still. Fabric follows.",
    accent: "mentor",
  },
  {
    slug: "the-creator",
    chapter: "CHAPTER 03",
    roleNo: "03",
    name: "The Creator",
    categoryNames: [
      "The Creator",
      "Creator",
      "Occasion & Designer Sarees",
      "Kalamkari Handblock Sarees",
      "Bandhani & Bandhej Sarees",
      "Organza Sarees",
      "Georgette Party Sarees",
    ],
    tag: "Fluidity & Visceral Poise",
    tagline: "Original. Expressive. Independent.",
    quote: "She was never interested in looking like everyone else.",
    quoteAttr: "— SVastra Archetype Manifesto",
    blurb:
      "Asymmetric geometry, deep indigo and turmeric hand-dyes, fluid pleating that breaks the traditional mold.",
    storyEyebrow: "Philosophy & Anatomy",
    storyTitle: "Make It Yours",
    storyBody:
      "She notices what others overlook. Questions what already exists. Changes the rules when they no longer fit. Her point of view is part of what she wears.",
    storyCards: [
      {
        title: "The Kinetic Pleat",
        body: "Accordion micro-folds that compress in stillness and expand in motion — scored in heavy Mulberry silk.",
      },
      {
        title: "The Asymmetric Lapel",
        body: "Sculptural necklines without symmetry — Angrakha-inspired diagonals and sovereign volume.",
      },
    ],
    specs: [
      { label: "Density", value: "360 GSM", note: "Kinetic Twist Silk" },
      { label: "Weave Origin", value: "Bengal", note: "& Bagru" },
      { label: "Architecture", value: "Asymmetric", note: "Drape System" },
    ],
    heroBadge: "Studio Series 03",
    heroCaptionTitle: "Kinetic Texture & Conviction",
    heroCaptionBody: "Calcutta & Bagru Handcraft Collaborative Edit",
    moodTitle: "How The Creator Feels",
    moods: [
      { label: "Minimal", href: "/products?search=linen", desc: "Clean rebellion" },
      { label: "Brunch", href: "/products?search=chanderi", desc: "Daylight expression" },
      { label: "Power", href: "/products?search=silk", desc: "Conviction in motion" },
    ],
    interludeTitle: "Form Follows Conviction.",
    interludeBody: "Geometry without apology. Colour without permission.",
    accent: "creator",
  },
  {
    slug: "the-home-manager",
    chapter: "CHAPTER 04",
    roleNo: "04",
    name: "The Home Manager",
    categoryNames: [
      "The Home Manager",
      "Home Manager",
      "Linen Handloom Sarees",
      "Sambalpuri Ikat Sarees",
      "Kasavu Kerala Sarees",
      "Chikankari Sarees",
    ],
    tag: "Tactile Sanctuary",
    tagline: "Soft. Sovereign. At Ease.",
    quote: "She builds the room before she enters it.",
    quoteAttr: "— SVastra Archetype Manifesto",
    blurb:
      "Tactile sanctuary, breathable organic handlooms, zero-pinch waistbands that transition quietly from private quiet to hosting guests.",
    storyEyebrow: "Domestic Architecture",
    storyTitle: "Sanctuary Is A Craft",
    storyBody:
      "Her power is quiet logistics — beauty that works hard. Soft handlooms that move from courtyard to dinner without costume change.",
    storyCards: [
      {
        title: "The Soft Structure",
        body: "Breathable organics with invisible support — ease without collapse.",
      },
      {
        title: "The Hosting Drape",
        body: "Pieces that survive a full day of care, guests, and residual elegance.",
      },
    ],
    specs: [
      { label: "Handfeel", value: "Soft", note: "Organic Handloom" },
      { label: "Transition", value: "Day→Eve", note: "Zero Pinch" },
      { label: "Ornament", value: "Quiet", note: "Tactile Only" },
    ],
    heroBadge: "Role No. 04 / Sanctuary",
    heroCaptionTitle: "Tactile Sanctuary",
    heroCaptionBody: "Breathable organics for private quiet and generous hosting.",
    moodTitle: "How The Home Manager Feels",
    moods: [
      { label: "Brunch", href: "/products?search=chanderi", desc: "Morning ease" },
      { label: "Travel", href: "/products?search=tussar", desc: "Packed calm" },
      { label: "Festive", href: "/products?search=banarasi", desc: "Host-ready glow" },
    ],
    interludeTitle: "Care Is Also Power.",
    interludeBody: "The home she builds is the first architecture she wears.",
    accent: "home",
  },
];

export function getArchetype(slug: string): ArchetypeConfig | undefined {
  return ARCHETYPES.find((a) => a.slug === slug);
}

export function otherArchetypes(slug: string): ArchetypeConfig[] {
  return ARCHETYPES.filter((a) => a.slug !== slug).slice(0, 3);
}
