import { BUSINESS, PRICES_ARE_DEMO, isPlaceholder } from "@/data/business";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

const DEALER_ID = `${SITE_URL}/#dealer`;
const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

/** The shop itself + the website (home page). */
export function dealerSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MotorcycleDealer",
        "@id": DEALER_ID,
        name: BUSINESS.name,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        image: abs("/opengraph-image"),
        telephone: BUSINESS.phone,
        // Street and city stay out until the client confirms the address.
        address: {
          "@type": "PostalAddress",
          ...(BUSINESS.street && { streetAddress: BUSINESS.street }),
          ...(BUSINESS.city && { addressLocality: BUSINESS.city }),
          ...(BUSINESS.postalCode && { postalCode: BUSINESS.postalCode }),
          addressCountry: BUSINESS.country,
        },
        ...(BUSINESS.mapsUrl && { hasMap: BUSINESS.mapsUrl }),
        areaServed: { "@type": "Country", name: "Kosovë" },
        brand: BUSINESS.brands.map((name) => ({ "@type": "Brand", name })),
        sameAs: [BUSINESS.instagram, BUSINESS.facebook].filter(Boolean),
        ...(BUSINESS.openingHours && { openingHours: BUSINESS.openingHours }),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: BUSINESS.name,
        url: SITE_URL,
        inLanguage: "sq",
        publisher: { "@id": DEALER_ID },
      },
    ],
  };
}

interface ProductInput {
  name: string;
  brand: string;
  path: string;
  description: string;
  category: string;
  image?: string;
  price: number;
}

/** One product page. Placeholder brands and demo prices are left out. */
export function productSchema(p: ProductInput) {
  const brand = isPlaceholder(p.brand) ? undefined : p.brand;
  const url = abs(p.path);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: brand ? `${brand} ${p.name}` : p.name,
    description: p.description,
    category: p.category,
    url,
    ...(p.image && { image: abs(p.image) }),
    ...(brand && { brand: { "@type": "Brand", name: brand } }),
    ...(PRICES_ARE_DEMO
      ? {}
      : { offers: { "@type": "Offer", price: p.price, priceCurrency: "EUR", url, seller: { "@id": DEALER_ID } } }),
  };
}
