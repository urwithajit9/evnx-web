import { InstallPageClient } from "@/components/marketing/InstallPageClient";
import { canonicalUrl } from "@evnx/config";

export const metadata = {
  title: "Install evnx",
  description:
    "Install evnx in one command. Available as a shell installer, Homebrew, Scoop, winget, npm, PyPI, cargo, Docker, GitHub Releases and a GitHub Action.",
  alternates: { canonical: canonicalUrl("/install") },
};

export default function InstallPage() {
  return <InstallPageClient />;
}