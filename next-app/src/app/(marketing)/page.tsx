"use client";

import React, { useEffect, useState } from "react";
import SvastraHero from "@/components/(frontend)/svastra/SvastraHero";
import SvastraWhoYouAre from "@/components/(frontend)/svastra/SvastraWhoYouAre";
import SvastraHowYouFeel from "@/components/(frontend)/svastra/SvastraHowYouFeel";
import SvastraIndependentCut from "@/components/(frontend)/svastra/SvastraIndependentCut";
import SvastraManifesto from "@/components/(frontend)/svastra/SvastraManifesto";
import SvastraVoices from "@/components/(frontend)/svastra/SvastraVoices";
import SvastraConcierge from "@/components/(frontend)/svastra/SvastraConcierge";
import {
  fetchActiveSliderImage,
  fetchProductsList,
  productImageUrl,
} from "@/utils/archetypeCatalog";

export default function HomeUI() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [manifestoImage, setManifestoImage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [list, slider] = await Promise.all([
          fetchProductsList({ per_page: 12, page: 1 }),
          fetchActiveSliderImage(),
        ]);
        if (cancelled) return;
        setProducts(list);
        setHeroImage(slider || productImageUrl(list[0]));
        setManifestoImage(productImageUrl(list[1] || list[0]));
      } catch (e) {
        console.error("Home catalog failed", e);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full bg-surface">
      <SvastraHero heroImage={heroImage} />
      <SvastraWhoYouAre />
      <SvastraHowYouFeel />
      <SvastraIndependentCut products={products} loading={loading} />
      <SvastraManifesto imageUrl={manifestoImage} />
      <SvastraVoices />
      <SvastraConcierge />
    </div>
  );
}
