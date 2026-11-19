# E05.1 - Mở rộng bỏ phiếu ẩn danh

Cập nhật: 2026-11-20
Ưu tiên: P1

## Mục tiêu
- Đáp ứng yêu cầu đề bài: tạo cuộc bầu cử, cho phép bỏ phiếu ẩn danh, kiểm đếm và công bố kết quả minh bạch.
- Tách việc xác minh quyền tham gia khỏi việc gửi phiếu, để dữ liệu công khai của phiếu không trực tiếp chỉ ra danh tính hoặc ví đăng ký của cử tri trong mô hình bảo vệ đã chốt.
- Thứ tự thực hiện: sau E05, trước [E06 - Triển khai và demo](../E06-trien-khai-demo/epic.md). T019–T023 phải hoàn tất trước T012; mã task tăng tiếp sau T018 và không phản ánh thứ tự giữa các epic.

## Phạm vi
- Làm: thiết kế và thử nghiệm ZKP; đăng ký danh tính bỏ phiếu; gửi phiếu qua relayer; chống bầu lặp; kiểm đếm công khai; kiểm thử và bàn giao cho demo.
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
- [ ] [T023 - Kiểm thử quyền riêng tư và bàn giao demo](T023-kiem-thu-ban-giao.md) — `feature/kiem-chung-an-danh`

## Vướng mắc / chờ quyết định
- T019: (CHƯA CHỐT) giao thức và phiên bản ZKP cụ thể; hướng đề xuất là Semaphore. Cần kiểm chứng khả năng tương thích Solidity, OpenZeppelin, Hardhat và cách thao tác bằng Remix.
- T019: (CHƯA CHỐT) thay Commit–Reveal bằng bỏ phiếu ẩn danh trực tiếp hay giữ cơ chế hai giai đoạn; đề bài không nêu yêu cầu giấu tally đến lúc kết thúc.
- T019: (CHƯA CHỐT) mô hình bảo vệ, giới hạn suy luận từ thời điểm gửi phiếu, nhóm ít người, đăng ký và thông tin mạng.
- T019, T021: (CHƯA CHỐT) cách vận hành relayer khi demo Sepolia, nơi chạy dịch vụ và cách cấp gas; không lưu khóa hoặc giá trị cấu hình bí mật trong tài liệu.
- T019–T023: (CHƯA CHỐT) thời lượng thực hiện và ảnh hưởng tới hạn nộp 2026-11-23 của E06, E07; chưa cam kết hoàn thành kịp hạn.
- Việc tạo kế hoạch không đồng nghĩa cho phép cài dependency, triển khai code hoặc gửi giao dịch; cần người dùng giao thực hiện task tương ứng và duyệt dependency bổ sung trước khi cài.
