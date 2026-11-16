import type { Metadata } from "next";
import BrandForm from "@/components/admin/forms/BrandForm";
import { PageHeader } from "@/components/admin/ui";
import { ADMIN_PATHS } from "@/lib/admin/paths";

export const metadata: Metadata = { title: "Brend i ri", description: "Shto një brend." };

// The form only talks to the server on save (and checks the admin there), so this page needs no data.
export default function Page() {
  return (
    <>
      <PageHeader title="Brend i ri" back={{ href: ADMIN_PATHS.brands, label: "Brendet" }} />
      <BrandForm />
    </>
  );
}
