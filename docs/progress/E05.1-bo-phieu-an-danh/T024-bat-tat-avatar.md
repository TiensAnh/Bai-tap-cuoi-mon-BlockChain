# T024 - Bật/tắt avatar ứng viên

Cập nhật: 2026-11-20
Epic: E05.1
Nhánh: `feature/bat-tat-avatar`
Phụ thuộc: T022

## Mục tiêu
- Admin chọn hiển thị avatar ứng viên ngay khi tạo cuộc bầu cử; mặc định không hiển thị, mọi người xem cùng cấu hình của cuộc bầu cử đó.

## Phạm vi (lát cắt dọc, xóa dòng không áp dụng)
- Backend / API (cấu hình cuộc bầu cử): lưu và đọc tùy chọn hiển thị avatar theo cơ chế đã chốt ở T019; không dùng thiết lập riêng của trình duyệt làm nguồn cấu hình chung.
- Giao diện: thêm công tắc "Hiển thị avatar ứng viên" vào form tạo cuộc bầu cử; khởi tạo ở trạng thái tắt khi mở form tạo mới.
- Giao diện: màn hình chọn phương án và các vị trí hiển thị avatar ứng viên hiện có tuân theo tùy chọn của đúng cuộc bầu cử; tắt thì chỉ hiện tên và thông tin phương án, không chừa khung avatar rỗng.

## Xong khi (kiểm tra được bằng chạy hoặc test)
- Tạo cuộc bầu cử mà không thao tác công tắc thì avatar không xuất hiện; bật trước khi tạo thì avatar hiện đúng chữ cái đầu tên ứng viên.
- Đổi công tắc từ bật về tắt trước khi tạo lưu đúng trạng thái cuối; sau khi tạo xong và mở form mới, công tắc trở về mặc định tắt.
- Hai cuộc bầu cử có tùy chọn khác nhau hiển thị độc lập; tải lại trang hoặc mở trên trình duyệt khác vẫn đọc được đúng cấu hình.
- Cuộc bầu cử chưa có dữ liệu tùy chọn được hiển thị mặc định tắt theo cơ chế tương thích đã chốt ở T019.
- Bật hoặc tắt avatar không thay đổi tên, thứ tự, chỉ số phương án, proof, nullifier hoặc kết quả kiểm đếm.
- Build frontend và các kiểm tra liên quan đến cấu hình lưu trữ đạt; không bổ sung chức năng tải ảnh hoặc dependency cho avatar.

## Ghi chú
- Avatar ở đây là vòng tròn chứa chữ cái đầu tên ứng viên trong `frontend/src/components/Icons.jsx`, không phải avatar của cử tri hoặc ảnh người dùng tải lên.
- Cơ chế lưu cấu hình và xử lý cuộc bầu cử cũ còn (CHƯA CHỐT), được xác định tại T019. Không tự bổ sung quyền sửa cấu hình sau khi cuộc bầu cử đã tạo.
- Task được bổ sung sau T023 nên có mã T024, nhưng thực hiện trước T023 kiểm thử bàn giao theo [thứ tự epic](epic.md).

## Kết quả (điền khi xong)
- Điền ngày xong, commit / PR chính và việc phát sinh hoặc còn tồn sau khi hoàn tất.
