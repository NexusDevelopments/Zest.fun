'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
} from '@solana/spl-token';
import zestIdl from '@/lib/zestIdl';
import { motion } from 'framer-motion';
import { Rocket, Upload, Sparkles } from 'lucide-react';

export default function LaunchPage() {
  const router = useRouter();
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions, connected } = useWallet();
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [mintAddress, setMintAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const programId = process.env.NEXT_PUBLIC_PROGRAM_ID
    ? new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID)
    : null;
  const bondingCurveConstant = Number(process.env.NEXT_PUBLIC_BONDING_CURVE_CONSTANT || 1000);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    if (!connected || !publicKey || !signTransaction || !signAllTransactions) {
      setErrorMessage('Connect your wallet to launch a token.');
      setIsSubmitting(false);
      return;
    }

    if (!programId) {
      setErrorMessage('Program ID is missing. Set NEXT_PUBLIC_PROGRAM_ID.');
      setIsSubmitting(false);
      return;
    }

    try {
      const [launchpadPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('launchpad')],
        programId
      );

      const mintKeypair = Keypair.generate();
      const mintRent = await getMinimumBalanceForRentExemptMint(connection);

      const createMintTx = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          lamports: mintRent,
          space: 82,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          9,
          launchpadPda,
          launchpadPda
        )
      );

      const creatorTokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        publicKey
      );

      createMintTx.add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          creatorTokenAccount,
          publicKey,
          mintKeypair.publicKey
        )
      );

      createMintTx.feePayer = publicKey;
      createMintTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      createMintTx.partialSign(mintKeypair);

      const signed = await signTransaction(createMintTx);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature, 'confirmed');

      setMintAddress(mintKeypair.publicKey.toBase58());

      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions },
        { preflightCommitment: 'confirmed' }
      );
      const program = new Program(zestIdl, programId, provider);

      const [tokenInfoPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('token_info'), mintKeypair.publicKey.toBuffer()],
        programId
      );

      await program.methods
        .createToken(tokenName, tokenSymbol, imageUrl, new BN(bondingCurveConstant))
        .accounts({
          launchpad: launchpadPda,
          tokenInfo: tokenInfoPda,
          tokenMint: mintKeypair.publicKey,
          creatorTokenAccount,
          creator: publicKey,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tokenName,
          symbol: tokenSymbol,
          description,
          imageUrl,
          mintAddress: mintKeypair.publicKey.toBase58(),
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || 'Failed to register token.');
      }

      const payload = await response.json();
      router.push(`/${payload.token.slug}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-cyan-neon/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="text-3xl font-bold neon-text">Zest.fun</a>
            <div className="flex items-center gap-4">
              <span className="text-cyan-neon/60">Launch Your Token</span>
              <WalletMultiButton className="!bg-cyan-neon/10 !border-cyan-neon hover:!bg-cyan-neon/20" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Rocket className="w-16 h-16 mx-auto mb-4 text-cyan-neon drop-shadow-cyan-glow-lg" />
          <h1 className="text-5xl font-bold neon-text mb-4">
            Launch Your Meme Coin
          </h1>
          <p className="text-cyan-neon/70 text-lg">
            Create your token in minutes. First coin is free! 🎉
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleLaunch}
          className="cyan-glow-box p-8 rounded-lg breathing-glow"
        >
          <div className="space-y-6">
            {/* Token Name */}
            <div>
              <label className="block text-cyan-neon font-semibold mb-2">
                Token Name
              </label>
              <input
                type="text"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="e.g., Doge Rocket"
                required
                className="w-full bg-black/50 border-2 border-cyan-neon/50 rounded-lg px-4 py-3 text-white focus:border-cyan-neon focus:outline-none focus:shadow-cyan-glow transition-all"
              />
            </div>

            {/* Token Symbol */}
            <div>
              <label className="block text-cyan-neon font-semibold mb-2">
                Token Symbol
              </label>
              <input
                type="text"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., DGRC"
                maxLength={10}
                required
                className="w-full bg-black/50 border-2 border-cyan-neon/50 rounded-lg px-4 py-3 text-white uppercase focus:border-cyan-neon focus:outline-none focus:shadow-cyan-glow transition-all"
              />
            </div>

            {/* Mint Address */}
            <div>
              <label className="block text-cyan-neon font-semibold mb-2">
                Mint Address (auto-generated)
              </label>
              <input
                type="text"
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                placeholder="Mint address will be generated on launch"
                disabled
                className="w-full bg-black/50 border-2 border-cyan-neon/20 rounded-lg px-4 py-3 text-white/60 cursor-not-allowed"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-cyan-neon font-semibold mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your token..."
                rows={4}
                required
                className="w-full bg-black/50 border-2 border-cyan-neon/50 rounded-lg px-4 py-3 text-white focus:border-cyan-neon focus:outline-none focus:shadow-cyan-glow transition-all resize-none"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-cyan-neon font-semibold mb-2">
                Token Image URL
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.png"
                  required
                  className="flex-1 bg-black/50 border-2 border-cyan-neon/50 rounded-lg px-4 py-3 text-white focus:border-cyan-neon focus:outline-none focus:shadow-cyan-glow transition-all"
                />
                <button
                  type="button"
                  className="cyan-glow-button px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload
                </button>
              </div>
              <p className="text-cyan-neon/50 text-sm mt-2">
                Recommended: 512x512px, PNG or JPG
              </p>
            </div>

            {/* Preview */}
            {imageUrl && (
              <div className="bg-black/50 border-2 border-cyan-neon/30 rounded-lg p-6">
                <p className="text-cyan-neon/70 text-sm mb-3">Preview</p>
                <div className="flex items-center gap-4">
                  <img
                    src={imageUrl}
                    alt="Token preview"
                    className="w-20 h-20 rounded-full border-2 border-cyan-neon shadow-cyan-glow"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23111" width="80" height="80"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%2300FFFF" font-size="14">No Image</text></svg>';
                    }}
                  />
                  <div>
                    <h3 className="text-xl font-bold cyan-glow">{tokenName || 'Your Token'}</h3>
                    <p className="text-cyan-neon/60">{tokenSymbol || 'SYMBOL'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-cyan-neon/10 border border-cyan-neon/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-neon flex-shrink-0 mt-0.5" />
                <div className="text-sm text-cyan-neon/70">
                  <p className="font-semibold text-cyan-neon mb-1">First Token Free!</p>
                  <p>
                    You'll receive 1 token for free when you launch. Additional tokens follow our bonding curve pricing model.
                  </p>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cyan-glow-button px-8 py-5 rounded-lg text-xl font-bold breathing-glow flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Rocket className="w-6 h-6" />
              {isSubmitting ? 'Launching...' : 'Launch Token'}
            </button>

            {errorMessage && (
              <p className="text-sm text-red-400 text-center">{errorMessage}</p>
            )}
          </div>
        </motion.form>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <h3 className="text-2xl font-bold cyan-glow mb-6">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="bg-black/30 border border-cyan-neon/20 rounded-lg p-4">
              <div className="w-10 h-10 rounded-full bg-cyan-neon/20 border border-cyan-neon mx-auto mb-3 flex items-center justify-center text-cyan-neon font-bold">
                1
              </div>
              <p className="text-cyan-neon/60">Create your token with name, symbol, and image</p>
            </div>
            <div className="bg-black/30 border border-cyan-neon/20 rounded-lg p-4">
              <div className="w-10 h-10 rounded-full bg-cyan-neon/20 border border-cyan-neon mx-auto mb-3 flex items-center justify-center text-cyan-neon font-bold">
                2
              </div>
              <p className="text-cyan-neon/60">Get your first token free - no cost!</p>
            </div>
            <div className="bg-black/30 border border-cyan-neon/20 rounded-lg p-4">
              <div className="w-10 h-10 rounded-full bg-cyan-neon/20 border border-cyan-neon mx-auto mb-3 flex items-center justify-center text-cyan-neon font-bold">
                3
              </div>
              <p className="text-cyan-neon/60">Share with community - bonding curve ensures fair pricing</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
