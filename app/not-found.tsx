export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-6xl font-bold tracking-tight">404</h1>

        <h2 className="text-2xl font-semibold">Page not found</h2>

        <p className="text-muted-foreground">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>

        <div className="pt-4">
          <a
            href="/"
            className="inline-block rounded-lg border px-6 py-3 text-sm font-medium transition hover:bg-accent"
          >
            Return home
          </a>
        </div>
      </div>
    </main>
  );
}
