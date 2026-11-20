import { LogoMark } from "@/components/ui/Logo";

/** Shown instead of the admin panel until the Supabase settings are in .env.local / Vercel. */
export default function NotConnected() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-16">
      <p className="flex items-center gap-2.5">
        <LogoMark title="NAS" className="h-5 w-auto text-white" />
        <span className="text-xs font-semibold tracking-[0.14em] text-faint">ADMIN</span>
      </p>
      <h1 className="mt-6 text-2xl font-bold">Paneli nuk është lidhur ende me databazën</h1>
      <p className="mt-3 text-muted">
        Faqja publike punon normalisht me katalogun lokal. Paneli i administrimit hapet sapo të vendosen të dhënat e projektit Supabase.
      </p>
      <div className="mt-6 border border-line bg-panel p-4 text-sm">
        <p className="font-semibold">Për zhvilluesin</p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-muted-2">
          <li>Krijo projektin në Supabase dhe ekzekuto <code className="text-white">supabase/migrations</code> (shih <code className="text-white">supabase/README.md</code>).</li>
          <li>
            Plotëso <code className="text-white">NEXT_PUBLIC_SUPABASE_URL</code>, <code className="text-white">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> dhe{" "}
            <code className="text-white">SUPABASE_SECRET_KEY</code> në <code className="text-white">.env.local</code> (dhe në Vercel).
          </li>
          <li>Rinise serverin. Ky ekran zëvendësohet nga faqja e hyrjes.</li>
        </ol>
      </div>
    </div>
  );
}
