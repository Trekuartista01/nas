/** Media and copy for the NAS Brand and Sport Line pages, in both languages ({ sq, en }). Photos: see data/nas-home.ts. */
import { siteMedia } from "@/lib/supabase/config";
const WEB = siteMedia("/nas-images/web");

/** The Brand (/rreth-nesh) and Sport Line (/sport-line) pages (designs "NAS — The Brand", "NAS — Sport Line", Nov 2026). */
export const NAS_PAGES = {
  brand: {
    hero: `${WEB}/concrete-helmet-light.webp`,
    /** Traced from the design PNG (transparent, black ink); no original file was supplied. */
    lion: `${WEB}/lion-emblem.png`,
    vision: [
      {
        title: "ORIGIN",
        text: {
          sq: "Lindur nga pasioni për ngasjen dhe projektuar për rrugët që njohim.",
          en: "Built from a passion for riding and designed for the streets we know.",
        },
        image: `${WEB}/lifestyle-tank.webp`,
      },
      {
        title: "CRAFT",
        text: {
          sq: "Çdo detaj është projektuar me qëllim, nga korniza deri te përfundimi.",
          en: "Every detail is engineered with purpose, from frame to finish.",
        },
        image: `${WEB}/hero-ride-side.webp`,
      },
      {
        title: "COMMUNITY",
        text: {
          sq: "Më shumë se një markë: një grup motoristësh në rritje që ndajnë rrugën.",
          en: "More than a brand, a growing crew of riders who share the road.",
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
