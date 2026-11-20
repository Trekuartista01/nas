import type { Metadata } from "next";
import { Suspense } from "react";
import WorldPage, { postKindFromQuery } from "@/components/pages/WorldPage";
import { getPosts, type Post } from "@/lib/data/catalog";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "NAS World",
  description: "Evente, lajme, modele të reja dhe këshilla nga NAS në Pejë.",
  path: "/nas-world",
});

// All posts prerender; the ?lloji= filter streams in after.
export default async function Page({ searchParams }: PageProps<"/nas-world">) {
  const posts = await getPosts();
  return (
    <Suspense fallback={<WorldPage posts={posts} />}>
      <WithQuery posts={posts} searchParams={searchParams} />
    </Suspense>
  );
}

async function WithQuery({ posts, searchParams }: Pick<PageProps<"/nas-world">, "searchParams"> & { posts: Post[] }) {
  const { lloji } = await searchParams;
  return <WorldPage posts={posts} kind={postKindFromQuery(typeof lloji === "string" ? lloji : undefined)} />;
}
