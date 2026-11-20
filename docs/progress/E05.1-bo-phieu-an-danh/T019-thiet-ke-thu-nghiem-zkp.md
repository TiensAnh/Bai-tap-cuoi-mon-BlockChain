# T019 - Chốt thiết kế và thử nghiệm ZKP

Cập nhật: 2026-11-20
Epic: E05.1
Nhánh: `feature/thu-nghiem-zkp`
Phụ thuộc: T010, T011

## Mục tiêu
- Kiểm chứng một luồng bỏ phiếu ZKP nhỏ chạy từ trình duyệt qua người gửi hộ đến contract local, làm cơ sở chốt thiết kế trước khi sửa luồng hiện tại.

## Phạm vi (lát cắt dọc, xóa dòng không áp dụng)
- Backend / API (contract và relayer thử nghiệm): tạo nhóm cử tri, xác thực proof, chống dùng lại nullifier và gửi hộ một phiếu trên Hardhat local.
- Giao diện: thử tạo danh tính, sinh proof và gửi phiếu; secret danh tính được giữ ở phía người dùng.
- Giao diện: thử nhập biệt danh khi bỏ phiếu theo [phạm vi epic](epic.md); thiết kế ràng buộc proof với biệt danh, lựa chọn và ngữ cảnh cuộc bầu cử.
- Tài liệu: ghi thiết kế được duyệt vào `docs/design.md`, gồm mô hình bảo vệ, state machine, đăng ký, phạm vi nullifier và luồng gửi giao dịch.

## Xong khi (kiểm tra được bằng chạy hoặc test)
- Chạy được thử nghiệm với ít nhất hai danh tính trong nhóm; proof hợp lệ được nhận, proof của người ngoài nhóm và nullifier dùng lại bị từ chối.
- Xem giao dịch thử nghiệm thấy người gửi là relayer, không phải ví đăng ký; không gửi secret danh tính hoặc Merkle path riêng tư trong dữ liệu công khai.
- Kiểm chứng công cụ và phiên bản bằng compile, sinh proof, verify và test local; ghi rõ bước nào làm được trong Remix và bước nào cần frontend hoặc dịch vụ hỗ trợ.
- Người dùng duyệt giao thức, dependency, cơ chế cấp quyền đăng ký một lần, phạm vi nullifier và message được proof bảo vệ; không dùng API hoặc chữ ký hàm chưa kiểm chứng.
- Người dùng chốt giữ hay thay Commit–Reveal; nếu giữ, thiết kế và thử nghiệm phải kiểm chứng liên kết commit với reveal và chống gửi lặp mà không gắn phiếu với ví cá nhân.
- Chốt cách phục vụ proving artifacts, vận hành relayer cho local và Sepolia, cùng các giới hạn về đăng ký, thời điểm, nhóm nhỏ và metadata.
- Thử nghiệm sửa biệt danh sau khi sinh proof bị từ chối; xác định dữ liệu công khai để đọc được biệt danh và lựa chọn mà không cần tra hồ sơ đăng ký.
- Chốt quy tắc nhập và xử lý biệt danh trùng; ghi rõ rủi ro người dùng tự tiết lộ danh tính qua tên thật hoặc biệt danh quen thuộc, và thời điểm công khai biệt danh theo cơ chế bỏ phiếu đã chọn.
- Thử nghiệm biệt danh trống hoặc chỉ có khoảng trắng được thay bằng tên mặc định theo [phạm vi epic](epic.md) trước khi tạo proof; proof bảo vệ tên đã sinh và việc thử gửi lại không tự đổi tên.
- Chốt cơ chế lưu cấu hình hiển thị avatar theo cuộc bầu cử cho [T024](T024-bat-tat-avatar.md), đảm bảo mặc định tắt và người xem đọc cùng cấu hình.

## Ghi chú
- Giao thức, phiên bản, cơ chế bỏ phiếu và chi tiết triển khai còn (CHƯA CHỐT); Semaphore là hướng đề xuất, chưa phải dependency đã được duyệt. Yêu cầu hiển thị biệt danh đã được duyệt trong epic.
- Tài liệu tham khảo: https://docs.semaphore.pse.dev/ và https://docs.semaphore.pse.dev/guides/proofs.
- Không yêu cầu cử tri cung cấp private key hoặc seed phrase của ví cho ứng dụng hay relayer.
- Thử nghiệm không được mô tả như cơ chế ẩn danh đã hoàn thiện; các task sau dùng thiết kế đã được duyệt.

## Kết quả (điền khi xong)
- Điền ngày xong, commit / PR chính và việc phát sinh hoặc còn tồn sau khi hoàn tất.
