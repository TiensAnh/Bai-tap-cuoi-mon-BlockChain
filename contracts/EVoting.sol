// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import Ownable từ OpenZeppelin v5 để quản lý quyền admin
import "@openzeppelin/contracts/access/Ownable.sol";

// Hợp đồng thông minh bỏ phiếu điện tử EVoting
contract EVoting is Ownable {
    // Định nghĩa các giai đoạn của một cuộc bầu cử
    enum Phase { Commit, Reveal, Finished }

    // Cấu trúc lưu trữ thông tin một cuộc bầu cử
    struct Election {
        string name;            // Tên cuộc bầu cử
        string[] options;       // Danh sách các lựa chọn / ứng viên
        Phase phase;            // Giai đoạn hiện tại
        uint256 totalCommitted; // Tổng số cử tri đã gửi hash commit
        uint256 totalRevealed;  // Tổng số phiếu đã mở hợp lệ
    }

    // Tổng số lượng cuộc bầu cử đã khởi tạo
    uint256 public electionCount;

    // Lưu thông tin từng cuộc bầu cử theo mã định danh electionId
    mapping(uint256 => Election) public elections;

    // Sự kiện phát ra khi tạo thành công cuộc bầu cử mới
    event ElectionCreated(uint256 indexed electionId, string name, string[] options);

    // Khởi tạo contract và thiết lập người sở hữu ban đầu
    constructor(address initialOwner) Ownable(initialOwner) {
        // Thiết lập địa chỉ admin quản trị ban đầu
    }

    // Tạo cuộc bầu cử mới (chỉ admin có quyền gọi)
    function createElection(string calldata _name, string[] calldata _options) external onlyOwner returns (uint256) {
        // Kiểm tra tên cuộc bầu cử không được rỗng
        require(bytes(_name).length > 0, "Election name cannot be empty");
        // Kiểm tra số lượng lựa chọn phải từ 2 trở lên
        require(_options.length >= 2, "Must have at least 2 options");

        // Tăng số đếm cuộc bầu cử
        electionCount++;

        // Khởi tạo và lưu thông tin cuộc bầu cử mới ở giai đoạn Commit
        elections[electionCount] = Election({
            name: _name,
            options: _options,
            phase: Phase.Commit,
            totalCommitted: 0,
            totalRevealed: 0
        });

        // Phát ra sự kiện tạo cuộc bầu cử
        emit ElectionCreated(electionCount, _name, _options);

        // Trả về ID của cuộc bầu cử vừa tạo
        return electionCount;
    }

    // Đọc thông tin chi tiết của một cuộc bầu cử
    function getElection(uint256 _electionId) external view returns (
        string memory name,
        string[] memory options,
        Phase phase,
        uint256 totalCommitted,
        uint256 totalRevealed
    ) {
        // Kiểm tra mã cuộc bầu cử có hợp lệ không
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");

        // Lấy dữ liệu cuộc bầu cử từ storage
        Election storage election = elections[_electionId];

        // Trả về toàn bộ thông tin cuộc bầu cử
        return (
            election.name,
            election.options,
            election.phase,
            election.totalCommitted,
            election.totalRevealed
        );
    }
}
