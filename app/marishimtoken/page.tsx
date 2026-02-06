'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, DollarSign, BarChart3, Settings, Play, Pause } from 'lucide-react';
import {
  isDemoMode,
  createDemoToken,
  getDemoToken,
  buyDemoToken,
  sellDemoToken,
  simulatePriceChange,
} from '@/lib/demoMode';
import Gingerswipe from '@/components/Gingerswipe';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || '5aeHMWS1LNsWF1mS1uceARfCeR1dhuWzEXRDwzqRWsJ1';

export default function MarishimTokenPage() {
  const { publicKey, connected } = useWallet();
  const [token, setToken] = useState<any>(null);
  const [autoTradeEnabled, setAutoTradeEnabled] = useState(false);
  const [sellThreshold, setSellThreshold] = useState(-10); // Auto-sell if drops 10%
  const [myBalance, setMyBalance] = useState(0);
  const [priceChange24h, setPriceChange24h] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [sendAddress, setSendAddress] = useState('');
  const [receiveAddress, setReceiveAddress] = useState('');
  const [addressVerified, setAddressVerified] = useState(false);
  const [biometricComplete, setBiometricComplete] = useState(false);
  const isVerified = addressVerified && biometricComplete;

  const isAdmin = connected && publicKey?.toBase58() === ADMIN_WALLET;
  const isAdminOrVerified = isAdmin || isVerified;

  useEffect(() => {
    // Load or create Marishim token
    const loadToken = async () => {
      let t = getDemoToken('MRSHM');
      
      if (!t && isAdminOrVerified) {
        // Auto-create token for admin
        t = createDemoToken(
          'Marishim Coin',
          'MRSHM',
          '🔥 The ultimate admin token with auto-trading capabilities',
          'https://via.placeholder.com/512/00ffff/000000?text=MRSHM',
          ADMIN_WALLET
        );
        
        // Give admin 1000 tokens instantly
        buyDemoToken('MRSHM', 999, ADMIN_WALLET, 0);
      }
      
      setToken(t);
      
      if (t && publicKey) {
        // Calculate balance (in demo mode)
        const balance = 1000; // Admin gets 1000 tokens
        setMyBalance(balance);
      }
    };

    loadToken();
  }, [publicKey, isAdminOrVerified]);

  // Auto-trading logic
  useEffect(() => {
    if (!autoTradeEnabled || !token) return;

    const interval = setInterval(() => {
      // Simulate random price changes
      const change = (Math.random() - 0.5) * 20; // -10% to +10%
      simulatePriceChange('MRSHM', change);
      
      const updated = getDemoToken('MRSHM');
      if (updated) {
        setToken({ ...updated });
        
        // Auto-sell logic
        const oldPrice = token.priceHistory[token.priceHistory.length - 2]?.price || token.price;
        const currentChange = ((updated.price - oldPrice) / oldPrice) * 100;
        
        if (currentChange < sellThreshold && myBalance > 0) {
          // Auto-sell
          const result = sellDemoToken('MRSHM', myBalance, ADMIN_WALLET);
          if (result.success) {
            setMyBalance(0);
            alert(`🚨 Auto-sold ${myBalance} MRSHM for ${result.solReceived.toFixed(4)} SOL (${currentChange.toFixed(2)}% dip)`);
          }
        }
        
        setPriceChange24h(currentChange);
      }
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [autoTradeEnabled, token, sellThreshold, myBalance]);

  const handleVerifyAccess = () => {
    const normalizedSend = sendAddress.trim();
    const normalizedReceive = receiveAddress.trim();

    if (normalizedSend === ADMIN_WALLET || normalizedReceive === ADMIN_WALLET) {
      setAddressVerified(true);
      return;
    }

    alert('❌ Address does not match admin wallet.');
  };

  const handleBiometricSuccess = () => {
    setBiometricComplete(true);
  };

  const handleBuyFree = async () => {
    if (!isAdminOrVerified) {
      alert('Admin only!');
      return;
    }

    const amount = 100;
    const success = buyDemoToken('MRSHM', amount, ADMIN_WALLET, 0);
    
    if (success) {
      setMyBalance(myBalance + amount);
      const updated = getDemoToken('MRSHM');
      if (updated) setToken({ ...updated });
    }
  };

  const handleInstantBuy = async () => {
    if (!isAdminOrVerified) return;
    
    buyDemoToken('MRSHM', 1000, ADMIN_WALLET, 0);
    setMyBalance(myBalance + 1000);
    const updated = getDemoToken('MRSHM');
    if (updated) setToken({ ...updated });
  };

  if (!connected && !isVerified) {
    if (!addressVerified) {
      // Step 1: Address verification
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl mb-6"
            >
              🔑
            </motion.div>
            <h1 className="text-3xl font-bold mb-4 text-cyan-400">Enter Your Address</h1>
            <div className="space-y-3 max-w-md mx-auto">
              <input
                value={sendAddress}
                onChange={(e) => setSendAddress(e.target.value)}
                placeholder="Send address"
                className="w-full bg-gray-900 border border-cyan-500/40 rounded-lg px-4 py-2 text-sm"
              />
              <input
                value={receiveAddress}
                onChange={(e) => setReceiveAddress(e.target.value)}
                placeholder="Receive address"
                className="w-full bg-gray-900 border border-cyan-500/40 rounded-lg px-4 py-2 text-sm"
              />
              <button
                onClick={handleVerifyAccess}
                className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-colors font-bold"
              >
                Next
              </button>
            </div>
            <div className="mt-4">
              <WalletMultiButton />
            </div>
          </div>
        </div>
      );
    } else {
      // Step 2: Biometric verification
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl mb-6"
            >
              👆
            </motion.div>
            <h1 className="text-3xl font-bold mb-2 text-cyan-400">Biometric Verification</h1>
            <p className="text-gray-400 mb-8">Complete the Gingerswipe to unlock</p>
            <Gingerswipe onSuccess={handleBiometricSuccess} />
          </div>
        </div>
      );
    }
  }

  if (!isAdminOrVerified) {
    if (!addressVerified) {
      // Step 1: Address verification
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              🚫
            </motion.div>
            <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
            <p className="text-gray-400 mb-6">This route is for Marishim only</p>
            <div className="mt-6 space-y-3 max-w-md mx-auto">
              <input
                value={sendAddress}
                onChange={(e) => setSendAddress(e.target.value)}
                placeholder="Send address"
                className="w-full bg-gray-900 border border-cyan-500/40 rounded-lg px-4 py-2 text-sm"
              />
              <input
                value={receiveAddress}
                onChange={(e) => setReceiveAddress(e.target.value)}
                placeholder="Receive address"
                className="w-full bg-gray-900 border border-cyan-500/40 rounded-lg px-4 py-2 text-sm"
              />
              <button
                onClick={handleVerifyAccess}
                className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-colors font-bold"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      // Step 2: Biometric verification
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl mb-6"
            >
              👆
            </motion.div>
            <h1 className="text-3xl font-bold mb-2 text-cyan-400">Biometric Verification</h1>
            <p className="text-gray-400 mb-8">Complete the Gingerswipe to unlock</p>
            <Gingerswipe onSuccess={handleBiometricSuccess} />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"
          >
            ⚡ Marishim Token HQ
          </motion.h1>
          <WalletMultiButton />
        </div>

        {token ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Token Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="lg:col-span-2 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border-2 border-cyan-500/30"
            >
              <div className="flex items-center gap-4 mb-6">
                <img src={token.image} alt={token.name} className="w-20 h-20 rounded-full" />
                <div>
                  <h2 className="text-3xl font-bold">{token.name}</h2>
                  <p className="text-cyan-400 text-xl">${token.symbol}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-black/50 p-4 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">Price</div>
                  <div className="text-2xl font-bold text-cyan-400">
                    {token.price.toFixed(6)} SOL
                  </div>
                </div>
                <div className="bg-black/50 p-4 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">24h Change</div>
                  <div className={`text-2xl font-bold ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-black/50 p-4 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">Supply</div>
                  <div className="text-2xl font-bold">{token.supply.toLocaleString()}</div>
                </div>
                <div className="bg-black/50 p-4 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">My Balance</div>
                  <div className="text-2xl font-bold text-purple-400">{myBalance.toLocaleString()}</div>
                </div>
              </div>

              {/* Price Chart */}
              <div className="bg-black/50 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Price History
                </h3>
                <div className="h-40 flex items-end gap-1">
                  {token.priceHistory.slice(-20).map((point: any, i: number) => {
                    const maxPrice = Math.max(...token.priceHistory.slice(-20).map((p: any) => p.price));
                    const height = (point.price / maxPrice) * 100;
                    const isUp = i > 0 && point.price > token.priceHistory[i - 1]?.price;
                    
                    return (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        className={`flex-1 rounded-t ${isUp ? 'bg-green-500' : 'bg-red-500'}`}
                      />
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Trading Controls */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Auto-Trading */}
              <div className="bg-gradient-to-br from-purple-900/50 to-cyan-900/50 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-500/30">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Auto-Trading
                </h3>
                
                <button
                  onClick={() => setAutoTradeEnabled(!autoTradeEnabled)}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    autoTradeEnabled
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {autoTradeEnabled ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {autoTradeEnabled ? 'Auto-Trade ON' : 'Auto-Trade OFF'}
                </button>

                <div className="mt-4">
                  <label className="text-sm text-gray-400 mb-2 block">
                    Auto-Sell Threshold: {sellThreshold}%
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="0"
                    value={sellThreshold}
                    onChange={(e) => setSellThreshold(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Auto-sells if price drops {Math.abs(sellThreshold)}% or more
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border-2 border-cyan-500/30">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                
                <button
                  onClick={handleInstantBuy}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold mb-3 hover:scale-105 transition-transform"
                >
                  <DollarSign className="w-5 h-5 inline mr-2" />
                  Instant Buy 1000 (FREE)
                </button>

                <button
                  onClick={handleBuyFree}
                  className="w-full py-3 bg-green-600 rounded-xl font-bold hover:bg-green-700 transition-colors"
                >
                  Get 100 Free Tokens
                </button>
              </div>

              {/* Status */}
              <div className="bg-black/50 p-4 rounded-xl border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${autoTradeEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                  <span className="text-sm text-gray-400">
                    {autoTradeEnabled ? 'Monitoring price...' : 'Standby'}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Demo Mode • No real SOL required
                </p>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              ⚡
            </motion.div>
            <p className="text-gray-400">Initializing token...</p>
          </div>
        )}
      </div>
    </div>
  );
}
