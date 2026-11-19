# T020 - Đăng ký và sao lưu danh tính cử tri

Cập nhật: 2026-11-20
Epic: E05.1
Nhánh: `feature/dang-ky-an-danh`
Phụ thuộc: T019

## Mục tiêu
- Cử tri hợp lệ đăng ký được danh tính bỏ phiếu, sao lưu và khôi phục danh tính đó; Admin quản lý nhóm được quyền tham gia theo thiết kế đã chốt.

## Phạm vi (lát cắt dọc, xóa dòng không áp dụng)
- Backend / API (contract): kiểm tra quyền đăng ký, chặn đăng ký lặp theo cơ chế đã duyệt, thêm identity commitment vào đúng nhóm và chốt danh sách trước khi bỏ phiếu.
- Giao diện: luồng Admin cấp quyền; cử tri tạo hoặc khôi phục danh tính, đăng ký, xem kết quả xác nhận và chủ động sao lưu dữ liệu cần thiết.
- Giao diện: phân biệt ví dùng đăng ký với danh tính dùng bỏ phiếu; dữ liệu cục bộ được phân biệt theo mạng, contract và cuộc bầu cử khi phù hợp với thiết kế T019.

## Xong khi (kiểm tra được bằng chạy hoặc test)
- Cử tri được cấp quyền đăng ký thành công từ giao diện; người ngoài danh sách, đăng ký lặp và đăng ký khi danh sách đã chốt bị từ chối.
- Secret danh tính không được gửi lên chain, relayer hoặc ghi trong log; dữ liệu công khai phục vụ đăng ký chỉ theo thiết kế đã duyệt.
- Tải lại trang vẫn dùng được danh tính đã đăng ký; khôi phục bản sao lưu trên phiên trình duyệt khác tạo được proof hợp lệ cho cùng danh tính.
- Bản sao lưu sai hoặc dữ liệu của cuộc bầu cử, contract hay mạng không phù hợp được phát hiện; không tự ghi đè danh tính đã có khi người dùng chưa xác nhận.
- Test chứng minh một người đủ điều kiện không tự đăng ký nhiều danh tính để có thêm quyền bầu theo mô hình cấp quyền đã chốt.

## Ghi chú
- Cách cấp quyền đăng ký, tổ chức nhóm và định dạng sao lưu theo kết quả T019; các chi tiết này hiện (CHƯA CHỐT).
- Khôi phục danh tính không được cấp thêm lượt bầu. Kiểm tra chống bầu lặp sau khôi phục thuộc T021 và T023.
- Việc Admin biết ai được đăng ký không đồng nghĩa Admin được nhận secret hoặc liên kết được danh tính đó với từng phiếu.

## Kết quả (điền khi xong)
- Điền ngày xong, commit / PR chính và việc phát sinh hoặc còn tồn sau khi hoàn tất.
