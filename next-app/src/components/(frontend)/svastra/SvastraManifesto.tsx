import Link from "next/link";

const MATRIX_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC3p8dJiP3tP5b9DqkcMnsdnmemTj4fYT8tvQ_fdiZRHjVNHWsMNAYBtNI2zyTfbjjGqIXVGhfBbu_hKFcn32mnQyqLh8C4a34XiWcJ-9-ioaLsMpKXmlQVxOBIQHEHO6XrIkGcoDx2eNtkrvcGuMWb90UL6IO7WfAGgC2fuscKgnJhFXNcBsbz6nG7pACp9-5KAwwPe6zs7PiIU1YEMJ3PknYhRvUVruEQTGiwMxUJKgvunI4j-CqC2JRwvphFyVJmYQ";

export default function SvastraManifesto() {
  return (
    <section
      id="manifesto"
      className="w-full bg-surface-dark text-surface border-b border-border-line scroll-mt-24"
      aria-labelledby="manifesto-title"
    >
      <div className="max-w-site mx-auto site-pad section-y">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left: SVastra Tension Matrix image */}
          <div className="lg:col-span-6">
            <div className="media-frame aspect-video sm:aspect-[16/9] bg-black border border-surface/20">
              <img
                alt="Indian, Feminine, Bold, Modern — the SVastra tension matrix"
                className="object-contain bg-black"
                loading="lazy"
                width={960}
                height={540}
                src={MATRIX_IMG}
              />
            </div>
          </div>

          {/* Right: copy + practical promises */}
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
                <span className="font-bold text-surface uppercase block text-[14px]">Natural fabrics</span>
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
