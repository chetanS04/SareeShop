const MATRIX_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC3p8dJiP3tP5b9DqkcMnsdnmemTj4fYT8tvQ_fdiZRHjVNHWsMNAYBtNI2zyTfbjjGqIXVGhfBbu_hKFcn32mnQyqLh8C4a34XiWcJ-9-ioaLsMpKXmlQVxOBIQHEHO6XrIkGcoDx2eNtkrvcGuMWb90UL6IO7WfAGgC2fuscKgnJhFXNcBsbz6nG7pACp9-5KAwwPe6zs7PiIU1YEMJ3PknYhRvUVruEQTGiwMxUJKgvunI4j-CqC2JRwvphFyVJmYQ";

export default function SvastraManifesto() {
  return (
    <section id="manifesto" className="w-full bg-surface-dark text-surface border-b border-border-line scroll-mt-24" aria-labelledby="manifesto-title">
      <div className="max-w-site mx-auto site-pad section-y">
        <div className="border-b border-border-line-dark pb-5 sm:pb-6 mb-8 sm:mb-12">
          <span className="label-caps text-accent-ochre block tracking-[0.08em]">
            The SVastra Tension Matrix // Foundational Principles
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center mb-12 sm:mb-16">
          <div className="lg:col-span-6">
            <div className="media-frame aspect-video sm:aspect-[16/9] bg-black border border-surface/20">
              <img
                alt="Indian Feminine Bold Modern — SVastra Tension Matrix"
                className="object-contain bg-black"
                loading="lazy"
                width={960}
                height={540}
                src={MATRIX_IMG}
              />
            </div>
          </div>
          <div className="lg:col-span-6 space-y-5 sm:space-y-6">
            <h3 id="manifesto-title" className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight">
              Uncompromising Duality
            </h3>
            <p className="text-[15px] sm:text-lg leading-[1.6] text-surface/80">
              SVastra operates strictly in the creative tension between ancestral heritage and modern sovereign identity. We reject nostalgic ornamentalism in favor of pure fiber architecture.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 pt-2 text-[13px]">
              <div className="border-l-2 border-primary pl-4">
                <span className="font-bold text-surface uppercase block text-[14px]">Indian</span>
                <span className="text-surface/60">But never stereotypical or ornamental costume.</span>
              </div>
              <div className="border-l-2 border-accent-magenta pl-4">
                <span className="font-bold text-surface uppercase block text-[14px]">Feminine</span>
                <span className="text-surface/60">Softness engineered with undeniable backbone.</span>
              </div>
              <div className="border-l-2 border-accent-ochre pl-4">
                <span className="font-bold text-surface uppercase block text-[14px]">Bold</span>
                <span className="text-surface/60">Quiet command through material weight.</span>
              </div>
              <div className="border-l-2 border-accent-blue pl-4">
                <span className="font-bold text-surface uppercase block text-[14px]">Modern</span>
                <span className="text-surface/60">Without relinquishing historical roots.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 sm:pt-12 border-t border-border-line-dark">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">
            <div className="lg:col-span-8 space-y-4">
              <span className="label-caps text-primary">The Atelier Manifesto</span>
              <h2 className="text-xl sm:text-3xl lg:text-5xl font-bold uppercase tracking-tight text-surface leading-[1.12]">
                We do not design costumes for occasions.
                <br className="hidden sm:block" />
                We craft modern armour for real life.
              </h2>
            </div>
            <div className="lg:col-span-4 flex items-center gap-6 sm:gap-8 lg:justify-end border-t lg:border-t-0 border-border-line-dark pt-6 lg:pt-0">
              <div>
                <span className="text-3xl lg:text-4xl font-bold text-accent-ochre block">4,200+</span>
                <span className="text-[10px] font-semibold tracking-wider text-surface/60 uppercase">
                  Weaver Hours Per Piece
                </span>
              </div>
              <div className="h-10 w-px bg-surface/20" aria-hidden="true" />
              <div>
                <span className="text-3xl lg:text-4xl font-bold text-surface block">0%</span>
                <span className="text-[10px] font-semibold tracking-wider text-surface/60 uppercase">
                  Synthetic Polyester
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
