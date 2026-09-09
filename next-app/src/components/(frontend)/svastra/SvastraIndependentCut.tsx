"use client";

import Link from "next/link";
import ProductCard from "@/components/(frontend)/ProductCard";

type Props = {
  products: any[];
  loading?: boolean;
};

export default function SvastraIndependentCut({ products, loading }: Props) {
  const items = products.slice(0, 4);

  return (
    <section id="independent-cut" className="w-full bg-surface border-b border-border-line scroll-mt-24" aria-labelledby="edit-title">
      <div className="max-w-site mx-auto site-pad section-y">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-on-surface/15 pb-5 sm:pb-6 mb-6 sm:mb-8 gap-4">
          <div>
            <span className="label-caps text-primary block mb-2">Curated Releases</span>
            <h2 id="edit-title" className="display-section text-on-surface">
              The Independent Cut
            </h2>
            <p className="text-[14px] sm:text-[15px] text-body-slate mt-2">
              Signature masterworks from the live collection.
            </p>
          </div>
          <Link href="/products" className="label-caps text-body-slate hover:text-primary transition-colors">
            View Full Collections →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-surface-ivory border border-[rgba(14,14,13,0.08)] animate-pulse" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        ) : (
          <div className="border border-border-line bg-surface-subtle p-10 text-center">
            <p className="text-body-slate mb-4">No curated pieces in the collection yet.</p>
            <Link href="/products" className="sv-btn-primary">
              Browse Collections
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
