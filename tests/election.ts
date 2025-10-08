import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Election } from "../target/types/election";
import {startAnchor } from "anchor-bankrun";
import { BankrunProvider } from "anchor-bankrun";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";
const IDL = require("../target/idl/election.json");

const votingAddress =  new PublicKey("FebkUJTM4q6mfJopjHxGGrfkCuBBeeZG7vtVTkoer1Kb")

describe("election", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());


  it("Initialize poll", async () => {
     // Add your test here.
     const context =  await startAnchor("",[{name:"election",programId:votingAddress}], []);
     const provider = new BankrunProvider(context);
 
     const electionProgram = new Program<Election>(IDL, provider);
 
     const tx = await electionProgram.methods.initializePoll(new anchor.BN(1), "Who is the best programmer?", new anchor.BN(0), new anchor.BN(1859886428), new anchor.BN(3)).rpc();
     console.log("Your transaction signature", tx);
     const [pollAddress] = PublicKey.findProgramAddressSync([new anchor.BN(1).toArrayLike(Buffer, "le", 8)], votingAddress);
     const poll = await electionProgram.account.poll.fetch(pollAddress);
     console.log("Poll", poll);
     console.log("Poll address", pollAddress.toBase58());
     expect(poll.pollId.toNumber()).to.equal(1);
     expect(poll.description).to.equal("Who is the best programmer?");
     expect(poll.pollEndDate.toNumber()).to.be.greaterThan(poll.pollStartDate.toNumber());
     expect(poll.candidatesAmount.toNumber()).to.be.greaterThan(0);
  });
});
