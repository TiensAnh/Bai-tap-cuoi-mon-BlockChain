// Cấu hình thông tin Smart Contract và mạng Sepolia

// Mã mạng Sepolia Testnet (dạng hex và decimal)
export const SEPOLIA_CHAIN_ID = '0xaa36a7';
export const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

// Địa chỉ Smart Contract đã deploy trên Sepolia
export const CONTRACT_ADDRESS = '0xA2C84E95AAd61442DEA1cD2c37d5284cbc1B9B99';

// ABI của Smart Contract EVoting (Cập nhật Task T006 - Commit phiếu)
export const CONTRACT_ABI = [
  // Hàm đọc owner của contract
  "function owner() view returns (address)",
  // Hàm đọc tổng số cuộc bầu cử
  "function electionCount() view returns (uint256)",
  // Hàm tạo cuộc bầu cử mới (chỉ admin)
  "function createElection(string calldata _name, string[] calldata _options) external returns (uint256)",
  // Hàm thêm danh sách cử tri hợp lệ (chỉ admin)
  "function addVoters(uint256 _electionId, address[] calldata _voters) external",
  // Hàm kiểm tra cử tri có trong whitelist không
  "function isWhitelisted(uint256 _electionId, address _voter) external view returns (bool)",
  // Hàm cử tri bỏ phiếu kín bằng mã băm commit
  "function commitVote(uint256 _electionId, bytes32 _commitHash) external",
  // Hàm kiểm tra cử tri đã gửi commit chưa
  "function hasVoterCommitted(uint256 _electionId, address _voter) external view returns (bool)",
  // Hàm đọc thông tin chi tiết cuộc bầu cử
  "function getElection(uint256 _electionId) external view returns (string name, string[] options, uint8 phase, uint256 totalCommitted, uint256 totalRevealed)",
  // Sự kiện khi tạo cuộc bầu cử mới
  "event ElectionCreated(uint256 indexed electionId, string name, string[] options)",
  // Sự kiện khi thêm cử tri vào whitelist
  "event VotersAdded(uint256 indexed electionId, address[] voters)",
  // Sự kiện khi cử tri commit phiếu
  "event VoteCommitted(uint256 indexed electionId, address indexed voter, bytes32 commitHash)"
];
