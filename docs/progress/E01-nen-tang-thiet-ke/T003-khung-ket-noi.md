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
- [ ] Mở web bằng ví deploy thì thấy "Admin", ví khác thấy "Cử tri".
- [ ] Đổi tài khoản trong MetaMask thì web tự cập nhật (lắng nghe `accountsChanged`).

## Ghi chú
- Cần ETH Sepolia: xin faucet cho ví admin rồi chuyển khoảng 0,01 ETH sang 3 ví còn lại (cử tri A, cử tri B, người ngoài danh sách).

## Kết quả (điền khi xong)
- Ngày xong:
- Commit / PR chính:
- Việc phát sinh hoặc còn tồn:
