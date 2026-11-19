# T008 - Reveal phiếu

Cập nhật: 2026-11-19
Epic: E04
Nhánh: `feature/reveal-phieu`
Phụ thuộc: T007

## Mục tiêu
- Cử tri tiết lộ phiếu, contract kiểm tra hash khớp rồi mới cộng phiếu.

## Phạm vi
- Backend / API (contract): `revealVote`, mapping `revealed`, cộng `tally`, event `Revealed`
- Giao diện: nút Reveal tự đọc option + salt đã lưu; cho xuất và nhập salt thủ công

## Xong khi (kiểm tra được bằng chạy hoặc test)
- [ ] Reveal đúng thì tally tăng đúng.
- [ ] Test: sai salt, sai option, option ngoài phạm vi, reveal hai lần, reveal khi chưa commit, đều bị revert.
- [ ] Test: người khác copy hash của A rồi reveal bị revert.

## Ghi chú
- Mất salt (mất `localStorage`) là mất quyền reveal; cho xuất và nhập salt để phòng, ghi vào báo cáo.

## Kết quả (điền khi xong)
- Ngày xong:
- Commit / PR chính:
- Việc phát sinh hoặc còn tồn:
