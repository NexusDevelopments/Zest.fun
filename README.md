# Zest.fun 🚀

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/NexusDevelopments/Zest.fun)

A Solana-based meme coin launchpad with a unique "1 Free Coin" mechanism and bonding curve pricing.

> **🚀 Ready for Vercel Deployment!** See [DEPLOY.md](./DEPLOY.md) for one-click deployment instructions.

## Features

- **Cyan Neon Aesthetic**: Beautiful cyberpunk-inspired UI with glowing cyan effects
- **Free First Coin**: Every user gets their first token for free
- **Bonding Curve Economics**: Fair pricing using quadratic bonding curve (Price = Constant × Supply²)
- **Gingerswipe Security**: Custom drag-to-unlock + WebAuthn biometric authentication for admin access
- **Built on Solana**: Fast, low-cost transactions using Anchor framework

## Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **Tailwind CSS**: Utility-first styling with custom cyan theme
- **Framer Motion**: Smooth animations and breathing glow effects
- **Lucide React**: Beautiful icon set
- **@solana/web3.js**: Solana blockchain interaction
- **@solana/wallet-adapter**: Wallet connection support

### Backend (Smart Contract)
- **Anchor Framework**: Solana smart contract development
- **Rust**: Smart contract language
- **SPL Token**: Solana token standard

## Project Structure

```
Zest.fun/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── launch/page.tsx                   # Token launch interface
│   ├── adminwalletpswdmarishim/page.tsx  # Secure admin panel
│   ├── layout.tsx                        # Root layout
│   └── globals.css                       # Global styles with cyan glow classes
├── components/
│   └── Gingerswipe.tsx                   # Custom security slider component
├── programs/
│   └── zest/
│       ├── src/
│       │   └── lib.rs                    # Anchor smart contract
│       └── Cargo.toml
├── tailwind.config.ts                    # Tailwind with cyan neon theme
├── Anchor.toml                           # Anchor configuration
├── setup.sh                              # Environment setup script
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- Rust 1.79.0
- Solana CLI
- Anchor Framework

### Quick Setup

Run the automated setup script:

```bash
chmod +x setup.sh
./setup.sh
```

This will:
1. Install Node.js dependencies
2. Install Rust and set correct version
3. Install Solana CLI and Agave
4. Install Anchor Framework
5. Configure Solana for devnet
6. Request devnet SOL airdrop

### Manual Setup

1. **Install Dependencies**
```bash
npm install
# or
yarn install
```

2. **Install Solana CLI**
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

3. **Configure Solana**
```bash
solana config set --url devnet
solana-keygen new
```

4. **Install Anchor**
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

5. **Build Smart Contract**
```bash
anchor build
```

6. **Deploy to Devnet**
```bash
anchor deploy
```

7. **Update Program ID**
After deploying, update the program ID in:
- `programs/zest/src/lib.rs`: Update `declare_id!("YOUR_PROGRAM_ID")`
- `Anchor.toml`: Update program IDs in `[programs.devnet]`

8. **Start Development Server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Key Pages

- **Home**: [http://localhost:3000](http://localhost:3000)
- **Launch Token**: [http://localhost:3000/launch](http://localhost:3000/launch)
- **Admin Panel**: [http://localhost:3000/adminwalletpswdmarishim](http://localhost:3000/adminwalletpswdmarishim)

## Smart Contract Functions

### `initialize`
Initialize the launchpad with bonding curve constant.

### `mint_token`
Mint tokens with free first coin logic:
- First token: FREE (0 SOL)
- Subsequent tokens: Bonding curve pricing (Price = Constant × Supply²)

### `create_token`
Create a new token launch with metadata.

## Bonding Curve Formula

```
Price(n) = Constant × (Current_Supply + n)²

Total_Cost = Σ(Constant × (Supply + i)²) for i in 0..amount
```

## Admin Security

The admin panel (`/adminwalletpswdmarishim`) features:
1. **Gingerswipe**: Custom drag-to-unlock slider
2. **WebAuthn**: Biometric fingerprint authentication
3. **Wallet Display**: Real-time Solana wallet balance
4. **Secure Withdrawal**: Protected fund management

## Customization

### Update Admin Wallet
Edit `/app/adminwalletpswdmarishim/page.tsx`:
```typescript
const ADMIN_WALLET_ADDRESS = 'YOUR_ADMIN_WALLET_PUBLIC_KEY_HERE';
```

### Adjust Bonding Curve
Modify the constant when initializing:
```rust
// In your initialization code
initialize(ctx, bonding_curve_constant: 1000)
```

### Theme Colors
Edit `tailwind.config.ts` to customize the cyan theme.

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Anchor tests
anchor test

# Build smart contract
anchor build

# Deploy to devnet
anchor deploy

# Run local validator
solana-test-validator
```

## Solana CLI Commands

```bash
# Check balance
solana balance

# Request airdrop (devnet)
solana airdrop 2

# Check config
solana config get

# View wallet address
solana address
```

## Testing Locally

1. Start local validator:
```bash
solana-test-validator
```

2. In another terminal, set config to localhost:
```bash
solana config set --url localhost
```

3. Deploy:
```bash
anchor deploy
```

4. Start Next.js:
```bash
npm run dev
```

## Deployment

### 🚀 Deploy Frontend to Vercel (Recommended)

**One-Click Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/NexusDevelopments/Zest.fun)

**Quick Steps:**
1. Push code to GitHub
2. Visit [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Click "Deploy"
5. Add environment variables:
   ```
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
   NEXT_PUBLIC_PROGRAM_ID=YourProgramIdHere
   ```
6. Redeploy

📖 **Full guide:** [DEPLOY.md](./DEPLOY.md)

### ⚡ Deploy Smart Contract
```bash
solana config set --url devnet
anchor build
anchor deploy
```

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel, Netlify, or your preferred host
```

## Security Notes

⚠️ **Important**: 
- The admin panel is for demonstration. In production, implement:
  - IP whitelisting
  - Rate limiting
  - Secure key management (HSM, MPC)
  - Additional authentication layers
  - Audit logging

- Never commit private keys to version control
- Use environment variables for sensitive data
- Audit smart contracts before mainnet deployment

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues:
- Open a GitHub issue
- Check Solana documentation: https://docs.solana.com
- Anchor documentation: https://www.anchor-lang.com

## Acknowledgments

- Solana Foundation
- Anchor Framework
- Next.js Team
- Tailwind CSS

---

Built with ❤️ on Solana

**Zest.fun** - Where meme coins get their zest! 🎉