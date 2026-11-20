import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { signOut } from "@/lib/admin/session-actions";

/** Signed-in admin + sign out. Reads the session, so it renders inside <Suspense>. */
export default async function AdminAccount() {
  await requireAdmin(); // redirects to the login page if the session is gone
  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-2">
        Administratori
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <Link href="/" target="_blank" rel="noopener" className="text-muted hover:text-white">
          Shiko faqen ↗
        </Link>
        <form action={signOut}>
          <button type="submit" className="text-muted hover:text-white">
            Dil
          </button>
        </form>
      </div>
    </div>
  );
}
