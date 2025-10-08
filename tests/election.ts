import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Election } from "../target/types/election";
import { assert } from "chai";
const IDL = require("../target/idl/election.json");

describe("election", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.election as Program<Election>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  it("Initialize poll", async () => {
    // Test data
    const pollId = new anchor.BN(1);
    const description = "Test Election Poll";
    const pollStartDate = new anchor.BN(Math.floor(Date.now() / 1000)); // Current timestamp
    const pollEndDate = new anchor.BN(Math.floor(Date.now() / 1000) + 86400); // 24 hours later
    const candidatesAmount = new anchor.BN(3);

    // Get the provider and signer
    const provider = anchor.getProvider();
    const signer = provider.wallet;

    // Derive the poll PDA
    const [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Call the initialize_poll function
    const tx = await program.methods
      .initializePoll(pollId, description, pollStartDate, pollEndDate, candidatesAmount)
      .rpc();

    console.log("Initialize poll transaction signature:", tx);

    // Fetch and verify the poll account
    const pollAccount = await program.account.poll.fetch(pollPda);
    
    // Verify the poll data
    assert.equal(pollAccount.pollId.toString(), pollId.toString());
    assert.equal(pollAccount.description, description);
    assert.equal(pollAccount.pollStartDate.toString(), pollStartDate.toString());
    assert.equal(pollAccount.pollEndDate.toString(), pollEndDate.toString());
    assert.equal(pollAccount.candidatesAmount.toString(), candidatesAmount.toString());

    console.log("Poll initialized successfully:", {
      pollId: pollAccount.pollId.toString(),
      description: pollAccount.description,
      startDate: pollAccount.pollStartDate.toString(),
      endDate: pollAccount.pollEndDate.toString(),
      candidatesAmount: pollAccount.candidatesAmount.toString()
    });
  });

  it("Should fail to initialize poll with duplicate poll_id", async () => {
    // Test data - using same poll_id as previous test
    const pollId = new anchor.BN(1);
    const description = "Duplicate Poll Test";
    const pollStartDate = new anchor.BN(Math.floor(Date.now() / 1000));
    const pollEndDate = new anchor.BN(Math.floor(Date.now() / 1000) + 86400);
    const candidatesAmount = new anchor.BN(2);

    const provider = anchor.getProvider();
    const signer = provider.wallet;

    // Derive the poll PDA (same as before)
    const [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // This should fail because the poll account already exists
    try {
      await program.methods
        .initializePoll(pollId, description, pollStartDate, pollEndDate, candidatesAmount)
        .rpc();
      
      // If we reach here, the test should fail
      assert.fail("Expected transaction to fail due to duplicate poll_id");
    } catch (error) {
      // Expected to fail
      console.log("Correctly failed to initialize duplicate poll:", error.message);
      assert.include(error.message, "already in use");
    }
  });

  it("Should initialize poll with different poll_id", async () => {
    // Test data - using different poll_id
    const pollId = new anchor.BN(2);
    const description = "Second Poll Test";
    const pollStartDate = new anchor.BN(Math.floor(Date.now() / 1000));
    const pollEndDate = new anchor.BN(Math.floor(Date.now() / 1000) + 86400);
    const candidatesAmount = new anchor.BN(4);

    const provider = anchor.getProvider();
    const signer = provider.wallet;

    // Derive the poll PDA
    const [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Call the initialize_poll function
    const tx = await program.methods
      .initializePoll(pollId, description, pollStartDate, pollEndDate, candidatesAmount)
      .rpc();

    console.log("Second poll transaction signature:", tx);

    // Fetch and verify the poll account
    const pollAccount = await program.account.poll.fetch(pollPda);
    
    // Verify the poll data
    assert.equal(pollAccount.pollId.toString(), pollId.toString());
    assert.equal(pollAccount.description, description);
    assert.equal(pollAccount.candidatesAmount.toString(), candidatesAmount.toString());

    console.log("Second poll initialized successfully with poll_id:", pollAccount.pollId.toString());
  });

  it("Should initialize poll with maximum description length", async () => {
    // Test data with maximum description length (280 characters as per the Rust code)
    const pollId = new anchor.BN(3);
    const description = "A".repeat(280); // Maximum allowed length
    const pollStartDate = new anchor.BN(Math.floor(Date.now() / 1000));
    const pollEndDate = new anchor.BN(Math.floor(Date.now() / 1000) + 86400);
    const candidatesAmount = new anchor.BN(5);

    const provider = anchor.getProvider();
    const signer = provider.wallet;

    // Derive the poll PDA
    const [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Call the initialize_poll function
    const tx = await program.methods
      .initializePoll(pollId, description, pollStartDate, pollEndDate, candidatesAmount)
      .rpc();

    console.log("Max description poll transaction signature:", tx);

    // Fetch and verify the poll account
    const pollAccount = await program.account.poll.fetch(pollPda);
    
    // Verify the poll data
    assert.equal(pollAccount.pollId.toString(), pollId.toString());
    assert.equal(pollAccount.description, description);
    assert.equal(pollAccount.description.length, 280);
    assert.equal(pollAccount.candidatesAmount.toString(), candidatesAmount.toString());

    console.log("Poll with max description initialized successfully");
  });

  it("Should initialize poll with zero candidates", async () => {
    // Test data with zero candidates
    const pollId = new anchor.BN(4);
    const description = "Poll with zero candidates";
    const pollStartDate = new anchor.BN(Math.floor(Date.now() / 1000));
    const pollEndDate = new anchor.BN(Math.floor(Date.now() / 1000) + 86400);
    const candidatesAmount = new anchor.BN(0);

    const provider = anchor.getProvider();
    const signer = provider.wallet;

    // Derive the poll PDA
    const [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Call the initialize_poll function
    const tx = await program.methods
      .initializePoll(pollId, description, pollStartDate, pollEndDate, candidatesAmount)
      .rpc();

    console.log("Zero candidates poll transaction signature:", tx);

    // Fetch and verify the poll account
    const pollAccount = await program.account.poll.fetch(pollPda);
    
    // Verify the poll data
    assert.equal(pollAccount.pollId.toString(), pollId.toString());
    assert.equal(pollAccount.description, description);
    assert.equal(pollAccount.candidatesAmount.toString(), "0");

    console.log("Poll with zero candidates initialized successfully");
  });
});
