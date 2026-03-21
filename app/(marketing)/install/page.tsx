import { InstallPageClient } from "@/components/marketing/InstallPageClient";

export const metadata = {
  title: "Install evnx",
  description:
    "Install evnx in one command. Available on npm, crates.io, PyPI, Homebrew, GitHub Releases, and more.",
};

export default function InstallPage() {
  return <InstallPageClient />;
}