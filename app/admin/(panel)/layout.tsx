import { Suspense } from "react";
import AdminAccount from "@/components/admin/AdminAccount";
import AdminNav from "@/components/admin/AdminNav";
import NotConnected from "@/components/admin/NotConnected";
import { supabaseConfigured } from "@/lib/supabase/config";

// Every page in (panel) checks the admin itself (lib/admin/auth.ts → requireAdmin); this layout is only chrome.
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  if (!supabaseConfigured()) return <NotConnected />;
  return (
    <div className="lg:flex">
      <AdminNav
        account={
          <Suspense fallback={<div className="h-12" />}>
            <AdminAccount />
          </Suspense>
        }
      />
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
