/**
 * Media and copy for the NAS homepage (design: "NAS — Homepage", Nov 2026). Headings are English only;
 * the body text is in both languages ({ sq, en }, rendered with <T>).
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
      text: {
        sq: "NAS nuk është thjesht transport. Është shoqërues i mënyrës si jeton: elegancë, rehati dhe siguri në çdo udhëtim.",
        en: "NAS is not just transport. It is a companion to the way you live: elegance, comfort and confidence on every journey.",
      },
      image: `${WEB}/lifestyle-tank.webp`,
    },
    {
      title: "SPEED",
      text: {
        sq: "Shpejtësi, saktësi dhe adrenalinë. NAS është ndërtuar për ata që ndjekin emocionin e pastër të rrugës.",
        en: "Speed, precision and adrenaline. NAS is built for those who chase the pure emotion of the road.",
      },
      image: `${WEB}/speed-ride-front.webp`,
    },
    {
      title: "FREEDOM",
      text: {
        sq: "Për ata që nuk ndalen kurrë. NAS sjell forcën, qëndrueshmërinë dhe lirinë për të eksploruar përtej kufijve.",
        en: "For those who never stop. NAS brings the strength, durability and freedom to explore beyond borders.",
      },
      image: `${WEB}/freedom-helmet-dark.webp`,
    },
  ],
  sportLine: {
    pedestal: `${WEB}/sportline-pedestal.webp`,
    details: [`${WEB}/sportline-front.webp`, `${WEB}/sportline-logo-closeup.webp`],
  },
  /** Iron / Light / Concrete: on the Sport Line page (off the homepage since Nov 2026). */
  materials: [
    {
      title: "IRON",
      tags: { sq: "Saktësi · Forcë · Inxhinieri · Qëndrueshmëri", en: "Precision · Strength · Engineering · Durability" },
      image: `${WEB}/iron-engine.webp`,
    },
    {
      title: "LIGHT",
      tags: { sq: "Ndriçim · Dukshmëri · Fokus · Energji · Shpejtësi", en: "Illumination · Visibility · Focus · Energy · Speed" },
      image: `${WEB}/sportline-logo-closeup.webp`,
    },
    {
      title: "CONCRETE",
      tags: { sq: "Industrial · Urban · Rrugë · Teksturë · Kapje", en: "Industrial · Urban · Road · Texture · Grip" },
      image: `${WEB}/concrete-helmet-light.webp`,
    },
  ],
} as const;
