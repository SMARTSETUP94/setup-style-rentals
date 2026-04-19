import louisVuitton from "@/assets/clients/louis-vuitton.png";
import hermes from "@/assets/clients/hermes.png";
import franceTv from "@/assets/clients/france-tv.png";
import bbc from "@/assets/clients/bbc.png";
import warner from "@/assets/clients/warner.png";
import canalPlus from "@/assets/clients/canal-plus.png";
import m6 from "@/assets/clients/m6.png";

const CLIENTS = [
  { src: louisVuitton, alt: "Louis Vuitton" },
  { src: hermes, alt: "Hermès" },
  { src: canalPlus, alt: "Canal+" },
  { src: franceTv, alt: "France.tv" },
  { src: bbc, alt: "BBC" },
  { src: warner, alt: "Warner Bros" },
  { src: m6, alt: "M6" },
];

export function ClientsBand({ label }: { label: string }) {
  return (
    <section className="border-y border-border bg-background">
      <div className="container-x py-10 md:py-14">
        <p className="text-center text-xs uppercase tracking-[0.28em] text-muted-foreground">
          {label}
        </p>
        <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-x-8 gap-y-8 items-center justify-items-center">
          {CLIENTS.map((c) => (
            <img
              key={c.alt}
              src={c.src}
              alt={c.alt}
              loading="lazy"
              className="h-7 md:h-8 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
