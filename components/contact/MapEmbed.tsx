"use client";

import { useState } from "react";
import { BUSINESS } from "@/data/business";
import { GhostActionButton } from "@/components/ui/Buttons";

const EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(BUSINESS.mapsQuery)}&output=embed`;

/**
 * Google Maps, loaded only after a click: until then no request (and no Google cookie) leaves
 * the visitor's browser. Allowed in security-headers.ts (frame-src https://www.google.com).
 */
export default function MapEmbed() {
  const [show, setShow] = useState(false);
  if (show) {
    return (
      <iframe
        src={EMBED_URL}
        title={`Harta: ${BUSINESS.name}, ${BUSINESS.street}, ${BUSINESS.city}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block aspect-[4/3] w-full border-0 lg:aspect-auto lg:h-full lg:min-h-[420px]"
      />
    );
  }
  return (
    <div className="hatch flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 p-6 text-center lg:aspect-auto lg:h-full lg:min-h-[420px]">
      <p className="text-sm text-muted-2">Harta ngarkohet nga Google Maps.</p>
      <GhostActionButton onClick={() => setShow(true)}>
        SHFAQ HARTËN
      </GhostActionButton>
      <a href={BUSINESS.mapsUrl} target="_blank" rel="noreferrer" className="text-[13px] font-bold hover:text-red">
        ose hape në Google Maps →
      </a>
    </div>
  );
}
