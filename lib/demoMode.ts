// Demo mode for testing without blockchain deployment
import { PublicKey } from '@solana/web3.js';

interface DemoToken {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  supply: number;
  price: number;
  priceHistory: { time: number; price: number }[];
  holders: number;
  createdAt: number;
  creator: string;
}

// In-memory demo storage
const demoTokens = new Map<string, DemoToken>();
const userBalances = new Map<string, Map<string, number>>();

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !process.env.NEXT_PUBLIC_PROGRAM_ID;
}

export function createDemoToken(
  name: string,
  symbol: string,
  description: string,
  image: string,
  creator: string
): DemoToken {
  const mint = PublicKey.unique().toBase58();
  const token: DemoToken = {
    mint,
    name,
    symbol,
    description,
    image,
    supply: 1,
    price: 0,
    priceHistory: [{ time: Date.now(), price: 0 }],
    holders: 1,
    createdAt: Date.now(),
    creator,
  };
  
  demoTokens.set(symbol.toLowerCase(), token);
  
  // Give creator initial balance
  if (!userBalances.has(creator)) {
    userBalances.set(creator, new Map());
  }
  userBalances.get(creator)!.set(mint, 1);
  
  return token;
}

export function getDemoToken(symbolOrMint: string): DemoToken | null {
  const bySymbol = demoTokens.get(symbolOrMint.toLowerCase());
  if (bySymbol) return bySymbol;
  
  for (const token of demoTokens.values()) {
    if (token.mint === symbolOrMint) return token;
  }
  
  return null;
}

export function getAllDemoTokens(): DemoToken[] {
  return Array.from(demoTokens.values());
}

export function buyDemoToken(
  symbolOrMint: string,
  amount: number,
  buyer: string,
  solAmount: number
): boolean {
  const token = getDemoToken(symbolOrMint);
  if (!token) return false;
  
  // Update supply
  token.supply += amount;
  
  // Calculate new price (bonding curve simulation)
  const newPrice = (token.supply ** 2) * 0.000001;
  token.price = newPrice;
  token.priceHistory.push({ time: Date.now(), price: newPrice });
  
  // Update buyer balance
  if (!userBalances.has(buyer)) {
    userBalances.set(buyer, new Map());
  }
  const currentBalance = userBalances.get(buyer)!.get(token.mint) || 0;
  userBalances.get(buyer)!.set(token.mint, currentBalance + amount);
  
  // Update holders count
  token.holders = userBalances.size;
  
  return true;
}

export function sellDemoToken(
  symbolOrMint: string,
  amount: number,
  seller: string
): { success: boolean; solReceived: number } {
  const token = getDemoToken(symbolOrMint);
  if (!token) return { success: false, solReceived: 0 };
  
  const userTokens = userBalances.get(seller)?.get(token.mint) || 0;
  if (userTokens < amount) return { success: false, solReceived: 0 };
  
  // Calculate SOL to return
  const solReceived = token.price * amount * 0.98; // 2% fee
  
  // Update supply
  token.supply -= amount;
  
  // Update price
  const newPrice = Math.max(0, (token.supply ** 2) * 0.000001);
  token.price = newPrice;
  token.priceHistory.push({ time: Date.now(), price: newPrice });
  
  // Update seller balance
  userBalances.get(seller)!.set(token.mint, userTokens - amount);
  
  return { success: true, solReceived };
}

export function getUserBalance(user: string, mint: string): number {
  return userBalances.get(user)?.get(mint) || 0;
}

export function simulatePriceChange(symbolOrMint: string, percentChange: number): void {
  const token = getDemoToken(symbolOrMint);
  if (!token) return;
  
  const newPrice = token.price * (1 + percentChange / 100);
  token.price = Math.max(0, newPrice);
  token.priceHistory.push({ time: Date.now(), price: token.price });
}
