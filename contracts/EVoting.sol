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

    // Lưu danh sách cử tri hợp lệ theo từng cuộc bầu cử: electionId => voterAddress => isWhitelisted
    mapping(uint256 => mapping(address => bool)) public isVoter;

    // Lưu mã băm bỏ phiếu kín của từng cử tri: electionId => voterAddress => commitHash
    mapping(uint256 => mapping(address => bytes32)) public commits;

    // Lưu trạng thái đã commit của từng cử tri: electionId => voterAddress => hasCommitted
    mapping(uint256 => mapping(address => bool)) public hasCommitted;

    // Sự kiện phát ra khi tạo thành công cuộc bầu cử mới
    event ElectionCreated(uint256 indexed electionId, string name, string[] options);

    // Sự kiện phát ra khi thêm danh sách cử tri vào cuộc bầu cử
    event VotersAdded(uint256 indexed electionId, address[] voters);

    // Sự kiện phát ra khi cử tri bỏ phiếu kín thành công bằng mã băm
    event VoteCommitted(uint256 indexed electionId, address indexed voter, bytes32 commitHash);

    // Sự kiện phát ra khi thay đổi giai đoạn cuộc bầu cử (Commit -> Reveal -> Finished)
    event PhaseChanged(uint256 indexed electionId, Phase newPhase);

    // Modifier đảm bảo cuộc bầu cử đang ở đúng giai đoạn mong muốn
    modifier inPhase(uint256 _electionId, Phase _expectedPhase) {
        // Kiểm tra giai đoạn hiện tại có khớp với giai đoạn yêu cầu không
        require(elections[_electionId].phase == _expectedPhase, "Invalid phase for this action");
        _;
    }

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

    // Thêm danh sách cử tri hợp lệ vào cuộc bầu cử (chỉ admin, chỉ ở giai đoạn Commit)
    function addVoters(uint256 _electionId, address[] calldata _voters) external onlyOwner inPhase(_electionId, Phase.Commit) {
        // Kiểm tra mã cuộc bầu cử hợp lệ
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");
        // Kiểm tra danh sách cử tri không được rỗng
        require(_voters.length > 0, "Voter list cannot be empty");

        // Duyệt danh sách và cấp quyền bỏ phiếu cho từng cử tri
        for (uint256 i = 0; i < _voters.length; i++) {
            address voter = _voters[i];
            // Kiểm tra địa chỉ ví không được là địa chỉ 0
            require(voter != address(0), "Invalid voter address");
            isVoter[_electionId][voter] = true;
        }

        // Phát ra sự kiện thêm cử tri thành công
        emit VotersAdded(_electionId, _voters);
    }

    // Bỏ phiếu kín bằng mã băm commitHash (chỉ cử tri trong whitelist, chỉ ở giai đoạn Commit)
    function commitVote(uint256 _electionId, bytes32 _commitHash) external inPhase(_electionId, Phase.Commit) {
        // Kiểm tra mã cuộc bầu cử hợp lệ
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");
        // Kiểm tra cử tri có nằm trong danh sách whitelist không
        require(isVoter[_electionId][msg.sender], "Not in whitelist");
        // Kiểm tra cử tri chưa từng gửi phiếu commit trước đó
        require(!hasCommitted[_electionId][msg.sender], "Already committed vote");
        // Kiểm tra mã băm commit không được rỗng
        require(_commitHash != bytes32(0), "Commit hash cannot be empty");

        // Lưu mã băm bỏ phiếu kín của cử tri
        commits[_electionId][msg.sender] = _commitHash;
        // Đánh dấu cử tri đã hoàn thành bước commit
        hasCommitted[_electionId][msg.sender] = true;
        // Tăng tổng số phiếu đã commit của cuộc bầu cử
        elections[_electionId].totalCommitted++;

        // Phát ra sự kiện bỏ phiếu kín thành công
        emit VoteCommitted(_electionId, msg.sender, _commitHash);
    }

    // Chuyển cuộc bầu cử từ giai đoạn Commit sang Reveal (chỉ admin gọi)
    function startReveal(uint256 _electionId) external onlyOwner inPhase(_electionId, Phase.Commit) {
        // Kiểm tra mã cuộc bầu cử hợp lệ
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");

        // Cập nhật giai đoạn sang Reveal
        elections[_electionId].phase = Phase.Reveal;

        // Phát ra sự kiện thay đổi giai đoạn
        emit PhaseChanged(_electionId, Phase.Reveal);
    }

    // Kết thúc cuộc bầu cử, chuyển từ Reveal sang Finished (chỉ admin gọi)
    function finish(uint256 _electionId) external onlyOwner inPhase(_electionId, Phase.Reveal) {
        // Kiểm tra mã cuộc bầu cử hợp lệ
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");

        // Cập nhật giai đoạn sang Finished
        elections[_electionId].phase = Phase.Finished;

        // Phát ra sự kiện thay đổi giai đoạn
        emit PhaseChanged(_electionId, Phase.Finished);
    }

    // Kiểm tra xem một cử tri có nằm trong danh sách hợp lệ (whitelist) không
    function isWhitelisted(uint256 _electionId, address _voter) external view returns (bool) {
        // Trả về trạng thái whitelist của cử tri
        return isVoter[_electionId][_voter];
    }

    // Kiểm tra xem cử tri đã gửi phiếu commit chưa
    function hasVoterCommitted(uint256 _electionId, address _voter) external view returns (bool) {
        // Trả về trạng thái đã commit của cử tri
        return hasCommitted[_electionId][_voter];
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
