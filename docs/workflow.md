# Quy trình làm việc: task, branch, commit, push

Cập nhật: 2026-11-19

Áp dụng cho mọi dự án của tôi. Quy tắc riêng của từng dự án (nếu có)
nằm trong AGENTS.md của dự án đó và ưu tiên hơn file này.

## 1. Nguyên tắc chung
- Không làm trực tiếp trên `main`. `main` luôn build và chạy được.
- Một branch = một mục tiêu. Không gộp việc không liên quan vào cùng branch.
- AI không tự commit, push, merge khi chưa được tôi đồng ý ở bước tương ứng.

## 2. Chia task
- Chia theo lát cắt dọc (vertical slice): mỗi task là một phần nhỏ chạy
  được từ đầu đến cuối (DB, API, giao diện), không chia theo tầng
  (không có task "làm hết backend rồi mới làm frontend").
- Mỗi task đủ nhỏ để xong trong một branch, kiểm tra được bằng cách chạy
  hoặc test.
- Quy trình khi tôi giao một tính năng lớn:
  1. Nhóm thành epic, liệt kê task theo thứ tự trong mỗi epic, mỗi task
     một dòng.
  2. Chờ tôi duyệt hoặc chỉnh danh sách.
  3. Sau khi tôi duyệt, ghi vào docs/progress/ theo mục "Kế hoạch và
     tiến độ" trong AGENTS.md (cách ghi không lặp lại ở đây).
  4. Làm từng task một, xong task nào báo tôi task đó.
- Task phát sinh ngoài danh sách thì báo tôi, không tự làm thêm.

## 3. Đặt tên branch
Dạng: `<loại>/<tên-ngắn-kebab-case>`

| Loại | Dùng khi | Ví dụ |
|---|---|---|
| `feature/` | Thêm tính năng mới | `feature/ky-nhay-pdf` |
| `fix/` | Sửa lỗi | `fix/jwt-thieu-role` |
| `refactor/` | Đổi cấu trúc code, không đổi hành vi | `refactor/tach-service-van-ban` |
| `docs/` | Chỉ sửa tài liệu | `docs/cap-nhat-overview` |
| `chore/` | Cấu hình, thư viện, CI | `chore/nang-cap-spring-boot` |

- Luôn tạo branch từ `main` mới nhất (pull trước khi tạo).
- Tên ngắn, không dấu, không viết hoa, tối đa khoảng 4 từ.

## 4. Commit
Dạng title: `<loại>: <mô tả ngắn>`

| Loại | Dùng khi |
|---|---|
| `feat` | Thêm tính năng |
| `fix` | Sửa lỗi |
| `refactor` | Đổi cấu trúc, không đổi hành vi |
| `docs` | Sửa tài liệu |
| `test` | Thêm hoặc sửa test |
| `chore` | Cấu hình, thư viện, việc lặt vặt |

- Title: ngôn ngữ (TỰ CHỌN: tiếng Việt hoặc tiếng Anh, chọn một và giữ
  nhất quán), thể mệnh lệnh, không chấm cuối, tối đa khoảng 72 ký tự.
  Ví dụ: `feat: thêm API ký nháy PDF`, `fix: sửa thiếu role trong JWT`.
- Thân commit (không bắt buộc): viết khi cần giải thích "vì sao", không
  cần giải thích "làm gì".
- Mỗi commit một ý, sau commit code vẫn build được.
- Đổi schema DB: migration và entity đi cùng một commit, title
  `feat(db): ...`. Quy trình chi tiết theo mục "Khi đổi schema DB" trong AGENTS.md.
- Không commit: mật khẩu, token, khóa, file `.env`, file build.

## 5. Push và merge
- Trước khi push: chạy test và build, phải qua.
- Chỉ push branch của mình, không push thẳng vào `main`.
- Không `force push` trừ khi tôi cho phép rõ ràng.
- Merge vào `main` khi tôi đồng ý (TỰ CHỌN: tạo PR hay merge trực tiếp;
  squash hay giữ nguyên commit).
- Sau khi merge: xóa branch đã xong.

## 6. Sửa lỗi (branch `fix/`)
1. Tạo `fix/<tên>` từ `main`.
2. Tái hiện lỗi trước, rồi mới sửa. Nếu có thể, viết test cho lỗi đó.
3. Sửa đúng nguyên nhân gốc, không chữa triệu chứng.
4. Nếu lỗi do hiểu sai hoặc bẫy đặc thù của dự án: đề xuất mục cho
   docs/lessons.md theo quy tắc trong AGENTS.md (hỏi tôi, không tự ghi).

## 7. Liên hệ với docs/
- Bắt đầu hoặc xong một task: hỏi tôi có cập nhật docs/progress/ không
  (theo bảng "Khi nào đề xuất cập nhật docs" trong AGENTS.md).
- Không lặp lại nội dung này vào docs/. Chỉ trỏ tới file này.
