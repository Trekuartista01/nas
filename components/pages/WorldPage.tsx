import Link from "next/link";
import { CatalogHero } from "@/components/catalog/CatalogParts";
import Reveal from "@/components/ui/Reveal";
import type { Post } from "@/lib/data/catalog";

/** Filter tabs (?lloji=…). Same kinds as the admin's post types. */
export const POST_KINDS: { id: Post["kind"]; label: string }[] = [
  { id: "event", label: "Evente" },
  { id: "lajme", label: "Lajme" },
  { id: "model", label: "Modele të reja" },
  { id: "keshilla", label: "Këshilla" },
];

export const postKindFromQuery = (q?: string): Post["kind"] | undefined => POST_KINDS.find((k) => k.id === q)?.id;

const dateFormat = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Belgrade", day: "2-digit", month: "2-digit", year: "numeric" });
export const formatPostDate = (iso?: string) => (iso ? dateFormat.format(new Date(iso)) : undefined);

export function PostCard({ post, large = false }: { post: Post; large?: boolean }) {
  return (
    <Link
      href={`/nas-world/${post.slug}`}
      className="group flex h-full flex-col border border-line bg-[#0b0b0b] transition-[transform,border-color] duration-500 ease-moto hover:-translate-y-2 hover:border-red"
    >
      <div className={`hatch relative overflow-hidden ${large ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
        {post.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image} alt="" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-[11px] font-extrabold tracking-[0.14em] text-red">{post.tag || POST_KINDS.find((k) => k.id === post.kind)?.label}</span>
        <h2 className={`font-extrabold leading-tight ${large ? "text-2xl" : "text-lg"}`}>{post.title}</h2>
        {post.excerpt && <p className="text-[15px] leading-normal text-muted-2">{post.excerpt}</p>}
        {post.publishedAt && <p className="mt-auto pt-2 text-xs text-faint">{formatPostDate(post.publishedAt)}</p>}
      </div>
    </Link>
  );
}

/** /nas-world: events, news, new models and tips (Admin → Postimet). */
export default function WorldPage({ posts, kind }: { posts: Post[]; kind?: Post["kind"] }) {
  const shown = kind ? posts.filter((p) => p.kind === kind) : posts;
  const tabs = [{ id: undefined, label: "Të gjitha" }, ...POST_KINDS];
  return (
    <>
      <CatalogHero title="WORLD" />
      <section className="container-moto pb-28">
        <nav aria-label="Lloji i postimeve" className="mb-10 flex flex-wrap gap-2">
          {tabs.map((t) => {
            const active = t.id === kind;
            return (
              <Link
                key={t.label}
                href={t.id ? `/nas-world?lloji=${t.id}` : "/nas-world"}
                aria-current={active ? "page" : undefined}
                className={`min-h-10 border px-4 py-2.5 text-xs font-bold tracking-[0.1em] transition-colors ${
                  active ? "border-red bg-red text-white" : "border-line-2 text-muted-2 hover:border-white hover:text-white"
                }`}
              >
                {t.label.toUpperCase()}
              </Link>
            );
          })}
        </nav>
        {shown.length === 0 ? (
          <div className="border border-dashed border-line-2 px-6 py-16 text-center">
            <p className="text-lg font-bold">Së shpejti.</p>
            <p className="mt-2 text-[15px] text-muted">Eventet, lajmet dhe këshillat e para po vijnë. Ndiqna në Instagram ndërkohë.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.06} className={i === 0 && !kind ? "sm:col-span-2" : undefined}>
                <PostCard post={p} large={i === 0 && !kind} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
