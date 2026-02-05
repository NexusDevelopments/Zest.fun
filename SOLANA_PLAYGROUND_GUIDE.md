# 🚀 Solana Playground Deployment Guide

## Deploy Your Zest.fun Smart Contract (No Installation Required!)

Follow these steps to deploy your Anchor program using Solana Playground and get your Program ID.

---

## Step 1: Open Solana Playground

1. Go to **https://beta.solpg.io** in your browser
2. Click "Create a new project"
3. Name it `zest` (or anything you like)
4. Select **"Anchor (Rust)"** as the framework
5. Click "Create"

---

## Step 2: Replace the Default Code

1. In the left sidebar, you'll see files. Click on `src/lib.rs`
2. **Delete all the default code**
3. Copy the code from your local file: `/workspaces/Zest.fun/programs/zest/src/lib.rs`
4. Paste it into the Solana Playground editor

**Your code should start with:**
```rust
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount, Transfer};

declare_id!("YOUR_PROGRAM_ID_HERE");
```

---

## Step 3: Update Cargo.toml (Dependencies)

1. Click on `Cargo.toml` in the left sidebar
2. Replace the `[dependencies]` section with:

```toml
[dependencies]
anchor-lang = "0.30.1"
anchor-spl = "0.30.1"
```

---

## Step 4: Build the Program

1. Click the **"Build"** button (🔨 icon) at the bottom left
2. Wait for the build to complete (may take 1-2 minutes)
3. You should see: ✅ **"Build successful"**

**If you see errors:**
- Check that you copied the full code from `lib.rs`
- Make sure `Cargo.toml` dependencies match

---

## Step 5: Get Free Devnet SOL

1. Click the **💰 wallet icon** at the bottom left
2. You'll see your playground wallet address
3. Click **"Airdrop"** to get 5 SOL (free test SOL on devnet)
4. Confirm you have balance showing (e.g., "5.0 SOL")

---

## Step 6: Deploy to Devnet

1. Click the **"Deploy"** button (🚀 icon) at the bottom left
2. Confirm the deployment in the popup
3. Wait 30-60 seconds for deployment
4. You should see: ✅ **"Deploy successful"**

---

## Step 7: Copy Your Program ID

After successful deployment, you'll see output like:

```
Program Id: Bx4Yc7kJHd8f2qX9nP3mW5vL1rZ6tK8sA2qB9gE3hN7j
```

**Copy this Program ID!** (It's a long string of letters and numbers)

---

## Step 8: Update Your Local Environment

1. Go back to your VS Code
2. Open the file `.env.local` in your workspace
3. Find the line that says:
   ```
   NEXT_PUBLIC_PROGRAM_ID=
   ```
4. Paste your Program ID after the `=`:
   ```
   NEXT_PUBLIC_PROGRAM_ID=Bx4Yc7kJHd8f2qX9nP3mW5vL1rZ6tK8sA2qB9gE3hN7j
   ```

---

## Step 9: Update the Rust Code (Important!)

1. In Solana Playground, go back to `src/lib.rs`
2. Find the line near the top that says:
   ```rust
   declare_id!("YOUR_PROGRAM_ID_HERE");
   ```
3. Replace `YOUR_PROGRAM_ID_HERE` with your actual Program ID
4. Click **"Build"** again
5. Click **"Deploy"** again (this updates the program)

---

## Step 10: Initialize the Launchpad

Now that your program is deployed, you need to initialize it:

1. Go to your Zest.fun app: `http://localhost:3001`
2. Go to the admin page: `http://localhost:3001/adminwalletpswdmarishim`
3. Connect your wallet (Phantom/Solflare)
4. Complete the Gingerswipe
5. In the **"Initialize Launchpad"** section:
   - **Treasury Wallet**: Paste your Freewallet Solana address
   - **Bonding Curve Constant**: Keep it as `1000` (or change if you want)
6. Click **"Initialize Launchpad"**
7. Approve the transaction in your wallet
8. Wait for confirmation (should say "Launchpad initialized successfully")

---

## Step 11: Launch Your First Token!

1. Go to: `http://localhost:3001/launch`
2. Connect your wallet
3. Fill in:
   - Token Name: "Test Coin"
   - Token Symbol: "TEST"
   - Description: "My first meme coin"
   - Image URL: Any image URL (or use: `https://via.placeholder.com/512`)
4. Click **"Launch Token"**
5. Approve the transaction
6. You'll be redirected to your token's page!

---

## ✅ You're Done!

Your Zest.fun is now running with a **real Solana smart contract** on devnet!

### What You Can Do Now:

- ✅ Launch real tokens
- ✅ View token stats at `/{tokenname}`
- ✅ Buy tokens using the bonding curve
- ✅ Collect 2% fees to your treasury wallet
- ✅ View all tokens at `/explore`

---

## 🔧 Troubleshooting

### "Program ID is missing" error
→ Make sure you added `NEXT_PUBLIC_PROGRAM_ID=` to `.env.local` and restarted the dev server (`npm run dev`)

### "Transaction simulation failed"
→ Make sure you:
1. Updated `declare_id!()` in the Rust code with your Program ID
2. Rebuilt and redeployed after updating
3. Initialized the launchpad first

### "Insufficient funds"
→ In Solana Playground, click "Airdrop" to get more devnet SOL

### Build fails in Playground
→ Check that `Cargo.toml` has:
```toml
anchor-lang = "0.30.1"
anchor-spl = "0.30.1"
```

---

## 📝 Important Notes

1. **Your playground wallet**: Solana Playground creates a wallet for you automatically. You can export the private key if you want to use it elsewhere.

2. **Devnet vs Mainnet**: You're deploying to **devnet** (test network). To go to mainnet (real money):
   - Switch Solana Playground to "Mainnet Beta"
   - Get real SOL (costs money)
   - Redeploy the program
   - Update your frontend to use mainnet

3. **Cost**: Deploying to devnet is **FREE**. Deploying to mainnet costs ~2-5 SOL (~$200-500 USD as of 2026).

4. **Your 2% Fee**: Every time someone mints tokens (after their free one), 2% automatically goes to your treasury wallet (the one you set during initialization).

---

## 🎉 Next Steps

- Share your token pages with friends
- Customize the bonding curve constant
- Add more tokens
- When ready, deploy to mainnet for real trading!

Need help? The Solana Playground has a built-in chat and documentation.
