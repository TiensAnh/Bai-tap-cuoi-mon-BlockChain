# T023 - Kiểm thử quyền riêng tư và bàn giao demo

Cập nhật: 2026-11-20
Epic: E05.1
Nhánh: `feature/kiem-chung-an-danh`
Phụ thuộc: T022

## Mục tiêu
- Kiểm chứng luồng ẩn danh hoàn chỉnh trên local và bàn giao cấu hình, cách chạy, giới hạn bảo vệ cho E06 triển khai và demo.

## Phạm vi (lát cắt dọc, xóa dòng không áp dụng)
- Backend / API (contract và relayer): kiểm thử proof, quyền đăng ký, nullifier, replay, nhiều cuộc bầu cử, nội dung giao dịch, sự kiện và log dịch vụ.
- Giao diện: kiểm thử đăng ký, sao lưu, khôi phục, bỏ phiếu, lỗi relayer, tải lại trang và kết quả với nhiều phiên cử tri.
- Tài liệu: cập nhật `README.md`, `docs/overview.md` và `docs/design.md` theo thiết kế đã chạy; chuẩn bị hướng dẫn local, proving artifacts, relayer và điều kiện triển khai Sepolia.
- Tài liệu: điều chỉnh kịch bản trong `../E06-trien-khai-demo/T013-demo-end-to-end.md` theo luồng đã duyệt, thay các bước commit / salt / reveal nếu chúng không còn áp dụng.

## Xong khi (kiểm tra được bằng chạy hoặc test)
- Compile contract, chạy bộ test liên quan và build frontend thành công; ghi lệnh, kết quả thực tế và giới hạn kiểm thử trong phần kết quả.
- Chạy local từ đầu với Admin, ít nhất hai cử tri và một người ngoài nhóm; khôi phục danh tính vẫn bầu đúng quyền và không bầu lặp được.
- Test bao phủ proof giả, sửa nội dung, sai ngữ cảnh, replay, gửi đồng thời, sai giai đoạn, relay gián đoạn và phiếu sau khi kết thúc.
- Rà soát giao dịch, calldata, sự kiện, yêu cầu HTTP, log và đầu ra frontend; không có secret hoặc liên kết trực tiếp giữa ví đăng ký với từng phiếu trong các dữ liệu công khai theo thiết kế đã chốt.
- Ghi rõ rủi ro suy luận từ thời điểm, metadata, nhóm ít người và cơ chế đăng ký; không coi việc test qua là bằng chứng ẩn danh tuyệt đối.
- Tài liệu và kịch bản T013 khớp luồng mới; xác định đủ thành phần phải triển khai, phiên bản, artifact, cách cấu hình contract và dịch vụ relayer cho T012, không ghi khóa hoặc giá trị môi trường bí mật.

## Ghi chú
- Chỉ bàn giao để triển khai; không tự gửi giao dịch lên Sepolia, cài thêm dependency, commit, push hoặc merge trong task kiểm thử.
- E06 chỉ bắt đầu sau khi toàn bộ task E05.1 hoàn tất theo quy tắc tiến độ; không đánh dấu hoàn thành chỉ vì đã viết test hoặc tài liệu.

## Kết quả (điền khi xong)
- Điền ngày xong, commit / PR chính và việc phát sinh hoặc còn tồn sau khi hoàn tất.
