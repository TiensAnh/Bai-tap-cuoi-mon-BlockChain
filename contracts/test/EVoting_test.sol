// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../EVoting.sol";

// Contract kiểm thử tự động cho EVoting (chạy trên Remix Unit Testing hoặc test script)
contract EVotingTest {
    EVoting public voting;
    address public owner;
    address public nonOwner = address(0x1234567890123456789012345678901234567890);

    // Chuẩn bị môi trường trước khi chạy test
    function beforeEach() public {
        owner = address(this);
        voting = new EVoting(owner);
    }

    // Test 1: Tạo cuộc bầu cử thành công khi tham số hợp lệ
    function testCreateElectionSuccess() public {
        string[] memory options = new string[](3);
        options[0] = "Ung vien A";
        options[1] = "Ung vien B";
        options[2] = "Ung vien C";

        uint256 electionId = voting.createElection("Bau cu 2026", options);
        require(electionId == 1, "Election ID phai la 1");
        require(voting.electionCount() == 1, "Tong so cuoc bau cu phai la 1");

        (string memory name, string[] memory opts, EVoting.Phase phase, uint256 committed, uint256 revealed) = voting.getElection(1);
        require(keccak256(bytes(name)) == keccak256(bytes("Bau cu 2026")), "Ten cuoc bau cu khong khop");
        require(opts.length == 3, "So luong lua chon phai la 3");
        require(phase == EVoting.Phase.Commit, "Giai doan ban dau phai la Commit");
        require(committed == 0, "So phieu commit ban dau phai la 0");
        require(revealed == 0, "So phieu revealed ban dau phai la 0");
    }

    // Test 2: Revert khi danh sách lựa chọn dưới 2
    function testCreateElectionRevertLessThanTwoOptions() public {
        string[] memory options = new string[](1);
        options[0] = "Ung vien duy nhat";

        // Thử tạo cuộc bầu cử chỉ có 1 lựa chọn
        try voting.createElection("Bau cu loi", options) {
            revert("Phai revert vi duoi 2 lua chon");
        } catch Error(string memory reason) {
            require(keccak256(bytes(reason)) == keccak256(bytes("Must have at least 2 options")), "Thong bao loi khong dung");
        }
    }

    // Test 3: Revert khi tên cuộc bầu cử bị rỗng
    function testCreateElectionRevertEmptyName() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        // Thử tạo cuộc bầu cử tên rỗng
        try voting.createElection("", options) {
            revert("Phai revert vi ten rong");
        } catch Error(string memory reason) {
            require(keccak256(bytes(reason)) == keccak256(bytes("Election name cannot be empty")), "Thong bao loi khong dung");
        }
    }
}
