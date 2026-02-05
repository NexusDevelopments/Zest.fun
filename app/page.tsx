import { Rocket, Coins, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-cyan-neon/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold neon-text">Zest.fun</h1>
            <nav className="flex gap-6">
              <Link href="/launch" className="cyan-glow hover:text-cyan-light transition-colors">
                Launch Token
              </Link>
              <Link href="/explore" className="text-cyan-neon/70 hover:text-cyan-neon transition-colors">
                Explore
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-6xl font-bold mb-6 neon-text">
            Launch Your Meme Coin
            <br />
            On Solana
          </h2>
          <p className="text-xl text-cyan-neon/70 mb-12">
            The easiest way to create and launch your meme coin on Solana.
            Get your first coin free, then use our bonding curve for fair launches.
          </p>
          
          <Link href="/launch">
            <button className="cyan-glow-button px-12 py-6 rounded-lg text-xl font-bold breathing-glow">
              Launch Token Now
            </button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="cyan-glow-box p-8 rounded-lg">
            <Rocket className="w-12 h-12 mb-4 text-cyan-neon drop-shadow-cyan-glow" />
            <h3 className="text-2xl font-bold mb-3 cyan-glow">Fair Launch</h3>
            <p className="text-cyan-neon/60">
              Get your first coin free! Then our bonding curve ensures fair pricing for everyone.
            </p>
          </div>

          <div className="cyan-glow-box p-8 rounded-lg">
            <Zap className="w-12 h-12 mb-4 text-cyan-neon drop-shadow-cyan-glow" />
            <h3 className="text-2xl font-bold mb-3 cyan-glow">Lightning Fast</h3>
            <p className="text-cyan-neon/60">
              Built on Solana for instant transactions and minimal fees.
            </p>
          </div>

          <div className="cyan-glow-box p-8 rounded-lg">
            <Coins className="w-12 h-12 mb-4 text-cyan-neon drop-shadow-cyan-glow" />
            <h3 className="text-2xl font-bold mb-3 cyan-glow">Secure & Open</h3>
            <p className="text-cyan-neon/60">
              Powered by Anchor smart contracts. Fully auditable and transparent.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-neon/30 mt-20">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-cyan-neon/50">
            © 2026 Zest.fun - Built on Solana
          </p>
        </div>
      </footer>
    </main>
  );
}
