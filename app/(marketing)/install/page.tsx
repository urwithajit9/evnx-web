import { InstallPageClient } from "@/components/marketing/InstallPageClient";
import { canonicalUrl } from "@evnx/config";

export const metadata = {
  title: "Install evnx",
  description:
    "Install evnx in one command. Available on npm, crates.io, PyPI, Homebrew, GitHub Releases, and more.",
  alternates: { canonical: canonicalUrl("/install") },
};

export default function InstallPage() {
  return <InstallPageClient />;
}