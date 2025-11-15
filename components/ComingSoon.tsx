import Image from "next/image";

import { comingSoonConfig } from "@/lib/featureFlags";

export default function ComingSoon() {
  const { logoSrc, logoAlt, headline } = comingSoonConfig;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-12 px-6 py-10 text-center">
        <div className="relative w-[220px] h-[220px] sm:w-[320px] sm:h-[320px]">
          <Image
            src={logoSrc}
            alt={logoAlt}
            fill
            sizes="(max-width: 640px) 220px, 320px"
            className="object-contain"
            priority
          />
        </div>
        <p className="w-full text-7xl font-black uppercase sm:text-5xl">
          {headline}
        </p>
      </div>
    </div>
  );
}
