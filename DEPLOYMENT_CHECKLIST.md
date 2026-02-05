# ⚡ Quick Deployment Checklist

Use this checklist to deploy Zest.fun with Solana Playground.

---

## Part 1: Deploy Smart Contract (Solana Playground)

### Step 1: Setup Playground
- [ ] Go to https://beta.solpg.io
- [ ] Create new project named "zest"
- [ ] Select "Anchor (Rust)"

### Step 2: Copy Code
- [ ] Open `/workspaces/Zest.fun/programs/zest/src/lib.rs` (your local file)
- [ ] Copy ALL the code
- [ ] Paste into Solana Playground `src/lib.rs` (replace everything)

### Step 3: Update Dependencies
- [ ] Open `Cargo.toml` in Playground
- [ ] Update dependencies to:
  ```toml
  anchor-lang = "0.30.1"
  anchor-spl = "0.30.1"
  ```

### Step 4: Build & Deploy
- [ ] Click "Build" button (🔨)
- [ ] Wait for success
- [ ] Click wallet icon (💰) and "Airdrop" for SOL
- [ ] Click "Deploy" button (🚀)
- [ ] **COPY THE PROGRAM ID** (looks like: `Bx4Yc7k...`)

### Step 5: Update Rust Code
- [ ] In Playground, find `declare_id!("YOUR_PROGRAM_ID_HERE");`
- [ ] Replace with your actual Program ID
- [ ] Click "Build" again
- [ ] Click "Deploy" again

---

## Part 2: Configure Frontend

### Step 6: Update Environment
- [ ] Open `.env.local` in VS Code
- [ ] Paste your Program ID:
  ```
  NEXT_PUBLIC_PROGRAM_ID=YOUR_PROGRAM_ID_HERE
  ```
- [ ] Add your Freewallet address:
  ```
  NEXT_PUBLIC_ADMIN_WALLET=YOUR_SOLANA_ADDRESS
  ```
- [ ] Save the file

### Step 7: Restart Dev Server
- [ ] Stop the server (Ctrl+C)
- [ ] Run: `npm run dev`
- [ ] Open: http://localhost:3001 (or the port shown)

---

## Part 3: Initialize Platform

### Step 8: Initialize Launchpad
- [ ] Go to: http://localhost:3001/adminwalletpswdmarishim
- [ ] Connect wallet (Phantom/Solflare)
- [ ] Complete Gingerswipe unlock
- [ ] In "Initialize Launchpad":
  - Treasury: Your Freewallet address
  - Curve Constant: 1000
- [ ] Click "Initialize Launchpad"
- [ ] Approve transaction
- [ ] Wait for "Launchpad initialized successfully"

---

## Part 4: Test It!

### Step 9: Launch First Token
- [ ] Go to: http://localhost:3001/launch
- [ ] Fill in token details:
  - Name: "Test Coin"
  - Symbol: "TEST"
  - Description: "My first token"
  - Image: https://via.placeholder.com/512
- [ ] Click "Launch Token"
- [ ] Approve transaction
- [ ] You'll see your token page!

### Step 10: Buy Tokens
- [ ] On your token page, scroll to "Buy Tokens"
- [ ] Enter amount: 1
- [ ] Click "Buy"
- [ ] Approve transaction
- [ ] Success! (Your first free token)

### Step 11: Check Everything
- [ ] Go to: http://localhost:3001/explore
- [ ] See your token listed
- [ ] Click on it
- [ ] Verify stats show correctly

---

## ✅ Success Criteria

You should see:
- ✅ Token created with real mint address
- ✅ Supply showing on stats page
- ✅ Bonding curve price displayed
- ✅ Can buy tokens
- ✅ 2% fee going to your treasury

---

## 🐛 Common Issues

**"Program ID is missing"**
→ Check `.env.local` has `NEXT_PUBLIC_PROGRAM_ID=` filled in
→ Restart dev server after changing

**"Transaction failed"**
→ Make sure you initialized the launchpad first
→ Check you have enough SOL in wallet
→ Verify Program ID matches in both Rust and .env

**"Launchpad not initialized"**
→ Go to admin page and initialize first
→ Use your treasury wallet address

**Build fails in Playground**
→ Check Cargo.toml dependencies are correct
→ Make sure you copied the FULL lib.rs code

---

## 📊 What Happens Now

- Every token launch creates a real Solana SPL token
- First mint is free for each user
- After that, bonding curve pricing applies
- **You earn 2% of every purchase** → goes to your treasury wallet
- All token data is stored on-chain

---

## 🚀 Going to Mainnet (Real Money)

When ready for production:

1. Switch Solana Playground to "Mainnet Beta"
2. Get real SOL (~3-5 SOL for deployment)
3. Deploy the program to mainnet
4. Update `.env.local`:
   ```
   NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
   NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
   NEXT_PUBLIC_PROGRAM_ID=YourMainnetProgramID
   ```
5. Get your contracts audited (important!)
6. Deploy frontend to Vercel

**Cost**: ~2-5 SOL ($200-500 USD) for mainnet deployment

---

Need the full guide? See [SOLANA_PLAYGROUND_GUIDE.md](./SOLANA_PLAYGROUND_GUIDE.md)
