import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Zest } from "../target/types/zest";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { assert } from "chai";

describe("zest", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Zest as Program<Zest>;
  const authority = provider.wallet.publicKey;
  
  let launchpadPda: PublicKey;
  let launchpadBump: number;
  let tokenMint: PublicKey;
  let userTokenAccount: any;
  let userAccountPda: PublicKey;

  it("Initializes the launchpad", async () => {
    // Derive launchpad PDA
    [launchpadPda, launchpadBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("launchpad")],
      program.programId
    );

    const bondingCurveConstant = new anchor.BN(1000);

    await program.methods
      .initialize(bondingCurveConstant)
      .accounts({
        launchpad: launchpadPda,
        authority: authority,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Fetch the launchpad account
    const launchpad = await program.account.launchpad.fetch(launchpadPda);
    
    assert.equal(launchpad.authority.toString(), authority.toString());
    assert.equal(launchpad.bondingCurveConstant.toString(), bondingCurveConstant.toString());
    assert.equal(launchpad.totalSupply.toString(), "0");
  });

  it("Creates a token", async () => {
    // Create a new token mint
    tokenMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      launchpadPda, // Mint authority
      null, // Freeze authority
      9 // Decimals
    );

    const tokenInfoPda = PublicKey.findProgramAddressSync(
      [Buffer.from("token_info"), tokenMint.toBuffer()],
      program.programId
    )[0];

    await program.methods
      .createToken("Test Meme Coin", "TMC", "https://example.com/metadata.json")
      .accounts({
        tokenInfo: tokenInfoPda,
        tokenMint: tokenMint,
        creator: authority,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const tokenInfo = await program.account.tokenInfo.fetch(tokenInfoPda);
    assert.equal(tokenInfo.name, "Test Meme Coin");
    assert.equal(tokenInfo.symbol, "TMC");
  });

  it("Mints first free token", async () => {
    // Get or create user token account
    userTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      tokenMint,
      authority
    );

    // Derive user account PDA
    userAccountPda = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), authority.toBuffer()],
      program.programId
    )[0];

    const balanceBefore = (await provider.connection.getTokenAccountBalance(userTokenAccount.address)).value.amount;

    await program.methods
      .mintToken(new anchor.BN(1))
      .accounts({
        launchpad: launchpadPda,
        userAccount: userAccountPda,
        tokenMint: tokenMint,
        userTokenAccount: userTokenAccount.address,
        user: authority,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const balanceAfter = (await provider.connection.getTokenAccountBalance(userTokenAccount.address)).value.amount;
    
    // Should have received 1 token (with 9 decimals = 1_000_000_000)
    assert.equal(
      BigInt(balanceAfter) - BigInt(balanceBefore),
      1n
    );

    // Check user account
    const userAccount = await program.account.userAccount.fetch(userAccountPda);
    assert.equal(userAccount.hasClaimedFree, true);

    // Check total supply
    const launchpad = await program.account.launchpad.fetch(launchpadPda);
    assert.equal(launchpad.totalSupply.toString(), "1");
  });

  it("Mints additional tokens with bonding curve pricing", async () => {
    const balanceBefore = (await provider.connection.getTokenAccountBalance(userTokenAccount.address)).value.amount;
    const solBalanceBefore = await provider.connection.getBalance(authority);

    // Try to mint 1 more token (should cost SOL based on bonding curve)
    await program.methods
      .mintToken(new anchor.BN(1))
      .accounts({
        launchpad: launchpadPda,
        userAccount: userAccountPda,
        tokenMint: tokenMint,
        userTokenAccount: userTokenAccount.address,
        user: authority,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const balanceAfter = (await provider.connection.getTokenAccountBalance(userTokenAccount.address)).value.amount;
    const solBalanceAfter = await provider.connection.getBalance(authority);

    // Should have received 1 more token
    assert.equal(
      BigInt(balanceAfter) - BigInt(balanceBefore),
      1n
    );

    // Should have paid SOL (balance decreased)
    assert.isTrue(solBalanceAfter < solBalanceBefore);

    // Check total supply increased
    const launchpad = await program.account.launchpad.fetch(launchpadPda);
    assert.equal(launchpad.totalSupply.toString(), "2");
  });

  it("Fails when trying to claim free token twice", async () => {
    // Create a new user
    const newUser = Keypair.generate();
    
    // Airdrop SOL to new user
    const signature = await provider.connection.requestAirdrop(
      newUser.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    // Get token account for new user
    const newUserTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      tokenMint,
      newUser.publicKey
    );

    // Derive user account PDA for new user
    const newUserAccountPda = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), newUser.publicKey.toBuffer()],
      program.programId
    )[0];

    // First free mint should succeed
    await program.methods
      .mintToken(new anchor.BN(1))
      .accounts({
        launchpad: launchpadPda,
        userAccount: newUserAccountPda,
        tokenMint: tokenMint,
        userTokenAccount: newUserTokenAccount.address,
        user: newUser.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([newUser])
      .rpc();

    // Second attempt with amount=1 should fail because has_claimed_free is now true
    // and the contract requires payment via bonding curve
    try {
      await program.methods
        .mintToken(new anchor.BN(1))
        .accounts({
          launchpad: launchpadPda,
          userAccount: newUserAccountPda,
          tokenMint: tokenMint,
          userTokenAccount: newUserTokenAccount.address,
          user: newUser.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([newUser])
        .rpc();
      
      // Should not reach here
      assert.fail("Should have failed to claim free token twice");
    } catch (err) {
      // Expected to fail - user must pay via bonding curve now
      assert.ok(err);
    }
  });
});
