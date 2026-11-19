// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import Ownable từ thư viện OpenZeppelin v5 để quản lý quyền admin
import "@openzeppelin/contracts/access/Ownable.sol";

// Hợp đồng thông minh bỏ phiếu điện tử EVoting kế thừa Ownable
contract EVoting is Ownable {
    // Khởi tạo contract và gán người deploy làm owner ban đầu
    constructor(address initialOwner) Ownable(initialOwner) {
        // Thiết lập người sở hữu ban đầu
    }
}
