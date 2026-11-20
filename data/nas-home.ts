/**
 * Media and copy for the NAS homepage (design: "NAS — Homepage", Nov 2026).
 * Photos: the client's originals in public/nas-images/, served as web-sized WebP copies from
 * public/nas-images/web/ (made with sharp; re-run the conversion when an original changes).
 * TEMP: the lion is still a crop of the design PNG (public/images/nas-home/); no original was supplied.
 */
const WEB = "/nas-images/web";
const TEMP = "/images/nas-home";

export const NAS_HOME = {
  lion: `${TEMP}/lion.png`,
  panels: [
    {
      title: "LIFESTYLE",
      text: "NAS is not just transport. It is a companion to the way you live: elegance, comfort and confidence on every journey.",
      image: `${WEB}/lifestyle-tank.webp`,
    },
    {
      title: "SPEED",
      text: "Speed, precision and adrenaline. NAS is built for those who chase the pure emotion of the road.",
      image: `${WEB}/speed-ride-front.webp`,
    },
    {
      title: "FREEDOM",
      text: "For those who never stop. NAS brings the strength, durability and freedom to explore beyond borders.",
      image: `${WEB}/freedom-helmet-dark.webp`,
    },
  ],
  sportLine: {
    pedestal: `${WEB}/sportline-pedestal.webp`,
    details: [`${WEB}/sportline-front.webp`, `${WEB}/sportline-logo-closeup.webp`],
  },
  /** Iron / Light / Concrete: on the Sport Line page (off the homepage since Nov 2026). */
  materials: [
    { title: "IRON", tags: "Precision · Strength · Engineering · Durability", image: `${WEB}/iron-engine.webp` },
    { title: "LIGHT", tags: "Illumination · Visibility · Focus · Energy · Speed", image: `${WEB}/sportline-logo-closeup.webp` },
    { title: "CONCRETE", tags: "Industrial · Urban · Road · Texture · Grip", image: `${WEB}/concrete-helmet-light.webp` },
  ],
} as const;
