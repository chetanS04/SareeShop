"use client";

import React, { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import SvastraHero from "@/components/(frontend)/svastra/SvastraHero";
import SvastraWhoYouAre from "@/components/(frontend)/svastra/SvastraWhoYouAre";
import SvastraHowYouFeel from "@/components/(frontend)/svastra/SvastraHowYouFeel";
import SvastraIndependentCut from "@/components/(frontend)/svastra/SvastraIndependentCut";
import SvastraManifesto from "@/components/(frontend)/svastra/SvastraManifesto";
import SvastraVoices from "@/components/(frontend)/svastra/SvastraVoices";
import SvastraConcierge from "@/components/(frontend)/svastra/SvastraConcierge";
import NewArrivalsSection from "./NewArrivals/NewArrivalsSection";

export default function HomeUI() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products-paginated?per_page=12&page=1");
        const data = res.data?.data?.products || res.data?.products || res.data?.data || res.data || [];
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch products", error);
        try {
          const fallback = await axios.get("/api/products");
          const list = Array.isArray(fallback.data)
            ? fallback.data
            : fallback.data?.data || fallback.data?.products || [];
          setProducts(Array.isArray(list) ? list : []);
        } catch {
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="w-full bg-surface">
      <SvastraHero />
      <SvastraWhoYouAre />
      <SvastraHowYouFeel />
      <SvastraIndependentCut products={products} loading={loading} />

      <section className="w-full bg-surface border-b border-border-line">
        <div className="max-w-site mx-auto site-pad section-y">
          <NewArrivalsSection />
        </div>
      </section>

      <SvastraManifesto />
      <SvastraVoices />
      <SvastraConcierge />
    </div>
  );
}
