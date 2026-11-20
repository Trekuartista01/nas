import Link from "next/link";
import { formatPostDate, PostCard, POST_KINDS } from "@/components/pages/WorldPage";
import Reveal from "@/components/ui/Reveal";
import type { Post } from "@/lib/data/catalog";

/** Body is plain text from the admin: blank lines separate paragraphs (no HTML is ever rendered). */
const paragraphs = (body: string) =>
  body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

/** /nas-world/[slug]. `all`: every published post (for "more posts"). */
export default function SinglePostPage({ post, all }: { post: Post; all: Post[] }) {
  const more = all.filter((p) => p.slug !== post.slug).slice(0, 3);
  const kindLabel = POST_KINDS.find((k) => k.id === post.kind)?.label;
  return (
    <>
      <article className="container-moto max-w-[900px] pb-20 pt-10 lg:pt-16">
        <Link href="/nas-world" className="text-sm text-muted hover:text-white">
          ← NAS World
        </Link>
        <p className="mt-8 text-xs font-extrabold tracking-[0.14em] text-red">{post.tag || kindLabel}</p>
        <h1 className="wide mt-3 text-[clamp(32px,4.4vw,60px)] font-black uppercase leading-[1.02] tracking-[-0.02em]">
          {post.title}
          <span className="text-red">.</span>
        </h1>
        <p className="mt-4 text-sm text-faint">
          {[kindLabel, post.eventDate && `Data e eventit: ${formatPostDate(post.eventDate)}`, formatPostDate(post.publishedAt)]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {post.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image} alt="" className="mt-10 aspect-[16/9] w-full border border-line object-cover" />
        )}
        <div className="mt-10 space-y-5 text-[17px] leading-relaxed text-[#d6d6d6]">
          {post.excerpt && <p className="text-xl leading-normal text-white">{post.excerpt}</p>}
          {paragraphs(post.body).map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
      </article>
      {more.length > 0 && (
        <section className="border-t border-[#1c1c1c] bg-surface">
          <div className="container-moto py-20">
            <h2 className="headline mb-10 text-[clamp(32px,4vw,56px)]">
              MË SHUMË<span className="text-red">.</span>
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.06}>
                  <PostCard post={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
