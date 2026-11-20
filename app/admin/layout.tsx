import type { Metadata } from "next";

// The admin panel is private: never indexed, never linked from the public site.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin — NAS" },
  description: "Paneli i administrimit të NAS.",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
