# T009 - Công bố kết quả

Cập nhật: 2026-11-19
Epic: E04
Nhánh: `feature/ket-qua`
Phụ thuộc: T008

## Mục tiêu
- Sau khi kết thúc cuộc bầu cử, ai cũng xem được kết quả công khai và minh bạch.

## Phạm vi
- Backend / API (contract): `getResults(uint256 _electionId)` (chỉ trả khi `Finished`).
- Giao diện: khu vực kết quả trực quan gồm bảng chi tiết số phiếu, thanh tiến trình tỷ lệ phần trăm (progress bar), và hộp vinh danh người chiến thắng 👑.

## Xong khi (kiểm tra được bằng chạy hoặc test)
- [x] Bảng kết quả hiển thị đầy đủ và chính xác sau khi admin gọi `finish`.
- [x] Test tự động EVotingTest:
  - `testGetResultsSuccess`: Trả về mảng số phiếu chính xác cho từng phương án sau khi kết thúc.
  - `testGetResultsRevertNotFinished`: Gọi `getResults` khi chưa kết thúc bị revert với lỗi `"Invalid phase for this action"`.
- [x] Giao diện người dùng: Tự động tính toán người có số phiếu cao nhất, hiển thị thanh tỷ lệ phần trăm, xử lý cả trường hợp hòa phiếu hoặc chưa ai mở phiếu.

## Ghi chú
- Kết quả được bảo đảm bất biến vì chỉ có thể đọc sau khi giai đoạn `Finished` được kích hoạt.

## Kết quả (điền khi xong)
- Ngày xong: 2026-11-19
- Commit / PR chính: `feature/ket-qua`
- Việc phát sinh hoặc còn tồn: Không có
