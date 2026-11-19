# T004 - Tạo bầu cử

Cập nhật: 2026-11-19
Epic: E02
Nhánh: `feature/tao-bau-cu`
Phụ thuộc: T003

## Mục tiêu
- Admin tạo được cuộc bầu cử có tiêu đề và danh sách lựa chọn.

## Phạm vi
- Backend / API (contract): `createElection`, `getElection`, struct `Election`, event `ElectionCreated`, `onlyOwner`
- Giao diện: form admin (tiêu đề, danh sách lựa chọn), danh sách cuộc bầu cử

## Xong khi (kiểm tra được bằng chạy hoặc test)
- [x] Tạo được bầu cử từ web và thấy trong danh sách.
- [x] Test: không phải admin gọi bị revert; dưới 2 lựa chọn bị revert.

## Ghi chú
- Sửa contract thì deploy lại Sepolia và cập nhật địa chỉ + ABI trong `frontend/src/config/contract.js`.
- Nếu trễ: bỏ form admin, tạo bầu cử bằng Remix.

## Kết quả (điền khi xong)
- Ngày xong: 2026-11-19
- Contract Sepolia: 0xA2C84E95AAd61442DEA1cD2c37d5284cbc1B9B99
- Cuộc bầu cử #1 đã tạo: "Bầu cử ai là người đẹp trai nhất thế giới" (Lựa chọn: Tiến Anh, Tian)
- Commit / PR chính: nhánh feature/tao-bau-cu
- Việc phát sinh hoặc còn tồn: Không
