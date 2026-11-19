// Bo test bao mat va kiem thu chuc nang cho Smart Contract EVoting (Task T010)
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
  // NHOM 1: KHOI TAO VA WHITELIST
  // ==========================================
  describe("Nhom 1: Khoi tao va Quan ly Whitelist", function () {
    it("Test 1: Tao cuoc bau cu thanh cong khi tham so hop le", async function () {
      const options = ["Ung vien A", "Ung vien B"];
      await expect(evoting.createElection("Bau cu Dai hoi 2026", options))
        .to.emit(evoting, "ElectionCreated")
        .withArgs(1, "Bau cu Dai hoi 2026", options);

      expect(await evoting.electionCount()).to.equal(1);
      const election = await evoting.getElection(1);
      expect(election.name).to.equal("Bau cu Dai hoi 2026");
      expect(election.options.length).to.equal(2);
      expect(election.phase).to.equal(0); // 0: Commit
    });

    it("Test 2: Them cu tri vao Whitelist thanh cong", async function () {
      await evoting.createElection("Bau cu 2026", ["A", "B"]);
      await evoting.addVoters(1, [voter1.address, voter2.address]);

      expect(await evoting.isWhitelisted(1, voter1.address)).to.be.true;
      expect(await evoting.isWhitelisted(1, voter2.address)).to.be.true;
      expect(await evoting.isWhitelisted(1, attacker.address)).to.be.false;
    });

    it("Test 4: Revert khi nguoi ngoai Whitelist co tinh commit", async function () {
      await evoting.createElection("Bau cu 2026", ["A", "B"]);
      const mockHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("random_commit"));

      // Attacker khong co trong whitelist goi commitVote
      await expect(
        evoting.connect(attacker).commitVote(1, mockHash)
      ).to.be.revertedWith("Not in whitelist");
    });
  });

  // ==========================================
  // NHOM 2: GIAI DOAN COMMIT (BO PHIEU KIN)
  // ==========================================
  describe("Nhom 2: Giai doan Commit (Bo phieu kin)", function () {
    beforeEach(async function () {
      await evoting.createElection("Bau cu 2026", ["A", "B"]);
      await evoting.addVoters(1, [voter1.address, voter2.address]);
    });

    it("Test 3: Bo phieu kin (Commit) thanh cong", async function () {
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

    it("Test 5: Revert khi bo phieu hai lan (Already committed)", async function () {
      const secretSalt = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("salt_voter1"));
      const commitHash = hre.ethers.solidityPackedKeccak256(
        ["uint256", "bytes32", "address"],
        [0, secretSalt, voter1.address]
      );

      // Commit lan 1 thanh cong
      await evoting.connect(voter1).commitVote(1, commitHash);

      // Co tinh commit lan 2
      await expect(
        evoting.connect(voter1).commitVote(1, commitHash)
      ).to.be.revertedWith("Already committed vote");
    });

    it("Test 6: Revert khi commit ma hash rong", async function () {
      await expect(
        evoting.connect(voter1).commitVote(1, hre.ethers.ZeroHash)
      ).to.be.revertedWith("Commit hash cannot be empty");
    });
  });

  // ==========================================
  // NHOM 3: CHUYEN GIAI DOAN
  // ==========================================
  describe("Nhom 3: Chuyen giai doan cuoc bau cu", function () {
    beforeEach(async function () {
      await evoting.createElection("Bau cu 2026", ["A", "B"]);
    });

    it("Test 7: Chuyen giai doan tu Commit sang Reveal thanh cong", async function () {
      await expect(evoting.startReveal(1))
        .to.emit(evoting, "PhaseChanged")
        .withArgs(1, 1); // 1: Reveal

      const election = await evoting.getElection(1);
      expect(election.phase).to.equal(1);
    });

    it("Test 8: Ket thuc cuoc bau cu (chuyen sang Finished) thanh cong", async function () {
      await evoting.startReveal(1);
      await expect(evoting.finish(1))
        .to.emit(evoting, "PhaseChanged")
        .withArgs(1, 2); // 2: Finished

      const election = await evoting.getElection(1);
      expect(election.phase).to.equal(2);
    });
  });

  // ==========================================
  // NHOM 4: GIAI DOAN REVEAL (MO PHIEU)
  // ==========================================
  describe("Nhom 4: Giai doan Reveal (Mo phieu & Kiem dem)", function () {
    const chosenOption = 1;
    const secretSalt = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("my_secret_salt_123"));
    let commitHash;

    beforeEach(async function () {
      await evoting.createElection("Bau cu 2026", ["A", "B"]);
      await evoting.addVoters(1, [voter1.address]);

      // Voter 1 bo phieu kin
      commitHash = hre.ethers.solidityPackedKeccak256(
        ["uint256", "bytes32", "address"],
        [chosenOption, secretSalt, voter1.address]
      );
      await evoting.connect(voter1).commitVote(1, commitHash);

      // Chuyen sang giai doan Reveal
      await evoting.startReveal(1);
    });

    it("Test 9: Mo phieu (Reveal) thanh cong va tang tally kiem dem", async function () {
      await expect(evoting.connect(voter1).revealVote(1, chosenOption, secretSalt))
        .to.emit(evoting, "VoteRevealed")
        .withArgs(1, voter1.address, chosenOption);

      expect(await evoting.hasVoterRevealed(1, voter1.address)).to.be.true;
      expect(await evoting.getTally(1, chosenOption)).to.equal(1);
      expect(await evoting.getTally(1, 0)).to.equal(0);

      const election = await evoting.getElection(1);
      expect(election.totalRevealed).to.equal(1);
    });

    it("Test 10: Revert khi mo phieu sai ma Salt", async function () {
      const wrongSalt = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("wrong_salt"));
      await expect(
        evoting.connect(voter1).revealVote(1, chosenOption, wrongSalt)
      ).to.be.revertedWith("Hash does not match");
    });

    it("Test 11: Revert khi gian lan thay doi phuong an da bau", async function () {
      const fakeOption = 0; // Commit phuong an 1 nhung lai reveal phuong an 0
      await expect(
        evoting.connect(voter1).revealVote(1, fakeOption, secretSalt)
      ).to.be.revertedWith("Hash does not match");
    });

    it("Test 12: Revert khi mo phieu hai lan", async function () {
      // Mo phieu lan 1 thanh cong
      await evoting.connect(voter1).revealVote(1, chosenOption, secretSalt);

      // Co tinh mo phieu lan 2
      await expect(
        evoting.connect(voter1).revealVote(1, chosenOption, secretSalt)
      ).to.be.revertedWith("Already revealed vote");
    });
  });

  // ==========================================
  // NHOM 5: CONG BO KET QUA
  // ==========================================
  describe("Nhom 5: Cong bo ket qua cuoc bau cu", function () {
    it("Test 13: Doc ket qua bau cu thanh cong khi da Finished", async function () {
      await evoting.createElection("Bau cu 2026", ["A", "B"]);
      await evoting.addVoters(1, [voter1.address]);

      const salt = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("salt"));
      const commitHash = hre.ethers.solidityPackedKeccak256(
        ["uint256", "bytes32", "address"],
        [1, salt, voter1.address]
      );

      await evoting.connect(voter1).commitVote(1, commitHash);
      await evoting.startReveal(1);
      await evoting.connect(voter1).revealVote(1, 1, salt);
      await evoting.finish(1);

      const results = await evoting.getResults(1);
      expect(results.length).to.equal(2);
      expect(results[0]).to.equal(0);
      expect(results[1]).to.equal(1);
    });

    it("Test 14: Revert khi doc ket qua khi cuoc bau cu chua ket thuc", async function () {
      await evoting.createElection("Bau cu 2026", ["A", "B"]);
      // Cuoc bau cu moi o giai doan Commit
      await expect(evoting.getResults(1)).to.be.revertedWith(
        "Invalid phase for this action"
      );
    });
  });
});
