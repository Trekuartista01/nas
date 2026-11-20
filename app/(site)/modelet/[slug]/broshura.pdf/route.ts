import { brochurePdf } from "@/lib/brochure";
import { getModels } from "@/lib/data/catalog";

/** /modelet/[slug]/broshura.pdf: the model's Technical Data sheet as a download. */
export async function generateStaticParams() {
  return (await getModels()).map((m) => ({ slug: m.slug }));
}

export async function GET(_req: Request, { params }: RouteContext<"/modelet/[slug]/broshura.pdf">) {
  const { slug } = await params;
  const model = (await getModels()).find((m) => m.slug === slug);
  if (!model) return new Response("Not found", { status: 404 });
  const pdf = await brochurePdf(model);
  const file = `${model.brand}-${model.name}-specs.pdf`.replace(/[^A-Za-z0-9.-]+/g, "-");
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      // inline: opening the link shows the PDF; the button's `download` attribute saves it with this name.
      "Content-Disposition": `inline; filename="${file}"`,
    },
  });
}
