/** Media and copy for the NAS Brand and Sport Line pages. Photos: see data/nas-home.ts. */
const WEB = "/nas-images/web";

/** The Brand (/rreth-nesh) and Sport Line (/sport-line) pages (designs "NAS — The Brand", "NAS — Sport Line", Nov 2026). */
export const NAS_PAGES = {
  brand: {
    hero: `${WEB}/concrete-helmet-light.webp`,
    /** Traced from the design PNG (transparent, black ink); no original file was supplied. */
    lion: `${WEB}/lion-emblem.png`,
    vision: [
      {
        title: "LIFESTYLE",
        text: "NAS is not just transport but a companion to the way you live. Elegance, comfort and confidence on every journey.",
        image: `${WEB}/lifestyle-tank.webp`,
      },
      { title: "SPEED", text: "Speed, precision and adrenaline, for those who chase the pure emotion of the road.", image: `${WEB}/hero-ride-side.webp` },
      { title: "FREEDOM", text: "For those who never stop. Strength, durability and the freedom to explore beyond borders.", image: `${WEB}/concrete-helmet-light.webp` },
    ],
    values: [
      { title: "TRUST", text: "A brand that earns confidence from the first contact." },
      { title: "CHARACTER", text: "Strong angles for stability and control, curves for movement." },
      { title: "PERFORMANCE", text: "Engineered to feel as good as it looks." },
      { title: "LONGEVITY", text: "Built for long-term quality, not the season." },
    ],
  },
  sportLine: {
    hero: `${WEB}/hero-ride-side.webp`,
    wordmark: [
      { title: "A FORM FROM THE WORDMARK", text: "A geometric element is taken from the NAS wordmark and set as the base shape of the identity." },
      { title: "TENSION AND DIRECTION", text: "The form is split and reshaped to create directional tension and a dynamic character." },
      { title: "RHYTHM", text: "Repeating the form creates rhythm, movement and a visual sense of acceleration." },
      { title: "THE SYMBOL", text: "The final symbol carries the energy of motion: speed, control and adrenaline." },
    ],
    /** Pedestal (222222222.png) + the front shot. */
  },
} as const;
