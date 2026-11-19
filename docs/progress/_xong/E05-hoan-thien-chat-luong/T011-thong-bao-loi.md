# T011 - Lỗi và trạng thái dễ hiểu trên frontend

Cập nhật: 2026-11-19
Epic: E05
Nhánh: `feature/thong-bao-loi`
Phụ thuộc: T009

## Mục tiêu
- Người dùng thấy thông báo rõ ràng thay vì lỗi thô khi giao dịch thất bại.

## Phạm vi
- Giao diện: loading cho từng giao dịch; dịch lỗi revert sang tiếng Việt; cảnh báo sai mạng; cảnh báo chưa kết nối ví

## Xong khi (kiểm tra được bằng chạy hoặc test)
- [x] Mọi case lỗi trong bảng test (T010) đều hiện thông báo rõ ràng bằng tiếng Việt, không hiện lỗi thô (Nonce, Whitelist, Bỏ phiếu 2 lần, Sai salt, Sai quyền Admin, Từ chối giao dịch).
- [x] Sửa chuẩn logic nút mở phiếu thủ công: gửi chính xác phương án và mã salt người dùng gõ vào ô, bắt lỗi sai salt từ Smart Contract và báo lỗi tiếng Việt thân thiện.

## Ghi chú
- Đã hoàn thiện chức năng và hoàn tất kiểm thử.

## Kết quả (điền khi xong)
- Ngày xong: 2026-11-19
- Commit / PR chính: Nhánh `feature/thong-bao-loi`
- Việc phát sinh hoặc còn tồn: Đã hoàn tất 100%, sẵn sàng đóng Epic E05.
