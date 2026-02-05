'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type TokenRecord = {
  slug: string;
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  mintAddress?: string;
  createdAt: string;
};

export default function ExplorePage() {
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTokens = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch('/api/tokens');
        if (!response.ok) {
          throw new Error('Failed to load tokens.');
        }
        const payload = await response.json();
        setTokens(payload.tokens || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-cyan-neon/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold neon-text">
            Zest.fun
          </Link>
          <Link href="/launch" className="cyan-glow hover:text-cyan-light transition-colors">
            Launch Token
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold neon-text">Explore Tokens</h1>
            <p className="text-cyan-neon/60">Discover tokens launched on Zest.fun</p>
          </div>
          <Link
            href="/launch"
            className="cyan-glow-button px-5 py-3 rounded-lg font-semibold"
          >
            Launch Your Token
          </Link>
        </div>

        {isLoading && (
          <p className="text-cyan-neon/70">Loading tokens...</p>
        )}
        {error && <p className="text-red-400">{error}</p>}

        {!isLoading && !error && tokens.length === 0 && (
          <div className="cyan-glow-box p-6 rounded-lg text-center">
            <p className="text-cyan-neon/70">No tokens yet. Be the first to launch!</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tokens.map((token) => (
            <Link
              key={token.slug}
              href={`/${token.slug}`}
              className="cyan-glow-box p-6 rounded-lg hover:scale-[1.01] transition-transform"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={token.imageUrl}
                  alt={token.name}
                  className="w-14 h-14 rounded-full border border-cyan-neon/60"
                />
                <div>
                  <p className="text-xl font-bold cyan-glow">{token.name}</p>
                  <p className="text-cyan-neon/60 text-sm">{token.symbol}</p>
                </div>
              </div>
              <p className="text-sm text-cyan-neon/70 line-clamp-3">
                {token.description}
              </p>
              {token.mintAddress && (
                <p className="text-xs text-cyan-neon/50 mt-4 break-all">
                  Mint: {token.mintAddress}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}