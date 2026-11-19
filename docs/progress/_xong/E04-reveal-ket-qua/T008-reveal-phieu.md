# T008 - Reveal phiếu

Cập nhật: 2026-11-19
Epic: E04
Nhánh: `feature/reveal-phieu`
Phụ thuộc: T007

## Mục tiêu
- Cử tri tiết lộ phiếu, contract kiểm tra hash khớp rồi mới cộng phiếu.

## Phạm vi
- Backend / API (contract): `revealVote`, mapping `hasRevealed`, cộng `tally`, mapping `tally`, hàm đọc `hasVoterRevealed`, `getTally`, event `VoteRevealed`.
- Giao diện: khu vực Reveal tự động nhận diện option + salt đã lưu trong `localStorage`; hỗ trợ form nhập thủ công cho cử tri (phòng trường hợp đổi thiết bị); nút xác nhận mở phiếu (Reveal Vote).

## Xong khi (kiểm tra được bằng chạy hoặc test)
- [x] Reveal đúng thì `tally` và `totalRevealed` tăng đúng.
- [x] Test tự động EVotingTest:
  - `testRevealVoteSuccess`: Mở phiếu thành công, tally tăng chính xác.
  - `testRevealVoteRevertWrongSalt`: Sai salt bị revert ("Hash does not match").
  - `testRevealVoteRevertWrongOption`: Gian lận đổi phương án bị revert ("Hash does not match").
  - `testRevealVoteRevertAlreadyRevealed`: Mở phiếu lần 2 bị revert ("Already revealed vote").
- [x] Giao diện người dùng: Tự động phát hiện lá phiếu đã lưu, cho phép xác nhận mở phiếu bằng 1 click hoặc nhập thủ công nếu muốn.

## Ghi chú
- Mất salt (mất `localStorage`) là mất quyền reveal; cho xuất và nhập salt để phòng, ghi vào báo cáo.

## Kết quả (điền khi xong)
- Ngày xong: 2026-11-19
- Commit / PR chính: `feature/reveal-phieu`
- Việc phát sinh hoặc còn tồn: Không có
