'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram, clusterApiUrl } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import zestIdl from '@/lib/zestIdl';

const NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet') as
  | 'devnet'
  | 'mainnet-beta'
  | 'testnet';

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || clusterApiUrl(NETWORK);

type TokenRecord = {
  slug: string;
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  mintAddress?: string;
  createdAt: string;
};

type TokenStats = {
  supply?: string;
  decimals?: number;
  bondingCurveConstant?: string;
  nextPriceLamports?: string;
};

export default function TokenPage({ params }: { params: { token: string } }) {
  const { connection } = useConnection();
  const { publicKey, connected, signTransaction, signAllTransactions } = useWallet();
  const [token, setToken] = useState<TokenRecord | null>(null);
  const [stats, setStats] = useState<TokenStats>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [buyAmount, setBuyAmount] = useState('1');
  const [isBuying, setIsBuying] = useState(false);
  const [buyStatus, setBuyStatus] = useState('');
  const [treasuryKey, setTreasuryKey] = useState<PublicKey | null>(null);

  const programId = process.env.NEXT_PUBLIC_PROGRAM_ID
    ? new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID)
    : null;

  useEffect(() => {
    const loadToken = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/tokens/${params.token}`);
        if (!response.ok) {
          throw new Error('Token not found.');
        }
        const payload = await response.json();
        setToken(payload.token as TokenRecord);

        if (payload.token?.mintAddress) {
          const readConnection = new Connection(RPC_ENDPOINT, 'confirmed');
          const mintKey = new PublicKey(payload.token.mintAddress);
          const accountInfo = await readConnection.getParsedAccountInfo(mintKey);

          const parsed = accountInfo.value?.data as
            | { parsed?: { info?: { supply?: string; decimals?: number } } }
            | undefined;

          if (parsed?.parsed?.info) {
            setStats((prev) => ({
              ...prev,
              supply: parsed.parsed.info.supply,
              decimals: parsed.parsed.info.decimals,
            }));
          }

          const programId = process.env.NEXT_PUBLIC_PROGRAM_ID
            ? new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID)
            : null;

          if (programId) {
            const provider = new AnchorProvider(
              readConnection,
              {
                publicKey: SystemProgram.programId,
                signTransaction: async () => {
                  throw new Error('Wallet not available');
                },
                signAllTransactions: async () => {
                  throw new Error('Wallet not available');
                },
              },
              { commitment: 'confirmed' }
            );

            const program = new Program(zestIdl, programId, provider);
            const [tokenInfoPda] = PublicKey.findProgramAddressSync(
              [Buffer.from('token_info'), mintKey.toBuffer()],
              programId
            );

            const [launchpadPda] = PublicKey.findProgramAddressSync(
              [Buffer.from('launchpad')],
              programId
            );

            try {
              const info = await program.account.tokenInfo.fetch(tokenInfoPda);
              const totalSupply = (info.totalSupply || info.total_supply || new BN(0)) as BN;
              const bondingConstant =
                (info.bondingCurveConstant || info.bonding_curve_constant || new BN(0)) as BN;

              const nextPriceLamports = calculateNextPriceLamports(
                bondingConstant,
                totalSupply
              );

              try {
                const launchpad = await program.account.launchpad.fetch(launchpadPda);
                const treasury = launchpad.treasury as PublicKey;
                setTreasuryKey(treasury);
              } catch (err) {
                setTreasuryKey(null);
              }

              setStats((prev) => ({
                ...prev,
                bondingCurveConstant: bondingConstant.toString(),
                nextPriceLamports: nextPriceLamports.toString(),
              }));
            } catch (err) {
              // Ignore if token_info not found yet
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load token.');
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, [params.token]);

  const nextPriceSol = stats.nextPriceLamports
    ? Number(stats.nextPriceLamports) / 1_000_000_000
    : null;

  const handleBuy = async () => {
    setBuyStatus('');

    if (!token?.mintAddress || !programId) {
      setBuyStatus('Token or program not ready.');
      return;
    }

    if (!connected || !publicKey || !signTransaction || !signAllTransactions) {
      setBuyStatus('Connect your wallet to buy tokens.');
      return;
    }

    if (!treasuryKey) {
      setBuyStatus('Treasury not configured. Initialize the launchpad first.');
      return;
    }

    const amount = Number(buyAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setBuyStatus('Enter a valid amount.');
      return;
    }

    setIsBuying(true);

    try {
      const mintKey = new PublicKey(token.mintAddress);
      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions },
        { preflightCommitment: 'confirmed' }
      );
      const program = new Program(zestIdl, programId, provider);

      const [launchpadPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('launchpad')],
        programId
      );
      const [tokenInfoPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('token_info'), mintKey.toBuffer()],
        programId
      );
      const [userAccountPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), publicKey.toBuffer()],
        programId
      );

      const userTokenAccount = await getAssociatedTokenAddress(mintKey, publicKey);
      const ataInfo = await connection.getAccountInfo(userTokenAccount);
      const preInstructions = [];

      if (!ataInfo) {
        preInstructions.push(
          createAssociatedTokenAccountInstruction(
            publicKey,
            userTokenAccount,
            publicKey,
            mintKey,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      await program.methods
        .mintToken(new BN(amount))
        .accounts({
          launchpad: launchpadPda,
          userAccount: userAccountPda,
          tokenInfo: tokenInfoPda,
          tokenMint: mintKey,
          userTokenAccount,
          user: publicKey,
          treasury: treasuryKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .preInstructions(preInstructions)
        .rpc();

      setBuyStatus('Purchase successful.');
    } catch (err) {
      setBuyStatus(err instanceof Error ? err.message : 'Purchase failed.');
    } finally {
      setIsBuying(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-cyan-neon/70">Loading token stats...</p>
      </main>
    );
  }

  if (error || !token) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error || 'Token not found.'}</p>
          <Link href="/" className="cyan-glow">
            Go back home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-cyan-neon/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold neon-text">
            Zest.fun
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/launch" className="cyan-glow hover:text-cyan-light transition-colors">
              Launch Token
            </Link>
            <WalletMultiButton className="!bg-cyan-neon/10 !border-cyan-neon hover:!bg-cyan-neon/20" />
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16">
        <div className="cyan-glow-box p-8 rounded-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold neon-text mb-2">{token.name}</h1>
              <p className="text-cyan-neon/70">{token.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={token.imageUrl}
                alt={token.name}
                className="w-20 h-20 rounded-full border-2 border-cyan-neon shadow-cyan-glow"
              />
              <div>
                <p className="text-cyan-neon/60 text-sm">Symbol</p>
                <p className="text-xl font-bold cyan-glow">{token.symbol}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="bg-black/50 rounded-lg p-5">
              <p className="text-cyan-neon/60 text-sm">Supply</p>
              <p className="text-2xl font-bold cyan-glow">
                {stats.supply ? Number(stats.supply).toLocaleString() : 'N/A'}
              </p>
              {stats.decimals !== undefined && (
                <p className="text-xs text-cyan-neon/50">Decimals: {stats.decimals}</p>
              )}
            </div>
            <div className="bg-black/50 rounded-lg p-5">
              <p className="text-cyan-neon/60 text-sm">Next Token Price</p>
              <p className="text-2xl font-bold cyan-glow">
                {nextPriceSol !== null ? `${nextPriceSol.toFixed(6)} SOL` : 'N/A'}
              </p>
              {stats.bondingCurveConstant && (
                <p className="text-xs text-cyan-neon/50">
                  Curve constant: {stats.bondingCurveConstant}
                </p>
              )}
            </div>
            <div className="bg-black/50 rounded-lg p-5">
              <p className="text-cyan-neon/60 text-sm">Mint Address</p>
              <p className="text-xs text-cyan-neon/80 break-all">
                {token.mintAddress || 'Not set yet'}
              </p>
              {token.mintAddress && (
                <a
                  className="text-xs text-cyan-neon underline"
                  href={`https://explorer.solana.com/address/${token.mintAddress}?cluster=${NETWORK}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Explorer
                </a>
              )}
            </div>
            <div className="bg-black/50 rounded-lg p-5">
              <p className="text-cyan-neon/60 text-sm">Status</p>
              <p className="text-2xl font-bold cyan-glow">Live</p>
            </div>
          </div>

          <div className="mt-8 cyan-glow-box p-6 rounded-lg">
            <h3 className="text-xl font-bold cyan-glow mb-4">Buy Tokens</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="number"
                min="1"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="flex-1 bg-black/50 border-2 border-cyan-neon/50 rounded-lg px-4 py-3 text-white focus:border-cyan-neon focus:outline-none focus:shadow-cyan-glow transition-all"
                placeholder="Amount"
              />
              <button
                onClick={handleBuy}
                disabled={isBuying}
                className="cyan-glow-button px-6 py-3 rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isBuying ? 'Processing...' : 'Buy'}
              </button>
            </div>
            {buyStatus && (
              <p className="text-xs text-cyan-neon/70 mt-3">{buyStatus}</p>
            )}
          </div>

          <div className="mt-8 text-sm text-cyan-neon/60">
            Stats update when a real mint address is provided. Price, holders, and liquidity can be
            integrated once on-chain analytics are connected.
          </div>
        </div>
      </section>
    </main>
  );
}

const calculateNextPriceLamports = (bondingConstant: BN, totalSupply: BN) => {
  const supply = BigInt(totalSupply.toString());
  const constant = BigInt(bondingConstant.toString());
  const price = constant * supply * supply;
  return price / 1_000_000n;
};
