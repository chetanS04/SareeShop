import Link from "next/link";
import { Truck, RotateCcw, Leaf, ShieldCheck } from "lucide-react";

const PROMISES = [
  {
    icon: Leaf,
    title: "Handloom Fabric",
    body: "Every saree is a genuine handloom weave — tussar, chanderi, cotton or linen. No polyester blends.",
  },
  {
    icon: Truck,
    title: "Delivered Across India",
    body: "Carefully packed and shipped nationwide, with tracking on every order.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    body: "Return or exchange eligible pieces within the return window shown on each product.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    body: "Pay by UPI, card or netbanking. Cash on delivery available on eligible orders.",
  },
];

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
            <span className="label-caps text-primary block mb-2">Why SVastra</span>
            <h2 id="voices-title" className="display-section text-on-surface">
              What You Can Count On
            </h2>
            <p className="text-[15px] sm:text-base text-body-slate mt-2 max-w-xl">
              A small label with straightforward promises — on the fabric, the delivery and the returns.
            </p>
          </div>
          <Link
            href="/about-us"
            className="label-caps text-on-surface hover:text-primary transition-colors flex items-center gap-2 shrink-0"
          >
            <span>More About Us</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {PROMISES.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="p-6 sm:p-7 flex flex-col gap-3 bg-surface-subtle border border-border-line"
              >
                <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} aria-hidden />
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-on-surface">
                  {p.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-body-slate">{p.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
