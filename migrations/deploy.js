// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

const anchor = require("@coral-xyz/anchor");

module.exports = async function (provider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);

  // Add your deploy script here.
  console.log("🚀 Deploying Zest.fun to Solana...");
  console.log("Network:", provider.connection.rpcEndpoint);
  console.log("Wallet:", provider.wallet.publicKey.toString());
  
  // The program will be deployed automatically by `anchor deploy`
  // This script can be used for post-deployment initialization
  
  console.log("✅ Deployment complete!");
  console.log("\n📝 Next steps:");
  console.log("1. Copy your program ID from the deployment output");
  console.log("2. Update declare_id!() in programs/zest/src/lib.rs");
  console.log("3. Update Anchor.toml with the new program ID");
  console.log("4. Rebuild: anchor build");
  console.log("5. Initialize the launchpad with: anchor run initialize");
};
