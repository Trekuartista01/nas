/** Media and copy for the NAS Brand and Sport Line pages, in both languages ({ sq, en }). Photos: see data/nas-home.ts. */
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
        text: {
          sq: "NAS nuk është vetëm transport, por shoqërues i mënyrës si jeton. Elegancë, rehati dhe siguri në çdo udhëtim.",
          en: "NAS is not just transport but a companion to the way you live. Elegance, comfort and confidence on every journey.",
        },
        image: `${WEB}/lifestyle-tank.webp`,
      },
      {
        title: "SPEED",
        text: {
          sq: "Shpejtësi, saktësi dhe adrenalinë, për ata që ndjekin emocionin e pastër të rrugës.",
          en: "Speed, precision and adrenaline, for those who chase the pure emotion of the road.",
        },
        image: `${WEB}/hero-ride-side.webp`,
      },
      {
        title: "FREEDOM",
        text: {
          sq: "Për ata që nuk ndalen kurrë. Forcë, qëndrueshmëri dhe liria për të eksploruar përtej kufijve.",
          en: "For those who never stop. Strength, durability and the freedom to explore beyond borders.",
        },
        image: `${WEB}/concrete-helmet-light.webp`,
      },
    ],
    values: [
      { title: "TRUST", text: { sq: "Një markë që fiton besimin që në kontaktin e parë.", en: "A brand that earns confidence from the first contact." } },
      {
        title: "CHARACTER",
        text: { sq: "Kënde të forta për stabilitet dhe kontroll, kthesa për lëvizje.", en: "Strong angles for stability and control, curves for movement." },
      },
      { title: "PERFORMANCE", text: { sq: "E projektuar të ndihet aq mirë sa duket.", en: "Engineered to feel as good as it looks." } },
      { title: "LONGEVITY", text: { sq: "Ndërtuar për cilësi afatgjatë, jo për një sezon.", en: "Built for long-term quality, not the season." } },
    ],
  },
  sportLine: {
    hero: `${WEB}/hero-ride-side.webp`,
    wordmark: [
      {
        title: "A FORM FROM THE WORDMARK",
        text: {
          sq: "Një element gjeometrik merret nga shkrimi NAS dhe vendoset si forma bazë e identitetit.",
          en: "A geometric element is taken from the NAS wordmark and set as the base shape of the identity.",
        },
      },
      {
        title: "TENSION AND DIRECTION",
        text: {
          sq: "Forma ndahet dhe riformësohet për të krijuar tension drejtimi dhe një karakter dinamik.",
          en: "The form is split and reshaped to create directional tension and a dynamic character.",
        },
      },
      {
        title: "RHYTHM",
        text: {
          sq: "Përsëritja e formës krijon ritëm, lëvizje dhe një ndjesi vizuale përshpejtimi.",
          en: "Repeating the form creates rhythm, movement and a visual sense of acceleration.",
        },
      },
      {
        title: "THE SYMBOL",
        text: {
          sq: "Simboli përfundimtar mbart energjinë e lëvizjes: shpejtësi, kontroll dhe adrenalinë.",
          en: "The final symbol carries the energy of motion: speed, control and adrenaline.",
        },
      },
    ],
    /** Pedestal (222222222.png) + the front shot. */
  },
} as const;
