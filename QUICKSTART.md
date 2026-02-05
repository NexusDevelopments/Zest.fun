# Zest.fun - Quick Reference Guide

## 🚀 Quick Start Commands

```bash
# First time setup (installs all dependencies)
./setup.sh

# Interactive development menu
./dev.sh

# Manual commands
npm run dev              # Start Next.js dev server
anchor build            # Build smart contract
anchor deploy           # Deploy to configured network
anchor test             # Run smart contract tests
```

## 📁 Key Files

### Frontend
- `app/page.tsx` - Homepage with features showcase
- `app/launch/page.tsx` - Token creation interface
- `app/adminwalletpswdmarishim/page.tsx` - Secure admin panel
- `components/Gingerswipe.tsx` - Custom security slider
- `app/globals.css` - Cyan glow effects and styling
- `tailwind.config.ts` - Theme configuration

### Smart Contract
- `programs/zest/src/lib.rs` - Main Anchor program
- `Anchor.toml` - Anchor configuration
- `tests/zest.ts` - Smart contract tests

### Configuration
- `package.json` - Node dependencies
- `Cargo.toml` - Rust workspace
- `.env.example` - Environment variables template

## 🎨 Cyan Neon Theme Classes

```tsx
// Text glow
<h1 className="neon-text">Glowing Cyan Text</h1>
<span className="cyan-glow">Subtle cyan glow</span>

// Borders and boxes
<div className="cyan-glow-border">Glowing border</div>
<div className="cyan-glow-box">Glowing box</div>

// Buttons
<button className="cyan-glow-button">Click Me</button>

// Animations
<div className="breathing-glow">Breathing effect</div>

// Tailwind utilities
<div className="shadow-cyan-glow">Box shadow glow</div>
<div className="drop-shadow-cyan-glow">Drop shadow glow</div>
```

## 🔐 Admin Panel Access

URL: `/adminwalletpswdmarishim`

Security Features:
1. **Gingerswipe**: Drag the ginger icon to the right
2. **WebAuthn**: Biometric fingerprint authentication
3. **Wallet Display**: Live SOL balance
4. **Withdraw Button**: Fund management

> ⚠️ For demo only. Production needs IP whitelisting, rate limiting, etc.

## 📜 Smart Contract Functions

### Initialize Launchpad
```rust
initialize(bonding_curve_constant: u64)
```
Sets up the launchpad with pricing constant.

### Create Token
```rust
create_token(name: String, symbol: String, uri: String)
```
Creates a new token with metadata.

### Mint Tokens
```rust
mint_token(amount: u64)
```
Logic:
- First call: Mints 1 FREE token (amount must be 1)
- Subsequent calls: Bonding curve pricing

### Bonding Curve Formula
```
Price = Constant × (Supply + i)²
Total = Σ(Constant × (Supply + i)²) for i in 0..amount
```

## 🌐 Networks

### Localnet
```bash
solana-test-validator           # Start local validator
solana config set --url localhost
anchor deploy
```

### Devnet
```bash
solana config set --url devnet
solana airdrop 2                # Get test SOL
anchor deploy
```

### Mainnet (Production)
```bash
solana config set --url mainnet-beta
anchor deploy
# ⚠️ Make sure to audit code first!
```

## 📦 Project Structure

```
Zest.fun/
├── app/                        # Next.js pages
│   ├── page.tsx               # Homepage
│   ├── launch/page.tsx        # Token launcher
│   ├── adminwalletpswdmarishim/page.tsx  # Admin
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/                 # React components
│   └── Gingerswipe.tsx        # Security slider
├── programs/                   # Anchor programs
│   └── zest/
│       └── src/lib.rs         # Smart contract
├── tests/                      # Test files
│   └── zest.ts               # Contract tests
├── migrations/                 # Deployment scripts
├── tailwind.config.ts         # Tailwind config
├── Anchor.toml                # Anchor config
├── setup.sh                   # Environment setup
├── dev.sh                     # Dev helper
└── package.json               # Dependencies
```

## 🔧 Common Tasks

### Update Program ID
After deploying, update these files:
1. `programs/zest/src/lib.rs`: 
   ```rust
   declare_id!("YOUR_NEW_PROGRAM_ID");
   ```
2. `Anchor.toml`:
   ```toml
   [programs.devnet]
   zest = "YOUR_NEW_PROGRAM_ID"
   ```

### Add Admin Wallet
Edit `app/adminwalletpswdmarishim/page.tsx`:
```typescript
const ADMIN_WALLET_ADDRESS = 'YourSolanaPublicKeyHere';
```

### Change Bonding Curve
When initializing:
```typescript
await program.methods
  .initialize(new BN(1000)) // Adjust this number
  .rpc();
```

### Customize Theme
Edit `tailwind.config.ts`:
```typescript
colors: {
  cyan: {
    neon: "#00FFFF",  // Change this
  }
}
```

## 🧪 Testing

### Run All Tests
```bash
anchor test
```

### Run Specific Test
```bash
anchor test -- --grep "mints first free token"
```

### Test on Devnet
```bash
solana config set --url devnet
anchor test --skip-build --skip-deploy
```

## 🐛 Troubleshooting

### "Program not deployed"
```bash
anchor build
anchor deploy
# Copy program ID and update files
```

### "Insufficient funds"
```bash
solana balance
solana airdrop 2  # On devnet/testnet only
```

### "RPC error"
Try different RPC:
```bash
solana config set --url https://api.devnet.solana.com
```

### Build errors
```bash
rm -rf target .anchor
anchor build
```

### WebAuthn not working
WebAuthn requires HTTPS in production. For local dev:
- Use `localhost` (not 127.0.0.1)
- Or set up local SSL certificate

## 📚 Resources

- [Solana Docs](https://docs.solana.com)
- [Anchor Book](https://book.anchor-lang.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion)

## 💡 Tips

1. **Always test on devnet** before mainnet
2. **Audit smart contracts** before production
3. **Use environment variables** for sensitive data
4. **Keep private keys secure** - never commit to git
5. **Request airdrops** on devnet for testing
6. **Monitor transaction fees** on mainnet

## 🎯 Next Steps

1. ✅ Run `./setup.sh` to install everything
2. ✅ Run `npm run dev` to start frontend
3. ✅ Build contract: `anchor build`
4. ✅ Deploy to devnet: `anchor deploy`
5. ✅ Update program IDs in code
6. ✅ Test the admin panel
7. ✅ Create your first token!

---

**Happy building!** 🎉

For questions, check the main [README.md](README.md)
