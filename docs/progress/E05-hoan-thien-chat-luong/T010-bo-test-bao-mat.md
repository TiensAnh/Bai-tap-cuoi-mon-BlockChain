# T010 - Bộ test tổng hợp và minh chứng

Cập nhật: 2026-11-19
Epic: E05
Nhánh: `test/bo-test-bao-mat`
Phụ thuộc: T009

## Mục tiêu
- Gom toàn bộ case lỗi và tấn công thành một bộ test có minh chứng.

## Phạm vi
- Backend / API (contract): gom case từ T004 đến T009 vào `contracts/EVoting_test.sol` hoặc kịch bản thủ công trên Remix
- Tài liệu: bảng test: case, thao tác, mong đợi, thực tế, ảnh revert

## Xong khi (kiểm tra được bằng chạy hoặc test)
- [ ] Bảng test đủ các nhóm lỗi (bầu hai lần, sai giai đoạn, ngoài whitelist, sai salt, reveal hai lần, sai quyền admin, xem kết quả sớm).
- [ ] Mỗi case có ảnh minh chứng (đường dẫn bảng: CHƯA CHỐT).

## Ghi chú
- Dùng lại cho báo cáo ở T014.

## Kết quả (điền khi xong)
- Ngày xong:
- Commit / PR chính:
- Việc phát sinh hoặc còn tồn:
