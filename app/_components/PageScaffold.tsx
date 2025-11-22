type PageScaffoldProps = {
  title: string;
  description?: string;
};

// Shared layout shell so each page has a consistent placeholder look.
export function PageScaffold({ title, description }: PageScaffoldProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-6 py-16 text-center text-zinc-900">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description ? (
        <p className="max-w-xl text-base text-zinc-600">{description}</p>
      ) : null}
      <p className="text-sm text-zinc-400">UI implementation coming soon.</p>
    </main>
  );
}
