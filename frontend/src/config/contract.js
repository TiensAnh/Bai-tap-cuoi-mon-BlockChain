// Cấu hình thông tin Smart Contract và mạng Sepolia

// Mã mạng Sepolia Testnet (dạng hex và decimal)
export const SEPOLIA_CHAIN_ID = '0xaa36a7';
export const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

// Địa chỉ Smart Contract đã deploy trên Sepolia
export const CONTRACT_ADDRESS = '0xB60a12c8AAd1882ab4eBf6693C0BB3BB3B9433CA';

// ABI tối thiểu đọc hàm owner() của OpenZeppelin Ownable
export const CONTRACT_ABI = [
  // Hàm đọc địa chỉ owner của contract
  "function owner() view returns (address)"
];
