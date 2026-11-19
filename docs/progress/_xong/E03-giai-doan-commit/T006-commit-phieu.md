# T006 - Commit phiếu

Cập nhật: 2026-11-19
Epic: E03
Nhánh: `feature/commit-phieu`
Phụ thuộc: T005

## Mục tiêu
- Cử tri gửi phiếu kín (hash) trong giai đoạn Commit.

## Phạm vi
- Backend / API (contract): `commitVote`, mapping `commits`, mapping `hasCommitted`, event `VoteCommitted`, modifier `inPhase`.
- Giao diện: màn hình cử tri chọn phương án; sinh salt ngẫu nhiên 32 bytes; tính hash `solidityPackedKeccak256(["uint256","bytes32","address"], [option, salt, address])`; gửi commitVote; lưu `{electionId, option, salt}` vào `localStorage`.

## Xong khi (kiểm tra được bằng chạy hoặc test)
- [x] Trên Etherscan / blockchain chỉ thấy hash `bytes32`, không lộ lựa chọn.
- [x] Test tự động EVotingTest: commit thành công, bầu hai lần revert ("Already committed vote"), người ngoài whitelist revert ("Not in whitelist"), hash rỗng revert ("Commit hash cannot be empty").
- [x] Giao diện người dùng: hiển thị radio button chọn phương án, nút gửi commit, thông báo đã commit, nút xem lại salt đã lưu an toàn trong localStorage.

## Ghi chú
- Hash gồm địa chỉ cử tri để người khác không copy commit rồi reveal theo.

## Kết quả (điền khi xong)
- Ngày xong: 2026-11-19
- Commit / PR chính: `feature/commit-phieu`
- Việc phát sinh hoặc còn tồn: Không có
