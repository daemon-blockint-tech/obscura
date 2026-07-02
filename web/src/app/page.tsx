import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-obscura-primary mb-4">Obscura</h1>
        <p className="text-obscura-on-surface-variant text-lg mb-8">
          Privacy-preserving swap and transfer on Solana
        </p>
        <div className="flex gap-4">
          <Link
            href="/transfer"
            className="rounded-lg bg-obscura-primary px-6 py-3 text-white font-semibold hover:opacity-90 transition"
          >
            Private Transfer
          </Link>
          <Link
            href="/swap"
            className="rounded-lg bg-obscura-secondary px-6 py-3 text-obscura-dark font-semibold hover:opacity-90 transition"
          >
            Private Swap
          </Link>
        </div>
      </div>
    </main>
  );
}
