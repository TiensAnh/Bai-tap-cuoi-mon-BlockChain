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

    // Test 3: Revert khi danh sách cử tri bị rỗng
    function testAddVotersRevertEmptyList() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";
        uint256 electionId = voting.createElection("Bau cu 2026", options);

        address[] memory emptyList = new address[](0);
        try voting.addVoters(electionId, emptyList) {
            revert("Phai revert vi danh sach rong");
        } catch Error(string memory reason) {
            require(keccak256(bytes(reason)) == keccak256(bytes("Voter list cannot be empty")), "Thong bao loi khong dung");
        }
    }

    // Test 4: Revert khi danh sách cử tri chứa địa chỉ 0
    function testAddVotersRevertZeroAddress() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";
        uint256 electionId = voting.createElection("Bau cu 2026", options);

        address[] memory listWithZero = new address[](1);
        listWithZero[0] = address(0);

        try voting.addVoters(electionId, listWithZero) {
            revert("Phai revert vi dia chi 0");
        } catch Error(string memory reason) {
            require(keccak256(bytes(reason)) == keccak256(bytes("Invalid voter address")), "Thong bao loi khong dung");
        }
    }
}
