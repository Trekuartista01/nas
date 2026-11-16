import { ButtonLink } from "@/components/admin/ui";
import { ADMIN_PATHS } from "@/lib/admin/paths";

export default function AdminNotFound() {
  return (
    <div className="border border-line bg-panel p-6">
      <h1 className="text-xl font-bold">Nuk u gjet</h1>
      <p className="mt-2 text-sm text-muted-2">Ky element nuk ekziston ose është fshirë.</p>
      <ButtonLink href={ADMIN_PATHS.home} variant="secondary" className="mt-4">
        Kthehu te paneli
      </ButtonLink>
    </div>
  );
}
