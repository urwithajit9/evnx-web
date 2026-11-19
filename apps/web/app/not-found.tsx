import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-6xl font-bold tracking-tight">404</h1>

        <h2 className="text-2xl font-semibold">Page not found</h2>

        <p className="text-text-secondary">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-block rounded-lg border border-border-default px-6 py-3 text-sm font-medium transition-colors hover:bg-bg-surface"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
