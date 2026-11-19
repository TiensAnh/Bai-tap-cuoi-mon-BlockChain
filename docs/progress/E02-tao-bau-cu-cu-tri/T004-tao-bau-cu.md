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
- [ ] Tạo được bầu cử từ web và thấy trong danh sách.
- [ ] Test: không phải admin gọi bị revert; dưới 2 lựa chọn bị revert.

## Ghi chú
- Sửa contract thì deploy lại Sepolia và cập nhật địa chỉ + ABI trong `frontend/src/config/contract.js`.
- Nếu trễ: bỏ form admin, tạo bầu cử bằng Remix.

## Kết quả (điền khi xong)
- Ngày xong:
- Commit / PR chính:
- Việc phát sinh hoặc còn tồn:
