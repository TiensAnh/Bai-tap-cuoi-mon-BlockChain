// Bo test bao mat va kiem thu chuc nang cho Smart Contract EVoting quy trinh 4 giai doan
const { expect } = require("chai");
const hre = require("hardhat");

describe("EVoting Smart Contract Security & Functional Test Suite", function () {
  let evoting;
  let owner;
  let voter1;
  let voter2;
  let attacker;

  beforeEach(async function () {
    // Lay danh sach cac vi kiem thu
    [owner, voter1, voter2, attacker] = await hre.ethers.getSigners();

    // Trien khai hop dong voi owner
    const EVoting = await hre.ethers.getContractFactory("EVoting");
    evoting = await EVoting.deploy(owner.address);
    await evoting.waitForDeployment();
  });

  // ==========================================
  // NHOM 1: KHOI TAO VA GIAI DOAN REGISTRATION
  // ==========================================
  describe("Nhom 1: Khoi tao va Quan ly Whitelist (Registration)", function () {
    it("Test 1: Tao cuoc bau cu thanh cong o giai doan Registration (0)", async function () {
      const options = ["Ung vien A", "Ung vien B"];
      await expect(evoting.createElection("Bau cu Dai hoi 2026", options))
        .to.emit(evoting, "ElectionCreated")
        .withArgs(1, "Bau cu Dai hoi 2026", options);

      expect(await evoting.electionCount()).to.equal(1);
      const election = await evoting.getElection(1);
      expect(election.name).to.equal("Bau cu Dai hoi 2026");
      expect(election.options.length).to.equal(2);
      expect(election.phase).to.equal(0); // 0: Registration
    });

    it("Test 2: Them cu tri vao Whitelist va doc danh sach getVoters", async function () {
      await evoting.createElection("Bau cu 2026", ["A", "B"]);
      await evoting.addVoters(1, [voter1.address, voter2.address]);

      expect(await evoting.isWhitelisted(1, voter1.address)).to.be.true;
      expect(await evoting.isWhitelisted(1, voter2.address)).to.be.true;
      expect(await evoting.isWhitelisted(1, attacker.address)).to.be.false;

      const voters = await evoting.getVoters(1);
      expect(voters.length).to.equal(2);
      expect(voters[0]).to.equal(voter1.address);
      expect(voters[1]).to.equal(voter2.address);
      expect(await evoting.getVoterCount(1)).to.equal(2);
    });

    it("Test 3: Chot danh sach cu tri va bat dau giai doan Commit", async function () {
      await evoting.createElection("Bau cu 2026", ["A", "B"]);
      await evoting.addVoters(1, [voter1.address]);

      await expect(evoting.startCommit(1))
        .to.emit(evoting, "PhaseChanged")
        .withArgs(1, 1); // 1: Commit

      const election = await evoting.getElection(1);
      expect(election.phase).to.equal(1); // 1: Commit
    });

    it("Test 4: Revert khi them cu tri sau khi da chot danh sach (khoa Whitelist)", async function () {
      await evoting.createElection("Bau cu 2026", ["A", "B"]);
      await evoting.addVoters(1, [voter1.address]);
      await evoting.startCommit(1); // Khoa Whitelist

      // Co tinh them cu tri sau khi da vao giai doan Commit
      await expect(
        evoting.addVoters(1, [voter2.address])
      ).to.be.revertedWith("Invalid phase for this action");
    });
  });

  // ==========================================
  // NHOM 2: GIAI DOAN COMMIT (BO PHIEU KIN)
  // ==========================================
  describe("Nhom 2: Giai doan Commit (Bo phieu kin)", function () {
    beforeEach(async function () {
      await evoting.createElection("Bau cu 2026", ["A", "B"]);
      await evoting.addVoters(1, [voter1.address, voter2.address]);
      await evoting.startCommit(1); // Chuyen sang Commit
    });

    it("Test 5: Bo phieu kin (Commit) thanh cong", async function () {
      const optionIndex = 0;
      const secretSalt = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("salt_voter1"));
      const commitHash = hre.ethers.solidityPackedKeccak256(
        ["uint256", "bytes32", "address"],
        [optionIndex, secretSalt, voter1.address]
      );

      await expect(evoting.connect(voter1).commitVote(1, commitHash))
        .to.emit(evoting, "VoteCommitted")
        .withArgs(1, voter1.address, commitHash);

      expect(await evoting.hasVoterCommitted(1, voter1.address)).to.be.true;
      const election = await evoting.getElection(1);
      expect(election.totalCommitted).to.equal(1);
    });

    it("Test 6: Revert khi nguoi ngoai Whitelist co tinh commit", async function () {
      const mockHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("random_commit"));
      await expect(
        evoting.connect(attacker).commitVote(1, mockHash)
      ).to.be.revertedWith("Not in whitelist");
    });

    it("Test 7: Revert khi bo phieu hai lan (Already committed)", async function () {
      const secretSalt = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("salt_voter1"));
      const commitHash = hre.ethers.solidityPackedKeccak256(
        ["uint256", "bytes32", "address"],
        [0, secretSalt, voter1.address]
      );

      await evoting.connect(voter1).commitVote(1, commitHash);

      await expect(
        evoting.connect(voter1).commitVote(1, commitHash)
      ).to.be.revertedWith("Already committed vote");
    });
  });

  // ==========================================
  // NHOM 3: GIAI DOAN REVEAL VA KET THUC
  // ==========================================
  describe("Nhom 3: Giai doan Reveal va Ket thuc", function () {
    const chosenOption = 1;
    const secretSalt = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("my_secret_salt_123"));
    let commitHash;

    beforeEach(async function () {
      await evoting.createElection("Bau cu 2026", ["A", "B"]);
      await evoting.addVoters(1, [voter1.address]);
      await evoting.startCommit(1);

      commitHash = hre.ethers.solidityPackedKeccak256(
        ["uint256", "bytes32", "address"],
        [chosenOption, secretSalt, voter1.address]
      );
      await evoting.connect(voter1).commitVote(1, commitHash);
      await evoting.startReveal(1);
    });

    it("Test 8: Mo phieu (Reveal) thanh cong va tang tally kiem dem", async function () {
      await expect(evoting.connect(voter1).revealVote(1, chosenOption, secretSalt))
        .to.emit(evoting, "VoteRevealed")
        .withArgs(1, voter1.address, chosenOption);

      expect(await evoting.hasVoterRevealed(1, voter1.address)).to.be.true;
      expect(await evoting.getTally(1, chosenOption)).to.equal(1);
      expect(await evoting.getTally(1, 0)).to.equal(0);
    });

    it("Test 9: Revert khi mo phieu sai ma Salt", async function () {
      const wrongSalt = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("wrong_salt"));
      await expect(
        evoting.connect(voter1).revealVote(1, chosenOption, wrongSalt)
      ).to.be.revertedWith("Hash does not match");
    });

    it("Test 10: Ket thuc cuoc bau cu va doc ket qua getResults", async function () {
      await evoting.connect(voter1).revealVote(1, chosenOption, secretSalt);
      await evoting.finish(1);

      const election = await evoting.getElection(1);
      expect(election.phase).to.equal(3); // 3: Finished

      const results = await evoting.getResults(1);
      expect(results[0]).to.equal(0);
      expect(results[1]).to.equal(1);
    });
  });
});
