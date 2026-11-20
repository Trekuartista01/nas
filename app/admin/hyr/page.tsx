import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import NotConnected from "@/components/admin/NotConnected";
import { LogoMark } from "@/components/ui/Logo";
import { supabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Hyrja",
  description: "Hyrja në panelin e administrimit të NAS.",
};

// Admin accounts are created in the Supabase dashboard and listed in public.admins (no sign-up here).
export default function Page() {
  if (!supabaseConfigured()) return <NotConnected />;
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <LogoMark title="NAS" className="mx-auto block h-7 w-auto text-white" />
        <div className="mt-6 border border-line bg-panel p-6">
          <h1 className="text-xl font-bold">Hyr në panel</h1>
          <p className="mb-6 mt-1 text-sm text-muted">Vetëm për stafin e NAS.</p>
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-faint">Ke harruar fjalëkalimin? Kontakto administratorin e faqes.</p>
      </div>
    </div>
  );
}
