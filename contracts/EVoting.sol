// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import Ownable từ OpenZeppelin v5 để quản lý quyền admin
import "@openzeppelin/contracts/access/Ownable.sol";

// Hợp đồng thông minh bỏ phiếu điện tử EVoting chuẩn Commit - Reveal
contract EVoting is Ownable {
    // Định nghĩa 4 giai đoạn chuẩn của cuộc bầu cử
    enum Phase { Registration, Commit, Reveal, Finished }

    // Cấu trúc lưu trữ thông tin một cuộc bầu cử
    struct Election {
        string name;            // Tên cuộc bầu cử
        string[] options;       // Danh sách các lựa chọn / ứng viên
        Phase phase;            // Giai đoạn hiện tại (0: Registration, 1: Commit, 2: Reveal, 3: Finished)
        uint256 totalCommitted; // Tổng số cử tri đã gửi hash commit
        uint256 totalRevealed;  // Tổng số phiếu đã mở hợp lệ
    }

    // Tổng số lượng cuộc bầu cử đã khởi tạo
    uint256 public electionCount;

    // Lưu thông tin từng cuộc bầu cử theo mã định danh electionId
    mapping(uint256 => Election) public elections;

    // Lưu danh sách cử tri hợp lệ theo từng cuộc bầu cử: electionId => voterAddress => isWhitelisted
    mapping(uint256 => mapping(address => bool)) public isVoter;

    // Lưu mảng danh sách địa chỉ ví cử tri tham gia: electionId => address[]
    mapping(uint256 => address[]) private electionVoters;

    // Lưu mã băm bỏ phiếu kín của từng cử tri: electionId => voterAddress => commitHash
    mapping(uint256 => mapping(address => bytes32)) public commits;

    // Lưu trạng thái đã commit của từng cử tri: electionId => voterAddress => hasCommitted
    mapping(uint256 => mapping(address => bool)) public hasCommitted;

    // Lưu trạng thái đã mở phiếu của từng cử tri: electionId => voterAddress => hasRevealed
    mapping(uint256 => mapping(address => bool)) public hasRevealed;

    // Lưu số phiếu kiểm đếm của từng lựa chọn: electionId => optionIndex => voteCount
    mapping(uint256 => mapping(uint256 => uint256)) public tally;

    // Lưu cấu hình hiển thị avatar ứng viên: electionId => showAvatar
    mapping(uint256 => bool) public showAvatar;

    // Sự kiện phát ra khi tạo thành công cuộc bầu cử mới
    event ElectionCreated(uint256 indexed electionId, string name, string[] options);

    // Sự kiện phát ra khi thêm danh sách cử tri vào cuộc bầu cử
    event VotersAdded(uint256 indexed electionId, address[] voters);

    // Sự kiện phát ra khi cử tri bỏ phiếu kín thành công bằng mã băm
    event VoteCommitted(uint256 indexed electionId, address indexed voter, bytes32 commitHash);

    // Sự kiện phát ra khi thay đổi giai đoạn cuộc bầu cử
    event PhaseChanged(uint256 indexed electionId, Phase newPhase);

    // Sự kiện phát ra khi cử tri mở phiếu (reveal) thành công
    event VoteRevealed(uint256 indexed electionId, address indexed voter, uint256 option);

    // Modifier đảm bảo cuộc bầu cử đang ở đúng giai đoạn mong muốn
    modifier inPhase(uint256 _electionId, Phase _expectedPhase) {
        require(elections[_electionId].phase == _expectedPhase, "Invalid phase for this action");
        _;
    }

    // Khởi tạo contract và thiết lập người sở hữu ban đầu
    constructor(address initialOwner) Ownable(initialOwner) {}

    // Tạo cuộc bầu cử mới có cấu hình hiển thị avatar (chỉ admin gọi)
    function createElection(string calldata _name, string[] calldata _options, bool _showAvatar) public onlyOwner returns (uint256) {
        require(bytes(_name).length > 0, "Election name cannot be empty");
        require(_options.length >= 2, "Must have at least 2 options");

        electionCount++;

        // Khởi tạo cuộc bầu cử mới ở giai đoạn Registration (chưa bắt đầu bỏ phiếu)
        elections[electionCount] = Election({
            name: _name,
            options: _options,
            phase: Phase.Registration,
            totalCommitted: 0,
            totalRevealed: 0
        });

        showAvatar[electionCount] = _showAvatar;

        emit ElectionCreated(electionCount, _name, _options);
        return electionCount;
    }

    // Tạo cuộc bầu cử mới mặc định tắt avatar
    function createElection(string calldata _name, string[] calldata _options) external onlyOwner returns (uint256) {
        return createElection(_name, _options, false);
    }

    // Thêm danh sách cử tri hợp lệ vào cuộc bầu cử (chỉ admin, chỉ ở giai đoạn Registration)
    function addVoters(uint256 _electionId, address[] calldata _voters) external onlyOwner inPhase(_electionId, Phase.Registration) {
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");
        require(_voters.length > 0, "Voter list cannot be empty");

        for (uint256 i = 0; i < _voters.length; i++) {
            address voter = _voters[i];
            require(voter != address(0), "Invalid voter address");
            if (!isVoter[_electionId][voter]) {
                isVoter[_electionId][voter] = true;
                electionVoters[_electionId].push(voter);
            }
        }

        emit VotersAdded(_electionId, _voters);
    }

    // Bắt đầu cuộc bầu cử: Chốt danh sách cử tri và chuyển sang giai đoạn Commit (khóa vĩnh viễn Whitelist)
    function startCommit(uint256 _electionId) external onlyOwner inPhase(_electionId, Phase.Registration) {
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");

        // Chuyển giai đoạn sang Commit (từ thời điểm này không được thêm cử tri)
        elections[_electionId].phase = Phase.Commit;

        emit PhaseChanged(_electionId, Phase.Commit);
    }

    // Bỏ phiếu kín bằng mã băm commitHash (chỉ cử tri trong whitelist, chỉ ở giai đoạn Commit)
    function commitVote(uint256 _electionId, bytes32 _commitHash) external inPhase(_electionId, Phase.Commit) {
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");
        require(isVoter[_electionId][msg.sender], "Not in whitelist");
        require(!hasCommitted[_electionId][msg.sender], "Already committed vote");
        require(_commitHash != bytes32(0), "Commit hash cannot be empty");

        commits[_electionId][msg.sender] = _commitHash;
        hasCommitted[_electionId][msg.sender] = true;
        elections[_electionId].totalCommitted++;

        emit VoteCommitted(_electionId, msg.sender, _commitHash);
    }

    // Chuyển cuộc bầu cử từ giai đoạn Commit sang Reveal (chỉ admin gọi)
    function startReveal(uint256 _electionId) external onlyOwner inPhase(_electionId, Phase.Commit) {
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");

        elections[_electionId].phase = Phase.Reveal;

        emit PhaseChanged(_electionId, Phase.Reveal);
    }

    // Mở phiếu bầu (Reveal) bằng lựa chọn và salt (chỉ cử tri trong whitelist đã commit, chỉ ở giai đoạn Reveal)
    function revealVote(uint256 _electionId, uint256 _option, bytes32 _salt) external inPhase(_electionId, Phase.Reveal) {
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");
        require(isVoter[_electionId][msg.sender], "Not in whitelist");
        require(hasCommitted[_electionId][msg.sender], "Has not committed vote");
        require(!hasRevealed[_electionId][msg.sender], "Already revealed vote");
        require(_option < elections[_electionId].options.length, "Invalid option index");

        // Tính lại mã băm bí mật với phương án, salt và địa chỉ ví của cử tri
        bytes32 calculatedHash = keccak256(abi.encodePacked(_option, _salt, msg.sender));
        require(calculatedHash == commits[_electionId][msg.sender], "Hash does not match");

        hasRevealed[_electionId][msg.sender] = true;
        tally[_electionId][_option]++;
        elections[_electionId].totalRevealed++;

        emit VoteRevealed(_electionId, msg.sender, _option);
    }

    // Kết thúc cuộc bầu cử, chuyển từ Reveal sang Finished (chỉ admin gọi)
    function finish(uint256 _electionId) external onlyOwner inPhase(_electionId, Phase.Reveal) {
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");

        elections[_electionId].phase = Phase.Finished;

        emit PhaseChanged(_electionId, Phase.Finished);
    }

    // Lấy danh sách toàn bộ địa chỉ ví cử tri tham gia cuộc bầu cử
    function getVoters(uint256 _electionId) external view returns (address[] memory) {
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");
        return electionVoters[_electionId];
    }

    // Lấy số lượng cử tri tham gia cuộc bầu cử
    function getVoterCount(uint256 _electionId) external view returns (uint256) {
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");
        return electionVoters[_electionId].length;
    }

    // Kiểm tra xem cử tri có trong whitelist không
    function isWhitelisted(uint256 _electionId, address _voter) external view returns (bool) {
        return isVoter[_electionId][_voter];
    }

    // Kiểm tra xem cử tri đã gửi phiếu commit chưa
    function hasVoterCommitted(uint256 _electionId, address _voter) external view returns (bool) {
        return hasCommitted[_electionId][_voter];
    }

    // Kiểm tra xem cử tri đã mở phiếu chưa
    function hasVoterRevealed(uint256 _electionId, address _voter) external view returns (bool) {
        return hasRevealed[_electionId][_voter];
    }

    // Đọc số phiếu kiểm đếm hiện tại của một lựa chọn
    function getTally(uint256 _electionId, uint256 _option) external view returns (uint256) {
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");
        return tally[_electionId][_option];
    }

    // Đọc thông tin chi tiết của cuộc bầu cử
    function getElection(uint256 _electionId) external view returns (
        string memory name,
        string[] memory options,
        Phase phase,
        uint256 totalCommitted,
        uint256 totalRevealed
    ) {
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");
        Election storage election = elections[_electionId];
        return (
            election.name,
            election.options,
            election.phase,
            election.totalCommitted,
            election.totalRevealed
        );
    }

    // Đọc kết quả kiểm phiếu toàn bộ các phương án khi kết thúc (Finished)
    function getResults(uint256 _electionId) external view inPhase(_electionId, Phase.Finished) returns (uint256[] memory) {
        require(_electionId > 0 && _electionId <= electionCount, "Election does not exist");
        uint256 optionCount = elections[_electionId].options.length;
        uint256[] memory results = new uint256[](optionCount);

        for (uint256 i = 0; i < optionCount; i++) {
            results[i] = tally[_electionId][i];
        }

        return results;
    }
}
