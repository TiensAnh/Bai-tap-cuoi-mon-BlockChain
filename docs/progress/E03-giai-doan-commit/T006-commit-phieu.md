# T006 - Commit phiếu

Cập nhật: 2026-11-19
Epic: E03
Nhánh: `feature/commit-phieu`
Phụ thuộc: T005

## Mục tiêu
- Cử tri gửi phiếu kín (hash) trong giai đoạn Commit.

## Phạm vi
- Backend / API (contract): `commitVote`, mapping `commits`, event `Committed`, modifier `inPhase`
- Giao diện: màn hình cử tri chọn phương án; sinh salt; tính hash `solidityPackedKeccak256(["uint256","bytes32","address"], [option, salt, address])`; gửi commit; lưu `{electionId, option, salt}` vào `localStorage`

## Xong khi (kiểm tra được bằng chạy hoặc test)
- [ ] Trên Etherscan chỉ thấy hash, không lộ lựa chọn.
- [ ] Test: bầu hai lần, người ngoài whitelist, hash rỗng, commit sai giai đoạn, đều bị revert.

## Ghi chú
- Hash gồm địa chỉ cử tri để người khác không copy commit rồi reveal theo.

## Kết quả (điền khi xong)
- Ngày xong:
- Commit / PR chính:
- Việc phát sinh hoặc còn tồn:
