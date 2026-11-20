import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PublishToggle } from "@/components/admin/RowActions";
import { AdminLoading, EditLink, Badge, ButtonLink, EmptyState, PageHeader, Table, Td, Th, Thumb } from "@/components/admin/ui";
import { formatDate, POST_KIND_LABEL } from "@/lib/admin/format";
import { ADMIN_PATHS, NEW_SEGMENT } from "@/lib/admin/paths";
import { listPosts } from "@/lib/admin/queries";
import { mediaUrl } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Postimet", description: "Evente, lajme dhe këshilla për NAS World." };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Postimet"
        description="NAS World: evente, lajme, modele të reja dhe këshilla. Katër të fundit (kryesori i pari) dalin në faqen kryesore."
        actions={<ButtonLink href={`${ADMIN_PATHS.posts}/${NEW_SEGMENT}`}>+ Postim i ri</ButtonLink>}
      />
      <Suspense fallback={<AdminLoading />}>
        <Posts />
      </Suspense>
    </>
  );
}

async function Posts() {
  const rows = await listPosts();
  if (rows.length === 0) return <EmptyState title="Asnjë postim ende">Derisa të publikohen postime, faqja kryesore tregon kartat fillestare.</EmptyState>;
  return (
    <Table>
      <thead>
        <tr>
          <Th className="w-14" />
          <Th>Titulli</Th>
          <Th>Lloji</Th>
          <Th>Publikuar më</Th>
          <Th>Statusi</Th>
          <Th className="w-px"><span className="sr-only">Veprime</span></Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => (
          <tr key={p.id}>
            <Td>
              <Thumb src={mediaUrl(p.image_path)} alt="" />
            </Td>
            <Td>
              <Link href={`${ADMIN_PATHS.posts}/${p.id}`} className="font-medium hover:text-red">
                {p.title}
              </Link>
              {p.featured && (
                <span className="ml-2">
                  <Badge tone="red">Kryesor</Badge>
                </span>
              )}
            </Td>
            <Td className="text-muted-2">{POST_KIND_LABEL[p.kind]}</Td>
            <Td className="tabular-nums text-muted-2">{p.published_at ? formatDate(p.published_at) : "—"}</Td>
            <Td>
              <PublishToggle table="posts" id={p.id} published={p.published} label={p.title} />
            </Td>
            <Td className="text-right">
              <EditLink href={`${ADMIN_PATHS.posts}/${p.id}`} label={p.title} />
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
