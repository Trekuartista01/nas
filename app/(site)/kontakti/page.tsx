import type { Metadata } from "next";
import ContactPage from "@/components/pages/ContactPage";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Kontakti",
  description: "NAS, Konferenca e Bujanit, Pejë. Telefono, na shkruaj ose gjeje showroom-in në hartë.",
  path: "/kontakti",
});

export default function Page() {
  return <ContactPage />;
}
