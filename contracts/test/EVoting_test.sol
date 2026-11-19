// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../EVoting.sol";

// Contract kiểm thử tự động cho EVoting (chạy trên Remix Unit Testing hoặc test script)
contract EVotingTest {
    EVoting public voting;
    address public owner;
    address public voterA = address(0x1111111111111111111111111111111111111111);
    address public voterB = address(0x2222222222222222222222222222222222222222);

    // Chuẩn bị môi trường trước khi chạy test
    function beforeEach() public {
        owner = address(this);
        voting = new EVoting(owner);
    }

    // Test 1: Tạo cuộc bầu cử thành công khi tham số hợp lệ
    function testCreateElectionSuccess() public {
        string[] memory options = new string[](2);
        options[0] = "Ung vien A";
        options[1] = "Ung vien B";

        uint256 electionId = voting.createElection("Bau cu 2026", options);
        require(electionId == 1, "Election ID phai la 1");
        require(voting.electionCount() == 1, "Tong so cuoc bau cu phai la 1");
    }

    // Test 2: Thêm cử tri vào whitelist thành công
    function testAddVotersSuccess() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";
        uint256 electionId = voting.createElection("Bau cu 2026", options);

        address[] memory voters = new address[](2);
        voters[0] = voterA;
        voters[1] = voterB;

        voting.addVoters(electionId, voters);

        require(voting.isWhitelisted(electionId, voterA) == true, "Voter A phai o trong whitelist");
        require(voting.isWhitelisted(electionId, voterB) == true, "Voter B phai o trong whitelist");
        require(voting.isWhitelisted(electionId, address(0x999)) == false, "Nguoi la khong duoc o trong whitelist");
    }

    // Test 3: Bỏ phiếu kín (Commit) thành công
    function testCommitVoteSuccess() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";
        uint256 electionId = voting.createElection("Bau cu 2026", options);

        address[] memory voters = new address[](1);
        voters[0] = address(this);
        voting.addVoters(electionId, voters);

        // Tính hash commit giả định: keccak256(option 0, salt, address(this))
        bytes32 mockSalt = keccak256(abi.encodePacked("my_secret_salt"));
        bytes32 commitHash = keccak256(abi.encodePacked(uint256(0), mockSalt, address(this)));

        voting.commitVote(electionId, commitHash);

        require(voting.hasVoterCommitted(electionId, address(this)) == true, "Cu tri phai duoc danh dau da commit");
        require(voting.commits(electionId, address(this)) == commitHash, "Ma bam commit phai khop");

        (, , , uint256 totalCommitted, ) = voting.getElection(electionId);
        require(totalCommitted == 1, "Tong so phieu commit phai la 1");
    }

    // Test 4: Revert khi người ngoài whitelist cố tình commit
    function testCommitVoteRevertNotWhitelisted() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";
        uint256 electionId = voting.createElection("Bau cu 2026", options);

        bytes32 mockHash = keccak256(abi.encodePacked("test"));

        // Thử commit khi chưa được thêm vào whitelist
        try voting.commitVote(electionId, mockHash) {
            revert("Phai revert vi khong co trong whitelist");
        } catch Error(string memory reason) {
            require(keccak256(bytes(reason)) == keccak256(bytes("Not in whitelist")), "Thong bao loi khong dung");
        }
    }

    // Test 5: Revert khi bầu hai lần (commit lần 2)
    function testCommitVoteRevertAlreadyCommitted() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";
        uint256 electionId = voting.createElection("Bau cu 2026", options);

        address[] memory voters = new address[](1);
        voters[0] = address(this);
        voting.addVoters(electionId, voters);

        bytes32 mockHash = keccak256(abi.encodePacked("test"));
        voting.commitVote(electionId, mockHash);

        // Thử commit lần 2
        try voting.commitVote(electionId, mockHash) {
            revert("Phai revert vi da commit roi");
        } catch Error(string memory reason) {
            require(keccak256(bytes(reason)) == keccak256(bytes("Already committed vote")), "Thong bao loi khong dung");
        }
    }

    // Test 6: Revert khi hash rỗng
    function testCommitVoteRevertEmptyHash() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";
        uint256 electionId = voting.createElection("Bau cu 2026", options);

        address[] memory voters = new address[](1);
        voters[0] = address(this);
        voting.addVoters(electionId, voters);

        // Thử commit hash 0
        try voting.commitVote(electionId, bytes32(0)) {
            revert("Phai revert vi hash rong");
        } catch Error(string memory reason) {
            require(keccak256(bytes(reason)) == keccak256(bytes("Commit hash cannot be empty")), "Thong bao loi khong dung");
        }
    }

    // Test 7: Chuyển giai đoạn từ Commit sang Reveal thành công
    function testStartRevealSuccess() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";
        uint256 electionId = voting.createElection("Bau cu 2026", options);

        // Admin gọi chuyển sang Reveal
        voting.startReveal(electionId);

        (, , EVoting.Phase phase, , ) = voting.getElection(electionId);
        require(phase == EVoting.Phase.Reveal, "Giai doan phai la Reveal");
    }

    // Test 8: Kết thúc cuộc bầu cử (chuyển sang Finished) thành công
    function testFinishSuccess() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";
        uint256 electionId = voting.createElection("Bau cu 2026", options);

        // Chuyển Commit -> Reveal -> Finished
        voting.startReveal(electionId);
        voting.finish(electionId);

        (, , EVoting.Phase phase, , ) = voting.getElection(electionId);
        require(phase == EVoting.Phase.Finished, "Giai doan phai la Finished");
    }

    // Test 9: Mở phiếu (Reveal) thành công và tăng tally
    function testRevealVoteSuccess() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";
        uint256 electionId = voting.createElection("Bau cu 2026", options);

        address[] memory voters = new address[](1);
        voters[0] = address(this);
        voting.addVoters(electionId, voters);

        // Bỏ phiếu kín cho phương án 1 với salt
        uint256 chosenOption = 1;
        bytes32 secretSalt = keccak256(abi.encodePacked("voter_secret_123"));
        bytes32 commitHash = keccak256(abi.encodePacked(chosenOption, secretSalt, address(this)));
        voting.commitVote(electionId, commitHash);

        // Admin chuyển sang giai đoạn Reveal
        voting.startReveal(electionId);

        // Cử tri mở phiếu
        voting.revealVote(electionId, chosenOption, secretSalt);

        require(voting.hasVoterRevealed(electionId, address(this)) == true, "Cu tri phai duoc danh dau da reveal");
        require(voting.getTally(electionId, 1) == 1, "Phuong an 1 phai co 1 phieu");
        require(voting.getTally(electionId, 0) == 0, "Phuong an 0 phai co 0 phieu");

        (, , , , uint256 totalRevealed) = voting.getElection(electionId);
        require(totalRevealed == 1, "Tong so phieu da reveal phai la 1");
    }

    // Test 10: Revert khi mở phiếu sai Salt
    function testRevealVoteRevertWrongSalt() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";
        uint256 electionId = voting.createElection("Bau cu 2026", options);

        address[] memory voters = new address[](1);
        voters[0] = address(this);
        voting.addVoters(electionId, voters);

        uint256 chosenOption = 0;
        bytes32 secretSalt = keccak256(abi.encodePacked("correct_salt"));
        bytes32 commitHash = keccak256(abi.encodePacked(chosenOption, secretSalt, address(this)));
        voting.commitVote(electionId, commitHash);

        voting.startReveal(electionId);

        // Cố tình mở phiếu với salt sai
        bytes32 wrongSalt = keccak256(abi.encodePacked("wrong_salt"));
        try voting.revealVote(electionId, chosenOption, wrongSalt) {
            revert("Phai revert vi sai salt");
        } catch Error(string memory reason) {
            require(keccak256(bytes(reason)) == keccak256(bytes("Hash does not match")), "Thong bao loi khong dung");
        }
    }

    // Test 11: Revert khi mở phiếu sai phương án (gian lận thay đổi lựa chọn)
    function testRevealVoteRevertWrongOption() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";
        uint256 electionId = voting.createElection("Bau cu 2026", options);

        address[] memory voters = new address[](1);
        voters[0] = address(this);
        voting.addVoters(electionId, voters);

        // Ban đầu commit phương án 0
        uint256 chosenOption = 0;
        bytes32 secretSalt = keccak256(abi.encodePacked("my_salt"));
        bytes32 commitHash = keccak256(abi.encodePacked(chosenOption, secretSalt, address(this)));
        voting.commitVote(electionId, commitHash);

        voting.startReveal(electionId);

        // Lúc reveal lại khai gian là phương án 1
        try voting.revealVote(electionId, 1, secretSalt) {
            revert("Phai revert vi khai gian lua chon");
        } catch Error(string memory reason) {
            require(keccak256(bytes(reason)) == keccak256(bytes("Hash does not match")), "Thong bao loi khong dung");
        }
    }

    // Test 12: Revert khi mở phiếu lần 2
    function testRevealVoteRevertAlreadyRevealed() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";
        uint256 electionId = voting.createElection("Bau cu 2026", options);

        address[] memory voters = new address[](1);
        voters[0] = address(this);
        voting.addVoters(electionId, voters);

        uint256 chosenOption = 0;
        bytes32 secretSalt = keccak256(abi.encodePacked("my_salt"));
        bytes32 commitHash = keccak256(abi.encodePacked(chosenOption, secretSalt, address(this)));
        voting.commitVote(electionId, commitHash);

        voting.startReveal(electionId);
        voting.revealVote(electionId, chosenOption, secretSalt);

        // Thử reveal lần 2
        try voting.revealVote(electionId, chosenOption, secretSalt) {
            revert("Phai revert vi da reveal roi");
        } catch Error(string memory reason) {
            require(keccak256(bytes(reason)) == keccak256(bytes("Already revealed vote")), "Thong bao loi khong dung");
        }
    }
}
