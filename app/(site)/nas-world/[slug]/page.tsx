import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import SinglePostPage from "@/components/pages/SinglePostPage";
import { getPosts } from "@/lib/data/catalog";
import { pageMetadata } from "@/lib/site";

// No generateStaticParams: there may be no posts yet, and each post renders on first visit, then is cached.

async function findPost(slug: string) {
  const all = await getPosts();
  return { all, post: all.find((p) => p.slug === slug) };
}

export async function generateMetadata({ params }: PageProps<"/nas-world/[slug]">): Promise<Metadata> {
  const { post } = await findPost((await params).slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.excerpt || `${post.title}: nga NAS World.`,
    path: `/nas-world/${post.slug}`,
    image: post.image ? { url: post.image, alt: post.title } : undefined,
  });
}

export default function Page({ params }: PageProps<"/nas-world/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-hidden />}>
      <PostContent params={params} />
    </Suspense>
  );
}

async function PostContent({ params }: Pick<PageProps<"/nas-world/[slug]">, "params">) {
  const { all, post } = await findPost((await params).slug);
  if (!post) notFound();
  return <SinglePostPage post={post} all={all} />;
}
