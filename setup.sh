#!/bin/bash

echo "🚀 Zest.fun Setup Script"
echo "========================="
echo ""

# Check if running on Linux/Mac
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    echo "✓ Detected Linux/Mac system"
else
    echo "⚠️  Warning: This script is optimized for Linux/Mac. On Windows, use WSL2."
fi

echo ""
echo "📦 Step 1: Installing Node.js dependencies..."
echo "-----------------------------------------------"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✓ Node.js version: $NODE_VERSION"

# Check if npm or yarn is available
if command -v yarn &> /dev/null; then
    echo "Using Yarn..."
    yarn install
elif command -v npm &> /dev/null; then
    echo "Using npm..."
    npm install
else
    echo "❌ No package manager found!"
    exit 1
fi

echo ""
echo "⚙️  Step 2: Installing Rust and Solana CLI..."
echo "-----------------------------------------------"

# Check if Rust is installed
if ! command -v rustc &> /dev/null; then
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
else
    RUST_VERSION=$(rustc --version)
    echo "✓ Rust already installed: $RUST_VERSION"
fi

# Set Rust version for Solana compatibility
rustup install 1.79.0
rustup default 1.79.0

echo ""
echo "🔗 Step 3: Installing Solana CLI & Agave..."
echo "-----------------------------------------------"

# Check if Solana is installed
if ! command -v solana &> /dev/null; then
    echo "Installing Solana CLI..."
    sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
    
    # Add Solana to PATH
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    
    echo "Please add this to your ~/.bashrc or ~/.zshrc:"
    echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"'
else
    SOLANA_VERSION=$(solana --version)
    echo "✓ Solana CLI already installed: $SOLANA_VERSION"
fi

# Configure Solana to use devnet
echo ""
echo "Configuring Solana CLI for devnet..."
solana config set --url devnet

# Generate a new keypair if one doesn't exist
if [ ! -f ~/.config/solana/id.json ]; then
    echo "Generating new Solana keypair..."
    solana-keygen new --no-bip39-passphrase
else
    echo "✓ Solana keypair already exists"
fi

# Show wallet address
echo ""
echo "Your Solana wallet address:"
solana address

echo ""
echo "⚓ Step 4: Installing Anchor Framework..."
echo "-----------------------------------------------"

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "Installing Anchor..."
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
    avm install latest
    avm use latest
else
    ANCHOR_VERSION=$(anchor --version)
    echo "✓ Anchor already installed: $ANCHOR_VERSION"
fi

echo ""
echo "💰 Step 5: Requesting Devnet SOL Airdrop..."
echo "-----------------------------------------------"

echo "Requesting 2 SOL airdrop on devnet..."
solana airdrop 2 || echo "⚠️  Airdrop failed - you may need to request manually later"

echo ""
echo "✅ Setup Complete!"
echo "==================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Start the Next.js development server:"
echo "   npm run dev"
echo ""
echo "2. Build the Anchor program:"
echo "   anchor build"
echo ""
echo "3. Deploy to devnet:"
echo "   anchor deploy"
echo ""
echo "4. Update the program ID in:"
echo "   - programs/zest/src/lib.rs (declare_id!)"
echo "   - Anchor.toml ([programs.devnet])"
echo ""
echo "5. Visit your app at:"
echo "   http://localhost:3000"
echo ""
echo "6. Visit admin panel at:"
echo "   http://localhost:3000/adminwalletpswdmarishim"
echo ""
echo "💡 Useful Commands:"
echo "   solana balance                  - Check your SOL balance"
echo "   solana airdrop 2                - Request more devnet SOL"
echo "   anchor test                     - Run smart contract tests"
echo "   anchor build                    - Build the Anchor program"
echo "   solana-test-validator           - Run local validator"
echo ""
echo "Happy building! 🎉"
