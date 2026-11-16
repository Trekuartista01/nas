import SiteShell from "@/components/layout/SiteShell";

// Every public page gets the shared Header/Footer here. The admin panel (app/admin) has its own layout.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <SiteShell>{children}</SiteShell>;
}
