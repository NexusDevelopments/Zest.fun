#!/bin/bash

# Quick start script for Zest.fun development

echo "🚀 Starting Zest.fun Development Environment"
echo "=============================================="
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "⚠️  Solana CLI not found!"
    echo "Run ./setup.sh first to install all dependencies"
    exit 1
fi

# Check if anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "⚠️  Anchor not found!"
    echo "Run ./setup.sh first to install Anchor"
    exit 1
fi

echo "✓ All dependencies found"
echo ""

# Ask user what to run
echo "What would you like to do?"
echo "1) Start Next.js dev server (frontend)"
echo "2) Build Anchor program (smart contract)"
echo "3) Run local Solana validator"
echo "4) Deploy to devnet"
echo "5) Run tests"
echo "6) All of the above (full setup)"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        echo "Starting Next.js development server..."
        npm run dev
        ;;
    2)
        echo "Building Anchor program..."
        anchor build
        echo ""
        echo "✅ Build complete!"
        echo "Program artifacts in: target/deploy/"
        ;;
    3)
        echo "Starting local Solana validator..."
        echo "Press Ctrl+C to stop"
        solana-test-validator
        ;;
    4)
        echo "Deploying to devnet..."
        solana config set --url devnet
        anchor build
        anchor deploy
        echo ""
        echo "✅ Deployed to devnet!"
        echo ""
        echo "⚠️  Don't forget to update the program ID in:"
        echo "  - programs/zest/src/lib.rs"
        echo "  - Anchor.toml"
        ;;
    5)
        echo "Running tests..."
        anchor test
        ;;
    6)
        echo "🎯 Full setup sequence starting..."
        echo ""
        
        echo "Step 1: Building Anchor program..."
        anchor build
        echo ""
        
        echo "Step 2: Starting local validator in background..."
        solana-test-validator > validator.log 2>&1 &
        VALIDATOR_PID=$!
        echo "Validator PID: $VALIDATOR_PID"
        
        echo "Waiting for validator to start..."
        sleep 5
        
        echo "Step 3: Setting config to localhost..."
        solana config set --url localhost
        
        echo "Step 4: Deploying program..."
        anchor deploy
        
        echo "Step 5: Running tests..."
        anchor test --skip-local-validator
        
        echo "Step 6: Starting Next.js dev server..."
        echo "Validator is running in background (PID: $VALIDATOR_PID)"
        echo "To stop validator later: kill $VALIDATOR_PID"
        echo ""
        npm run dev
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
