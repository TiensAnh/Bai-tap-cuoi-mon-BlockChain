# T003 - Khung kết nối ví và contract (walking skeleton)

Cập nhật: 2026-11-19
Epic: E01
Nhánh: `feature/khung-ket-noi`
Phụ thuộc: T001

## Mục tiêu
- Chạy thông suốt từ ví MetaMask đến contract rỗng trên Sepolia và hiển thị đúng vai trò.

## Phạm vi
- Backend / API (contract): contract `EVoting is Ownable` rỗng, deploy lên Sepolia
- Giao diện: frontend Vite + React + ethers.js v6; nút Connect MetaMask; báo sai mạng; đọc `owner()` và hiển thị vai trò

## Xong khi (kiểm tra được bằng chạy hoặc test)
- [x] Mở web bằng ví deploy thì thấy "Admin", ví khác thấy "Cử tri".
- [x] Đổi tài khoản trong MetaMask thì web tự cập nhật (lắng nghe `accountsChanged`).

## Ghi chú
- Cần ETH Sepolia: xin faucet cho ví admin rồi chuyển khoảng 0,01 ETH sang 3 ví còn lại (cử tri A, cử tri B, người ngoài danh sách).

## Kết quả (điền khi xong)
- Ngày xong: 2026-11-19
- Contract Sepolia: 0xB60a12c8AAd1882ab4eBf6693C0BB3BB3B9433CA
- Owner xác nhận on-chain: 0x1dd8A4cC2519a1f5ead3c1cE5978c5Ab9f3607FA
- Commit / PR chính: (nhánh feature/khung-ket-noi)
- Việc phát sinh hoặc còn tồn: Không
