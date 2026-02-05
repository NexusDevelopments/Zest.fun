'use client';

import { useState, useEffect } from 'react';
import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import zestIdl from '@/lib/zestIdl';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ArrowDownToLine, Shield, CheckCircle, Copy } from 'lucide-react';
import Gingerswipe from '@/components/Gingerswipe';

// Admin wallet address (set in .env.local as NEXT_PUBLIC_ADMIN_WALLET)
const ADMIN_WALLET_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_WALLET || '';

export default function AdminWalletPage() {
  const { connection } = useConnection();
  const { publicKey, connected, signTransaction, signAllTransactions } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [copied, setCopied] = useState(false);
  const [treasuryAddress, setTreasuryAddress] = useState(ADMIN_WALLET_ADDRESS);
  const [curveConstant, setCurveConstant] = useState('1000');
  const [initStatus, setInitStatus] = useState('');
  const programId = process.env.NEXT_PUBLIC_PROGRAM_ID
    ? new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID)
    : null;

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance();
    }
  }, [isAuthenticated, publicKey]);

  const fetchBalance = async () => {
    setIsLoading(true);
    setConnectionStatus('connecting');
    
    try {
      const walletPublicKey = publicKey || (ADMIN_WALLET_ADDRESS ? new PublicKey(ADMIN_WALLET_ADDRESS) : null);

      if (!walletPublicKey) {
        setConnectionStatus('disconnected');
        setBalance(null);
        return;
      }

      const balanceInLamports = await connection.getBalance(walletPublicKey);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
      
      setBalance(balanceInSOL);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error fetching balance:', error);
      setConnectionStatus('disconnected');
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = () => {
    const address = publicKey?.toString() || ADMIN_WALLET_ADDRESS;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async () => {
    // This would implement actual withdrawal logic
    alert('Withdrawal functionality would be implemented here.\n\nIn production, this would:\n1. Create a transaction\n2. Sign with admin key (from secure key management)\n3. Send to specified address');
  };

  const handleUnlockSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleInitialize = async () => {
    setInitStatus('');

    if (!connected || !publicKey || !signTransaction || !signAllTransactions) {
      setInitStatus('Connect your wallet to initialize the launchpad.');
      return;
    }

    if (!programId) {
      setInitStatus('Program ID missing. Set NEXT_PUBLIC_PROGRAM_ID.');
      return;
    }

    if (!treasuryAddress) {
      setInitStatus('Treasury address is required.');
      return;
    }

    try {
      const treasuryKey = new PublicKey(treasuryAddress);
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

      await program.methods
        .initialize(new BN(curveConstant))
        .accounts({
          launchpad: launchpadPda,
          authority: publicKey,
          treasury: treasuryKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setInitStatus('Launchpad initialized successfully.');
    } catch (error) {
      setInitStatus(error instanceof Error ? error.message : 'Initialization failed.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-16 h-16 text-cyan-neon drop-shadow-cyan-glow-lg" />
          </div>
          <h1 className="text-4xl font-bold neon-text mb-2">
            Admin Wallet Access
          </h1>
          <p className="text-cyan-neon/60">
            Secure access to platform wallet
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            /* Authentication Phase */
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="cyan-glow-box p-8 rounded-lg"
            >
              <div className="flex flex-col items-center justify-center">
                <Gingerswipe onUnlockSuccess={handleUnlockSuccess} />
                <div className="mt-6">
                  <WalletMultiButton className="!bg-cyan-neon/10 !border-cyan-neon hover:!bg-cyan-neon/20" />
                </div>
                {!connected && (
                  <p className="mt-2 text-xs text-cyan-neon/60 text-center">
                    Connect your admin wallet to view the live balance.
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            /* Wallet Dashboard */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Authentication Success */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="cyan-glow-box p-6 rounded-lg flex items-center justify-center gap-3"
              >
                <CheckCircle className="w-6 h-6 text-cyan-neon" />
                <span className="text-cyan-neon font-semibold">
                  Biometric Authentication Successful
                </span>
              </motion.div>

              {/* Wallet Info Card */}
              <div className="cyan-glow-box p-8 rounded-lg breathing-glow">
                <div className="flex items-center gap-4 mb-6">
                  <Wallet className="w-12 h-12 text-cyan-neon drop-shadow-cyan-glow" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold cyan-glow">Admin Wallet</h2>
                    <div className="flex items-center gap-2">
                      <p className="text-cyan-neon/60 text-sm font-mono">
                        {publicKey
                          ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
                          : ADMIN_WALLET_ADDRESS
                          ? `${ADMIN_WALLET_ADDRESS.slice(0, 4)}...${ADMIN_WALLET_ADDRESS.slice(-4)}`
                          : 'No admin wallet set'}
                      </p>
                      <button
                        onClick={copyAddress}
                        className="text-cyan-neon/60 hover:text-cyan-neon transition-colors"
                        title="Copy address"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {copied && (
                        <span className="text-xs text-cyan-neon">Copied!</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <WalletMultiButton className="!bg-cyan-neon/10 !border-cyan-neon hover:!bg-cyan-neon/20" />
                  </div>
                </div>

                {/* Balance Display */}
                <div className="bg-black/50 rounded-lg p-6 mb-6">
                  <p className="text-cyan-neon/60 text-sm mb-2">Balance</p>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-cyan-neon border-t-transparent rounded-full animate-spin" />
                      <span className="text-cyan-neon">Loading...</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold neon-text">
                        {balance !== null ? balance.toFixed(4) : '---'}
                      </span>
                      <span className="text-2xl text-cyan-neon/70">SOL</span>
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-green-500' :
                      connectionStatus === 'connecting' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <span className="text-xs text-cyan-neon/60 capitalize">
                      {connectionStatus === 'connected' ? 'Connected to Devnet' : connectionStatus}
                    </span>
                  </div>
                </div>

                {/* Withdraw Button */}
                <button
                  onClick={handleWithdraw}
                  disabled={!isAuthenticated || !connected || balance === null || balance === 0}
                  className="w-full cyan-glow-button px-6 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowDownToLine className="w-6 h-6" />
                  Withdraw Funds
                </button>
              </div>

              <div className="cyan-glow-box p-6 rounded-lg">
                <h3 className="text-xl font-bold cyan-glow mb-4">Initialize Launchpad</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-cyan-neon font-semibold mb-2">
                      Treasury Wallet
                    </label>
                    <input
                      type="text"
                      value={treasuryAddress}
                      onChange={(e) => setTreasuryAddress(e.target.value)}
                      placeholder="Your Solana wallet address"
                      className="w-full bg-black/50 border-2 border-cyan-neon/50 rounded-lg px-4 py-3 text-white focus:border-cyan-neon focus:outline-none focus:shadow-cyan-glow transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-cyan-neon font-semibold mb-2">
                      Bonding Curve Constant
                    </label>
                    <input
                      type="number"
                      value={curveConstant}
                      onChange={(e) => setCurveConstant(e.target.value)}
                      min="1"
                      className="w-full bg-black/50 border-2 border-cyan-neon/50 rounded-lg px-4 py-3 text-white focus:border-cyan-neon focus:outline-none focus:shadow-cyan-glow transition-all"
                    />
                  </div>
                  <button
                    onClick={handleInitialize}
                    className="w-full cyan-glow-button px-6 py-3 rounded-lg font-semibold"
                  >
                    Initialize Launchpad
                  </button>
                  {initStatus && (
                    <p className="text-xs text-cyan-neon/70">{initStatus}</p>
                  )}
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-500/70 text-sm">
                  ⚠️ Security Notice: This page should only be accessible to authorized administrators. 
                  In production, implement additional security measures including IP whitelisting, 
                  rate limiting, and secure key management.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
