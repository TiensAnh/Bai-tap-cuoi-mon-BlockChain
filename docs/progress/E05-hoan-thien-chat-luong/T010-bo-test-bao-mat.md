# T010 - Bộ test tổng hợp và minh chứng

Cập nhật: 2026-11-19
Epic: E05
Nhánh: `test/bo-test-bao-mat`
Phụ thuộc: T009

## Mục tiêu
- Gom toàn bộ case lỗi và tấn công thành một bộ test có minh chứng.

## Phạm vi
- Backend / API (contract): gom case từ T004 đến T009 vào `contracts/test/EVoting_test.sol` và `test/EVoting.test.js`
- Tài liệu: bảng test: case, thao tác, mong đợi, thực tế, log revert

## Xong khi (kiểm tra được bằng chạy hoặc test)
- [x] Bảng test đủ các nhóm lỗi (bầu hai lần, sai giai đoạn, ngoài whitelist, sai salt, reveal hai lần, sai quyền admin, xem kết quả sớm).
- [x] Mỗi case có minh chứng log chạy test `npx hardhat test` đạt 14/14 test cases Passed.

## Bảng ma trận kiểm thử bảo mật & Chức năng (Security Test Matrix)

| STT | Mã Test | Tên ca kiểm thử | Nhóm | Thao tác thực hiện | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | TC-01 | Tạo bầu cử hợp lệ | Khởi tạo | Gọi `createElection("Bau cu", ["A", "B"])` với ví Admin | Tạo thành công ID=1, phát event `ElectionCreated` | Tạo thành công ID=1, phase=Commit | **PASS** |
| 2 | TC-02 | Thêm cử tri vào Whitelist | Whitelist | Admin gọi `addVoters(1, [voter1, voter2])` | `isWhitelisted` của voter1, voter2 = true; người ngoài = false | `isWhitelisted` trả về true cho 2 ví | **PASS** |
| 3 | TC-03 | Chặn người ngoài Whitelist commit | Bảo mật | Ví ngoài Whitelist gọi `commitVote(1, hash)` | Revert: `"Not in whitelist"` | Reverted with `"Not in whitelist"` | **PASS** |
| 4 | TC-04 | Bỏ phiếu kín hợp lệ | Commit | Cử tri Whitelist gửi `commitVote(1, hash)` | Lưu hash, `hasCommitted=true`, phát `VoteCommitted` | Hash được lưu, `totalCommitted=1` | **PASS** |
| 5 | TC-05 | Chặn bỏ phiếu lần 2 (Double commit) | Bảo mật | Cử tri đã commit gọi lại `commitVote(1, hash)` | Revert: `"Already committed vote"` | Reverted with `"Already committed vote"` | **PASS** |
| 6 | TC-06 | Chặn mã hash commit rỗng | Bảo mật | Cử tri gửi `commitVote(1, bytes32(0))` | Revert: `"Commit hash cannot be empty"` | Reverted with `"Commit hash cannot be empty"` | **PASS** |
| 7 | TC-07 | Chuyển sang giai đoạn Reveal | Tiến trình | Admin gọi `startReveal(1)` | `phase` chuyển từ 0 (Commit) sang 1 (Reveal) | `phase == 1`, phát `PhaseChanged` | **PASS** |
| 8 | TC-08 | Kết thúc bầu cử (Finished) | Tiến trình | Admin gọi `finish(1)` từ giai đoạn Reveal | `phase` chuyển sang 2 (Finished) | `phase == 2`, phát `PhaseChanged` | **PASS** |
| 9 | TC-09 | Mở phiếu (Reveal) hợp lệ | Reveal | Cử tri gửi đúng `option` và `secretSalt` | Kiểm đếm thành công, `hasRevealed=true`, tăng tally | `tally` phương án chọn tăng 1 | **PASS** |
| 10 | TC-10 | Chặn mở phiếu khi sai mã Salt | Bảo mật | Cố tình gọi `revealVote(1, option, wrongSalt)` | Revert: `"Hash does not match"` | Reverted with `"Hash does not match"` | **PASS** |
| 11 | TC-11 | Chặn gian lận thay đổi lựa chọn | Bảo mật | Commit phương án 1 nhưng lại reveal phương án 0 | Revert: `"Hash does not match"` | Reverted with `"Hash does not match"` | **PASS** |
| 12 | TC-12 | Chặn mở phiếu lần 2 (Double reveal) | Bảo mật | Cử tri đã reveal gọi lại `revealVote` lần 2 | Revert: `"Already revealed vote"` | Reverted with `"Already revealed vote"` | **PASS** |
| 13 | TC-13 | Đọc kết quả khi đã Finished | Kết quả | Gọi `getResults(1)` sau khi cuộc bầu cử kết thúc | Trả về mảng số phiếu đầy đủ từng phương án | Trả về mảng `[0, 1]` chính xác | **PASS** |
| 14 | TC-14 | Chặn xem trộm kết quả trước giờ | Bảo mật | Gọi `getResults(1)` khi đang ở giai đoạn Commit | Revert: `"Invalid phase for this action"` | Reverted with `"Invalid phase for this action"` | **PASS** |

## Minh chứng kết quả chạy test tự động (`npx hardhat test`)

```text
  EVoting Smart Contract Security & Functional Test Suite
    Nhom 1: Khoi tao va Quan ly Whitelist
      √ Test 1: Tao cuoc bau cu thanh cong khi tham so hop le (40ms)
      √ Test 2: Them cu tri vao Whitelist thanh cong
      √ Test 4: Revert khi nguoi ngoai Whitelist co tinh commit
    Nhom 2: Giai doan Commit (Bo phieu kin)
      √ Test 3: Bo phieu kin (Commit) thanh cong
      √ Test 5: Revert khi bo phieu hai lan (Already committed)
      √ Test 6: Revert khi commit ma hash rong
    Nhom 3: Chuyen giai doan cuoc bau cu
      √ Test 7: Chuyen giai doan tu Commit sang Reveal thanh cong
      √ Test 8: Ket thuc cuoc bau cu (chuyen sang Finished) thanh cong
    Nhom 4: Giai doan Reveal (Mo phieu & Kiem dem)
      √ Test 9: Mo phieu (Reveal) thanh cong va tang tally kiem dem
      √ Test 10: Revert khi mo phieu sai ma Salt
      √ Test 11: Revert khi gian lan thay doi phuong an da bau
      √ Test 12: Revert khi mo phieu hai lan
    Nhom 5: Cong bo ket qua cuoc bau cu
      √ Test 13: Doc ket qua bau cu thanh cong khi da Finished
      √ Test 14: Revert khi doc ket qua khi cuoc bau cu chua ket thuc

  14 passing (625ms)
```

## Kết quả (điền khi xong)
- Ngày xong: 2026-11-19
- Commit / PR chính: Nhánh `test/bo-test-bao-mat`
- Việc phát sinh hoặc còn tồn: Không có, 14/14 test cases đạt chuẩn 100%. Sẵn sàng đưa vào Báo cáo cuối kỳ.

