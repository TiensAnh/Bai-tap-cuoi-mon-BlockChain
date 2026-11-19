# T007 - Chuyển giai đoạn

Cập nhật: 2026-11-19
Epic: E03
Nhánh: `feature/chuyen-giai-doan`
Phụ thuộc: T006

## Mục tiêu
- Admin chuyển cuộc bầu cử từ Commit sang Reveal rồi Finished.

## Phạm vi
- Backend / API (contract): `startReveal`, `finish`, event `PhaseChanged`.
- Giao diện: nhãn giai đoạn hiện tại (Commit, Reveal, Finished), nút chuyển giai đoạn cho admin (Bắt đầu Reveal, Kết thúc cuộc bầu cử).

## Xong khi (kiểm tra được bằng chạy hoặc test)
- [x] Chuyển Commit → Reveal → Finished được từ web và smart contract.
- [x] Test tự động EVotingTest: chuyển thành công sang Reveal và Finished; gọi sai thứ tự giai đoạn (gọi startReveal 2 lần, gọi finish khi chưa Reveal) đều bị revert với lỗi `"Invalid phase for this action"`; không phải admin gọi bị revert.
- [x] Giao diện người dùng: hiển thị badge giai đoạn rõ ràng, các thông báo chỉ dẫn theo từng giai đoạn, nút bấm chuyển giai đoạn linh hoạt cho Admin.

## Ghi chú
- Nếu trễ: bỏ nút admin, chuyển giai đoạn bằng Remix (Đã hoàn thiện trực tiếp trên Web).

## Kết quả (điền khi xong)
- Ngày xong: 2026-11-19
- Commit / PR chính: `feature/chuyen-giai-doan`
- Việc phát sinh hoặc còn tồn: Không có
