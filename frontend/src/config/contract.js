// Cấu hình thông tin Smart Contract và mạng Sepolia

// Mã mạng Sepolia Testnet (dạng hex và decimal)
export const SEPOLIA_CHAIN_ID = '0xaa36a7';
export const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

// Địa chỉ Smart Contract đã deploy trên Sepolia (Task T004 - có hàm tạo bầu cử)
export const CONTRACT_ADDRESS = '0xA2C84E95AAd61442DEA1cD2c37d5284cbc1B9B99';

// ABI của Smart Contract EVoting (Task T004)
export const CONTRACT_ABI = [
  // Hàm đọc owner của contract
  "function owner() view returns (address)",
  // Hàm đọc tổng số cuộc bầu cử
  "function electionCount() view returns (uint256)",
  // Hàm tạo cuộc bầu cử mới (chỉ admin)
  "function createElection(string calldata _name, string[] calldata _options) external returns (uint256)",
  // Hàm đọc thông tin chi tiết cuộc bầu cử
  "function getElection(uint256 _electionId) external view returns (string name, string[] options, uint8 phase, uint256 totalCommitted, uint256 totalRevealed)",
  // Sự kiện khi tạo cuộc bầu cử mới
  "event ElectionCreated(uint256 indexed electionId, string name, string[] options)"
];
