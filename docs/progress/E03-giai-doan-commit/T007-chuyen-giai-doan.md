# T007 - Chuyển giai đoạn

Cập nhật: 2026-11-19
Epic: E03
Nhánh: `feature/chuyen-giai-doan`
Phụ thuộc: T006

## Mục tiêu
- Admin chuyển cuộc bầu cử từ Commit sang Reveal rồi Finished.

## Phạm vi
- Backend / API (contract): `startReveal`, `finish`, event `PhaseChanged`
- Giao diện: nhãn giai đoạn hiện tại, nút chuyển giai đoạn cho admin

## Xong khi (kiểm tra được bằng chạy hoặc test)
- [ ] Chuyển Commit → Reveal → Finished được từ web.
- [ ] Test: không phải admin gọi bị revert; gọi sai thứ tự giai đoạn bị revert.

## Ghi chú
- Nếu trễ: bỏ nút admin, chuyển giai đoạn bằng Remix.

## Kết quả (điền khi xong)
- Ngày xong:
- Commit / PR chính:
- Việc phát sinh hoặc còn tồn:
