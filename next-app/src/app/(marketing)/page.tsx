"use client";

import React, { useEffect, useState } from "react";
import SvastraHero from "@/components/(frontend)/svastra/SvastraHero";
import SvastraWhoYouAre from "@/components/(frontend)/svastra/SvastraWhoYouAre";
import SvastraHowYouFeel from "@/components/(frontend)/svastra/SvastraHowYouFeel";
import SvastraIndependentCut from "@/components/(frontend)/svastra/SvastraIndependentCut";
import SvastraManifesto from "@/components/(frontend)/svastra/SvastraManifesto";
import SvastraVoices from "@/components/(frontend)/svastra/SvastraVoices";
import SvastraConcierge from "@/components/(frontend)/svastra/SvastraConcierge";
import { fetchProductsList } from "@/utils/archetypeCatalog";

export default function HomeUI() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchProductsList({ per_page: 12, page: 1 });
        if (cancelled) return;
        setProducts(list);
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
      <SvastraHero />
      <SvastraWhoYouAre />
      <SvastraHowYouFeel />
      <SvastraIndependentCut products={products} loading={loading} />
      <SvastraManifesto />
      <SvastraVoices />
      <SvastraConcierge />
    </div>
  );
}
