import type { Metadata } from "next";
import { Suspense } from "react";
import PostForm from "@/components/admin/forms/PostForm";
import { AdminLoading, PageHeader } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/admin/format";
import { ADMIN_PATHS } from "@/lib/admin/paths";
import { getPostRow } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Ndrysho postimin", description: "Ndrysho një postim të Moto Shpati World." };

export default function Page({ params }: PageProps<"/admin/postimet/[id]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EditPost params={params} />
    </Suspense>
  );
}

async function EditPost({ params }: Pick<PageProps<"/admin/postimet/[id]">, "params">) {
  const row = await getPostRow((await params).id);
  return (
    <>
      <PageHeader
        title={row.title}
        back={{ href: ADMIN_PATHS.posts, label: "Postimet" }}
        description={row.published && row.published_at ? `I publikuar më ${formatDateTime(row.published_at)}` : "Draft: nuk shfaqet në faqe."}
      />
      <PostForm row={row} />
    </>
  );
}
