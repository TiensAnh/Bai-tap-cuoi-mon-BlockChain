# T022 - Kết thúc bầu cử và công bố kết quả

Cập nhật: 2026-11-20
Epic: E05.1
Nhánh: `feature/ket-qua-an-danh`
Phụ thuộc: T021

## Mục tiêu
- Admin kết thúc được cuộc bầu cử ẩn danh; mọi người đối chiếu được kết quả công khai với các phiếu hợp lệ mà không có danh sách ghép cử tri với lựa chọn.

## Phạm vi (lát cắt dọc, xóa dòng không áp dụng)
- Backend / API (contract): hoàn chỉnh chuyển giai đoạn, kiểm đếm và công bố kết quả theo cơ chế T019 đã chốt; đóng nhận phiếu sau khi kết thúc.
- Giao diện: thao tác kết thúc cho Admin, bảng kết quả, tổng phiếu hợp lệ, tỷ lệ và trường hợp hòa hoặc không có phiếu.
- Giao diện: đồng bộ tên giai đoạn và hướng dẫn; bỏ yêu cầu nhập salt trong luồng mới nếu thiết kế đã duyệt thay Commit–Reveal.

## Xong khi (kiểm tra được bằng chạy hoặc test)
- Chạy từ tạo cuộc bầu cử, đăng ký, bỏ phiếu đến kết thúc và xem kết quả trên giao diện với nhiều cử tri.
- Chỉ Admin được chuyển giai đoạn hoặc kết thúc; phiếu gửi sau khi kết thúc bị từ chối.
- Tổng và số phiếu từng phương án khớp dữ liệu phiếu hợp lệ, không tăng từ proof lỗi, gửi lặp hoặc giao dịch thất bại; có cách đối chiếu công khai bằng test hoặc script.
- Hòa phiếu, không có phiếu và nhiều cuộc bầu cử được hiển thị đúng; người xem không cần có secret cử tri để đọc kết quả.
- Contract, sự kiện, API và màn hình kết quả không bổ sung liên kết giữa danh tính đăng ký và phương án.
- Nếu cơ chế đã chốt chỉ cho xem kết quả cuối trên UI nhưng tally vẫn suy ra được trước đó trên chain, tài liệu và giao diện không tuyên bố tally được giữ bí mật.

## Ghi chú
- Thời điểm có thể suy ra tally từ dữ liệu công khai là (CHƯA CHỐT) tại thời điểm tạo task và phải được xác định trong T019.
- Không tự thay đổi quyền đọc kết quả hoặc thêm tính năng ngoài state machine đã duyệt.

## Kết quả (điền khi xong)
- Điền ngày xong, commit / PR chính và việc phát sinh hoặc còn tồn sau khi hoàn tất.
