import type { Metadata } from "next";
import PostForm from "@/components/admin/forms/PostForm";
import { PageHeader } from "@/components/admin/ui";
import { ADMIN_PATHS } from "@/lib/admin/paths";

export const metadata: Metadata = { title: "Postim i ri", description: "Shto një postim në NAS World." };

// The form only talks to the server on save (and checks the admin there), so this page needs no data.
export default function Page() {
  return (
    <>
      <PageHeader title="Postim i ri" back={{ href: ADMIN_PATHS.posts, label: "Postimet" }} />
      <PostForm />
    </>
  );
}
