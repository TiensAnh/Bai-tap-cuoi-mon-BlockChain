# T016 - Merkle whitelist

Cập nhật: 2026-11-19
Epic: E08
Nhánh: `feature/merkle-whitelist`
Phụ thuộc: T012

## Mục tiêu
- Thay whitelist bằng mapping bằng Merkle root để không lưu danh sách cử tri on-chain.

## Phạm vi
- Backend / API (contract): dùng `MerkleProof.verify` của OpenZeppelin, lưu `merkleRoot`
- Giao diện: frontend gửi kèm proof khi commit
- Tài liệu: script JS (`merkletreejs`) tạo root từ danh sách địa chỉ

## Xong khi (kiểm tra được bằng chạy hoặc test)
- [ ] Cử tri trong danh sách commit được với proof đúng.
- [ ] Test: proof sai hoặc người ngoài danh sách bị revert.

## Ghi chú
- Chỉ làm nếu dư thời gian (epic E08).

## Kết quả (điền khi xong)
- Ngày xong:
- Commit / PR chính:
- Việc phát sinh hoặc còn tồn:
