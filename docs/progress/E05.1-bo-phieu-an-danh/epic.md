# E05.1 - Mở rộng bỏ phiếu ẩn danh

Cập nhật: 2026-11-20
Ưu tiên: P1

## Mục tiêu
- Đáp ứng yêu cầu đề bài: tạo cuộc bầu cử, cho phép bỏ phiếu ẩn danh, kiểm đếm và công bố kết quả minh bạch.
- Tách việc xác minh quyền tham gia khỏi việc gửi phiếu, để dữ liệu công khai của phiếu không trực tiếp chỉ ra danh tính hoặc ví đăng ký của cử tri trong mô hình bảo vệ đã chốt.
- Thứ tự thực hiện: sau E05, trước [E06 - Triển khai và demo](../E06-trien-khai-demo/epic.md). T019–T024 phải hoàn tất trước T012; làm theo danh sách bên dưới, T024 trước T023 kiểm thử bàn giao. Mã task là định danh, không quyết định thứ tự thực hiện.

## Phạm vi
- Làm: thiết kế và thử nghiệm ZKP; đăng ký danh tính bỏ phiếu; gửi phiếu qua relayer; chống bầu lặp; kiểm đếm công khai; kiểm thử và bàn giao cho demo.
- Làm: cử tri tự đặt biệt danh riêng cho cuộc bầu cử khi gửi phiếu; công khai biệt danh cùng lựa chọn, ví dụ "Con chó đã bỏ phiếu cho Tiến Anh". Biệt danh gắn với phiếu, danh tính thật và ví đăng ký được giữ tách khỏi phiếu cả sau khi kết thúc.
- Làm: biệt danh là tùy chọn; để trống hoặc chỉ nhập khoảng trắng thì tự sinh tên dạng `User_<mã ngẫu nhiên>`, ví dụ `User_K7M2Q9`. Không suy ra mã này từ ví, tên thật hoặc thông tin đăng ký; sinh tên trước khi tạo proof và giữ nguyên khi thử gửi lại cùng phiếu.
- Làm: tách biệt danh bỏ phiếu khỏi thông tin đăng ký Admin duyệt; không đưa biệt danh vào hồ sơ đăng ký hoặc tạo bảng nối danh tính thật / ví đăng ký với biệt danh trên server hay blockchain.
- Làm: proof bảo vệ biệt danh cùng lựa chọn; thay biệt danh không cấp thêm lượt bầu, quyền bầu vẫn được kiểm tra bằng proof và nullifier.
- Làm: Admin có công tắc "Hiển thị avatar ứng viên" trong form tạo cuộc bầu cử, mặc định tắt; cấu hình riêng từng cuộc bầu cử và hiển thị thống nhất cho người xem. Avatar là vòng tròn chữ cái đầu tên ứng viên hiện có, không bổ sung tải ảnh lên.
- Làm: triển khai theo lát cắt dọc, mỗi task có luồng chạy được hoặc thử nghiệm kiểm chứng; mọi task ban đầu đều chưa làm.
- Không làm: triển khai bản cuối lên Sepolia, verify Etherscan, quay video, viết báo cáo hoặc slide; các phần đó thuộc E06 và E07.
- Không làm: coi việc ẩn địa chỉ trên UI, băm địa chỉ hoặc dùng Merkle whitelist thông thường là đủ để bảo đảm ẩn danh.
- Không làm: tự triển khai hệ mật mã mới, bảo đảm chống cưỡng ép hoặc cam kết ẩn danh tuyệt đối trước mọi dữ liệu ngoài blockchain.

## Danh sách task (theo thứ tự làm)
Ký hiệu: `[ ]` chưa làm | `[~]` đang làm | `[x]` xong | `[!]` vướng | `[-]` bỏ

- [ ] [T019 - Chốt thiết kế và thử nghiệm ZKP](T019-thiet-ke-thu-nghiem-zkp.md) — `feature/thu-nghiem-zkp`
- [ ] [T020 - Đăng ký và sao lưu danh tính cử tri](T020-dang-ky-danh-tinh.md) — `feature/dang-ky-an-danh`
- [ ] [T021 - Bỏ phiếu ẩn danh qua relayer và chống bầu lặp](T021-bo-phieu-an-danh.md) — `feature/bo-phieu-an-danh`
- [ ] [T022 - Kết thúc bầu cử và công bố kết quả](T022-ket-qua-an-danh.md) — `feature/ket-qua-an-danh`
- [ ] [T024 - Bật/tắt avatar ứng viên](T024-bat-tat-avatar.md) — `feature/bat-tat-avatar`
- [ ] [T023 - Kiểm thử quyền riêng tư và bàn giao demo](T023-kiem-thu-ban-giao.md) — `feature/kiem-chung-an-danh`

## Vướng mắc / chờ quyết định
- T019: (CHƯA CHỐT) giao thức và phiên bản ZKP cụ thể; hướng đề xuất là Semaphore. Cần kiểm chứng khả năng tương thích Solidity, OpenZeppelin, Hardhat và cách thao tác bằng Remix.
- T019: (CHƯA CHỐT) thay Commit–Reveal bằng bỏ phiếu ẩn danh trực tiếp hay giữ cơ chế hai giai đoạn; đề bài không nêu yêu cầu giấu tally đến lúc kết thúc.
- T019: (CHƯA CHỐT) mô hình bảo vệ, giới hạn suy luận từ thời điểm gửi phiếu, nhóm ít người, đăng ký và thông tin mạng.
- T019: (CHƯA CHỐT) quy tắc độ dài, ký tự, chuẩn hóa và xử lý biệt danh trùng; biệt danh không được dùng làm mã định danh chống bầu lặp.
- T019, T024: (CHƯA CHỐT) cơ chế lưu cấu hình avatar theo cuộc bầu cử để đồng bộ sau tải lại trang và giữa các trình duyệt; yêu cầu mặc định tắt đã chốt.
- T019, T021: (CHƯA CHỐT) cách vận hành relayer khi demo Sepolia, nơi chạy dịch vụ và cách cấp gas; không lưu khóa hoặc giá trị cấu hình bí mật trong tài liệu.
- T019–T024: (CHƯA CHỐT) thời lượng thực hiện và ảnh hưởng tới hạn nộp 2026-11-23 của E06, E07; chưa cam kết hoàn thành kịp hạn.
- Việc tạo kế hoạch không đồng nghĩa cho phép cài dependency, triển khai code hoặc gửi giao dịch; cần người dùng giao thực hiện task tương ứng và duyệt dependency bổ sung trước khi cài.
