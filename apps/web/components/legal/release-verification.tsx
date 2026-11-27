import Link from "next/link";
import { CodeFrame } from "@evnx/mdx/code-frame";

/**
 * Release verification on /security: the checksum, the build attestation and,
 * since v0.14.0, the signed SBOM.
 *
 * ⚠️ The commands are the ones in the installation guide and the release
 * notes. If the release workflow's name or the asset names change, change them
 * here in the same commit.
 */

const ARCHIVE = [
  "sha256sum -c evnx-<target>.tar.gz.sha256",
  "gh attestation verify evnx-<target>.tar.gz -R urwithajit9/evnx \\",
  "  --signer-workflow urwithajit9/evnx/.github/workflows/release.yml",
].join("\n");

const SBOM = [
  "sha256sum -c evnx-<version>.cdx.json.sha256",
  "gh attestation verify evnx-<version>.cdx.json -R urwithajit9/evnx \\",
  "  --signer-workflow urwithajit9/evnx/.github/workflows/release.yml",
].join("\n");

const SCAN = [
  "grype sbom:evnx-<version>.cdx.json",
  "trivy sbom evnx-<version>.cdx.json",
  "osv-scanner scan source -L evnx-<version>.cdx.json",
].join("\n");

function Commands({ label, code }: { label: string; code: string }) {
  return (
    <CodeFrame
      label={label}
      copyText={code}
      copyLabel={`${label} commands`}
      ariaLabel={`${label} commands`}
      className="mb-6"
    >
      <pre className="p-4 m-0 font-mono text-sm text-terminal-text leading-relaxed overflow-x-auto">
        <code>{code}</code>
      </pre>
    </CodeFrame>
  );
}

export function ReleaseVerification() {
  return (
    <section className="pb-16" id="verify-release" aria-labelledby="verify-release-title">
      <div className="container-base max-w-2xl">
        <h2 id="verify-release-title" className="font-serif text-2xl font-bold mb-2">
          Verify a release, and read its SBOM
        </h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          Every release archive has a SHA-256 checksum and a signed build attestation. Each release
          also carries a signed CycloneDX 1.5 software bill of materials, <code>evnx-&lt;version&gt;.cdx.json</code>,
          with its own <code>.sha256</code>: every crate in the build, with the same attestation as the
          binaries. Replace <code>&lt;version&gt;</code> with the release you downloaded, for example{" "}
          <code>0.15.0</code>.
        </p>

        <h3 className="font-serif text-xl font-bold mb-3 mt-8">The archive</h3>
        <Commands label="Archive" code={ARCHIVE} />

        <h3 className="font-serif text-xl font-bold mb-3 mt-8">The SBOM</h3>
        <p className="text-text-secondary leading-relaxed mb-4">
          The attestation proves the SBOM was produced by evnx&apos;s own release workflow, so you can
          trust that it describes what was built.
        </p>
        <Commands label="SBOM" code={SBOM} />

        <h3 className="font-serif text-xl font-bold mb-3 mt-8">Scan it</h3>
        <p className="text-text-secondary leading-relaxed mb-4">
          Any scanner that reads CycloneDX can check the list against known vulnerabilities:
          Grype, Trivy or OSV-Scanner.
        </p>
        <Commands label="Scanners" code={SCAN} />

        <p className="text-sm text-text-muted leading-relaxed">
          All assets are on the{" "}
          <a
            className="text-brand-400 hover:text-brand-300"
            href="https://github.com/urwithajit9/evnx/releases"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Releases page
          </a>
          .
        </p>
        <p className="text-sm text-text-muted leading-relaxed mt-2">
          What an SBOM is and how evnx builds and signs one:{" "}
          <Link
            className="text-brand-400 hover:text-brand-300"
            href="/blog/sbom-what-it-is-and-how-evnx-ships-one"
          >
            SBOM: what it is and how evnx ships one
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
