# T021 - Bỏ phiếu ẩn danh qua relayer và chống bầu lặp

Cập nhật: 2026-11-20
Epic: E05.1
Nhánh: `feature/bo-phieu-an-danh`
Phụ thuộc: T020

## Mục tiêu
- Cử tri đã đăng ký gửi được phiếu hợp lệ qua relayer, không dùng ví đăng ký làm người gửi giao dịch bỏ phiếu và không thể bầu lặp.

## Phạm vi (lát cắt dọc, xóa dòng không áp dụng)
- Backend / API (contract): kiểm tra proof, phương án, cuộc bầu cử, giai đoạn và nullifier; ràng buộc proof với nội dung phiếu; loại bỏ việc dùng `msg.sender` làm danh tính cử tri trong luồng phiếu ẩn danh.
- Backend / API (relayer): chỉ nhận dữ liệu công khai cần thiết; xác thực yêu cầu cho contract, mạng và phương thức cho phép; quản lý gửi giao dịch và phản hồi trạng thái, không cung cấp chức năng gửi giao dịch tùy ý.
- Giao diện: sinh proof tại máy người dùng, gửi qua relayer, hiển thị đang xử lý, thành công hoặc lỗi và đối chiếu trạng thái trên chain trước khi gửi lại.

## Xong khi (kiểm tra được bằng chạy hoặc test)
- Hai cử tri đã đăng ký gửi được phiếu từ giao diện và nhận xác nhận on-chain; relayer không nhận secret danh tính hoặc khóa ví của cử tri.
- Nullifier được phân biệt theo mạng, contract và cuộc bầu cử theo thiết kế T019; cùng danh tính bầu lần hai trong cùng cuộc bầu cử bị chặn, nhưng được bầu ở cuộc bầu cử khác.
- Sửa phương án hoặc ngữ cảnh của proof, dùng nhóm sai, proof giả, phương án ngoài phạm vi hoặc gửi sai giai đoạn đều bị từ chối.
- Sao chép hoặc gửi đồng thời cùng proof không tạo thêm phiếu; khôi phục danh tính hoặc xóa trạng thái UI không vượt qua được chặn bầu lặp.
- Giao dịch và sự kiện phiếu không chứa ví đăng ký, secret, identity commitment cụ thể hoặc thông tin công khai khác trực tiếp chỉ ra thành viên đã bỏ phiếu; địa chỉ gửi giao dịch là relayer.
- Khi relayer lỗi, người dùng nhận thông báo và có thể kiểm tra, thử lại an toàn; không tự chuyển sang gửi bằng ví cá nhân làm mất mức bảo vệ đã cam kết.
- Test kiểm tra relay từ chối đích gọi hoặc payload ngoài phạm vi; cấu hình bí mật không xuất hiện trong frontend, source hoặc log.

## Ghi chú
- Cách lưu trạng thái phiếu và tích hợp Commit–Reveal theo quyết định T019; nếu giữ hai giai đoạn, cả hai bước phải đạt các điều kiện bảo vệ tương ứng.
- Relayer giúp che ví gửi khỏi dữ liệu giao dịch bỏ phiếu; không tự bảo đảm che IP hoặc chống suy luận từ thời điểm. Không ghi log nối dữ liệu đăng ký với phiếu.
- Công cụ, dependency và môi trường dịch vụ phải được duyệt trước khi bổ sung; không ghi file hoặc cache lên ổ C.

## Kết quả (điền khi xong)
- Điền ngày xong, commit / PR chính và việc phát sinh hoặc còn tồn sau khi hoàn tất.
