# T005 - Thêm cử tri vào whitelist

Cập nhật: 2026-11-19
Epic: E02
Nhánh: `feature/them-cu-tri`
Phụ thuộc: T004

## Mục tiêu
- Admin thêm được danh sách cử tri hợp lệ cho một cuộc bầu cử.

## Phạm vi
- Backend / API (contract): `addVoters`, mapping `isVoter`, event `VotersAdded`
- Giao diện: ô dán nhiều địa chỉ, hiển thị cử tri của cuộc bầu cử

## Xong khi (kiểm tra được bằng chạy hoặc test)
- [x] Thêm 2 đến 3 ví và `isVoter` trả đúng.
- [x] Test: không phải admin thêm bị revert; thêm sau giai đoạn Commit bị revert.

## Ghi chú
- Nếu trễ: bỏ form admin, thêm cử tri bằng Remix.

## Kết quả (điền khi xong)
- Ngày xong: 2026-11-19
- Kiểm thử: Đã test thành công trên Remix VM hàm addVoters, hàm isWhitelisted trả về true/false chính xác và kiểm tra revert khi tài khoản non-owner gọi.
- Commit / PR chính: nhánh feature/them-cu-tri
- Việc phát sinh hoặc còn tồn: Không
