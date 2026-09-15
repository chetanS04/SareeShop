"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchProductsList, productImageUrl } from "@/utils/archetypeCatalog";

type Props = {
  imageUrl?: string | null;
};

const FALLBACK = "/svastra/logo-mark.png";

export default function SvastraManifesto({ imageUrl }: Props) {
  const [img, setImg] = useState<string | null>(imageUrl ?? null);

  useEffect(() => {
    if (imageUrl) {
      setImg(imageUrl);
      return;
    }
    let cancelled = false;
    (async () => {
      const products = await fetchProductsList({ per_page: 6, page: 1 });
      if (cancelled) return;
      const pick = products[1] || products[0];
      setImg(productImageUrl(pick) || FALLBACK);
    })();
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  return (
    <section
      id="manifesto"
      className="w-full bg-surface-dark text-surface border-b border-border-line scroll-mt-24"
      aria-labelledby="manifesto-title"
    >
      <div className="max-w-site mx-auto site-pad section-y">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6">
            <div className="media-frame aspect-video sm:aspect-[16/9] bg-black border border-surface/20">
              <img
                alt="SVastra handloom archive"
                className="object-cover w-full h-full"
                loading="lazy"
                width={960}
                height={540}
                src={img || FALLBACK}
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5 sm:space-y-6">
            <span className="label-caps text-accent-ochre block">Our Approach</span>
            <h2
              id="manifesto-title"
              className="text-2xl sm:text-3xl lg:text-[2.5rem] font-bold uppercase tracking-tight leading-[1.15]"
            >
              Handloom, done simply
            </h2>
            <p className="text-[15px] sm:text-lg leading-[1.6] text-surface/80">
              SVastra is a small, focused saree label. We work with handloom weaves — tussar, chanderi
              and linen — in clean colours and sharp finishing. No heavy ornament, no inflated MRPs.
              Just honest fabric and drapes made to wear often.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 pt-2 text-[13px]">
              <div className="border-l-2 border-primary pl-4">
                <span className="font-bold text-surface uppercase block text-[14px]">
                  Natural fabrics
                </span>
                <span className="text-surface/60">Handloom cotton, tussar, chanderi and linen.</span>
              </div>
              <div className="border-l-2 border-accent-magenta pl-4">
                <span className="font-bold text-surface uppercase block text-[14px]">Clean design</span>
                <span className="text-surface/60">Modern colours and restrained borders.</span>
              </div>
              <div className="border-l-2 border-accent-ochre pl-4">
                <span className="font-bold text-surface uppercase block text-[14px]">Fair pricing</span>
                <span className="text-surface/60">Priced on the fabric, not the label.</span>
              </div>
              <div className="border-l-2 border-accent-blue pl-4">
                <span className="font-bold text-surface uppercase block text-[14px]">Easy returns</span>
                <span className="text-surface/60">Straightforward returns on eligible pieces.</span>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/about-us"
                className="inline-flex items-center justify-center min-h-[48px] px-8 border border-surface/40 text-surface text-[12px] font-semibold tracking-[0.06em] uppercase hover:bg-surface hover:text-on-surface transition-colors"
              >
                About SVastra
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
