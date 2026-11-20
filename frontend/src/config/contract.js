// Cấu hình thông tin Smart Contract và mạng kết nối

// Mã mạng Sepolia Testnet (dạng hex và decimal)
export const SEPOLIA_CHAIN_ID = '0xaa36a7';
export const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

// Mã mạng Localhost (Hardhat Network 1337 / 31337)
export const LOCALHOST_CHAIN_ID = '0x539';
export const LOCALHOST_CHAIN_ID_DECIMAL = 1337;

// Địa chỉ Smart Contract EVoting trên mạng Localhost
export const CONTRACT_ADDRESS = '0x0165878A594ca255338adfa4d48449f69242Eb8F';

// ABI của Smart Contract EVoting quy trình 4 giai đoạn chuẩn
export const CONTRACT_ABI = [
  // Hàm đọc owner của contract
  "function owner() view returns (address)",
  // Hàm đọc tổng số cuộc bầu cử
  "function electionCount() view returns (uint256)",
  // Hàm tạo cuộc bầu cử mới có avatar (chỉ admin)
  "function createElection(string calldata _name, string[] calldata _options, bool _showAvatar) external returns (uint256)",
  // Hàm tạo cuộc bầu cử mới không avatar (chỉ admin)
  "function createElection(string calldata _name, string[] calldata _options) external returns (uint256)",
  // Hàm kiểm tra cấu hình avatar của cuộc bầu cử
  "function showAvatar(uint256 _electionId) external view returns (bool)",
  // Hàm thêm danh sách cử tri hợp lệ (chỉ admin, chỉ ở giai đoạn Registration)
  "function addVoters(uint256 _electionId, address[] calldata _voters) external",
  // Hàm chốt danh sách cử tri và bắt đầu giai đoạn bỏ phiếu kín Commit (chỉ admin)
  "function startCommit(uint256 _electionId) external",
  // Hàm lấy danh sách toàn bộ địa chỉ ví cử tri tham gia cuộc bầu cử
  "function getVoters(uint256 _electionId) external view returns (address[])",
  // Hàm lấy số lượng cử tri tham gia
  "function getVoterCount(uint256 _electionId) external view returns (uint256)",
  // Hàm kiểm tra cử tri có trong whitelist không
  "function isWhitelisted(uint256 _electionId, address _voter) external view returns (bool)",
  // Hàm cử tri bỏ phiếu kín bằng mã băm commit
  "function commitVote(uint256 _electionId, bytes32 _commitHash) external",
  // Hàm kiểm tra cử tri đã gửi commit chưa
  "function hasVoterCommitted(uint256 _electionId, address _voter) external view returns (bool)",
  // Hàm cử tri mở phiếu bằng phương án và salt
  "function revealVote(uint256 _electionId, uint256 _option, bytes32 _salt) external",
  // Hàm kiểm tra cử tri đã mở phiếu chưa
  "function hasVoterRevealed(uint256 _electionId, address _voter) external view returns (bool)",
  // Hàm đọc số phiếu hiện tại của một phương án
  "function getTally(uint256 _electionId, uint256 _option) external view returns (uint256)",
  // Hàm đọc kết quả bầu cử toàn bộ các phương án khi kết thúc (Finished)
  "function getResults(uint256 _electionId) external view returns (uint256[])",
  // Hàm chuyển sang giai đoạn Reveal (chỉ admin)
  "function startReveal(uint256 _electionId) external",
  // Hàm kết thúc cuộc bầu cử chuyển sang Finished (chỉ admin)
  "function finish(uint256 _electionId) external",
  // Hàm đọc thông tin chi tiết cuộc bầu cử
  "function getElection(uint256 _electionId) external view returns (string name, string[] options, uint8 phase, uint256 totalCommitted, uint256 totalRevealed)",
  // Sự kiện khi tạo cuộc bầu cử mới
  "event ElectionCreated(uint256 indexed electionId, string name, string[] options)",
  // Sự kiện khi thêm cử tri vào whitelist
  "event VotersAdded(uint256 indexed electionId, address[] voters)",
  // Sự kiện khi cử tri commit phiếu
  "event VoteCommitted(uint256 indexed electionId, address indexed voter, bytes32 commitHash)",
  // Sự kiện khi cử tri mở phiếu (reveal)
  "event VoteRevealed(uint256 indexed electionId, address indexed voter, uint256 option)",
  // Sự kiện khi thay đổi giai đoạn
  "event PhaseChanged(uint256 indexed electionId, uint8 newPhase)"
];
