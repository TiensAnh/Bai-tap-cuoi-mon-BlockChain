# Quy tắc làm việc với docs/

Cập nhật: 2026-11-19

## Tài liệu của dự án (docs/)

### Đọc file nào khi nào
| File | Nội dung | Đọc khi |
|---|---|---|
| docs/overview.md | Mục tiêu, công nghệ, cấu trúc, lệnh chạy | Đầu mỗi phiên làm việc |
| docs/lessons.md | Lỗi đã gặp và cách đúng | Đầu mỗi phiên làm việc |
| docs/progress/ | Kế hoạch và tiến độ: mỗi epic một thư mục, trong đó có epic.md (danh sách task kèm trạng thái) và một file cho mỗi task | Đầu phiên (chỉ epic.md của epic chưa xong), khi tôi hỏi tiến độ, khi chia task hoặc chọn việc tiếp theo |
| docs/db.md | Bản thiết kế schema DB (khi chạy thật, migration là chuẩn) | Đụng DB, entity, API về dữ liệu |
| docs/decisions.md | Quyết định thiết kế đã chốt | Trước khi đề xuất đổi thiết kế |
| docs/workflow.md | Chia task, đặt tên branch, commit, push, merge, sửa lỗi | Trước khi chia task, tạo branch, commit, push hoặc merge |

### Quy tắc đọc
- Đầu phiên chỉ đọc overview, lessons và epic.md của các epic chưa xong
  (xem mục "Kế hoạch và tiến độ"). Các file khác (db, decisions,
  workflow, file task) đọc khi việc liên quan, không đọc hết một lượt.
- File task (docs/progress/E../T...md) chỉ đọc khi làm đúng task đó,
  khi cập nhật nó, hoặc khi tôi hỏi về nó.
- workflow.md: đọc trước khi làm bất kỳ việc nào liên quan đến git
  (tạo branch, commit, push, merge) hoặc khi tôi giao một tính năng cần
  chia task. Không làm theo trí nhớ. Đã đọc trong phiên và file không
  đổi thì không cần đọc lại.
- Lời tôi nói trong phiên hiện tại ưu tiên hơn docs.
- File hoặc thư mục docs trong bảng mà chưa có thì báo tôi, không tự
  tạo và không bỏ qua im lặng.

### File chưa điền
- File có dòng `Trạng thái: CHƯA ĐIỀN`, hoặc file rỗng, coi như chưa có
  thông tin. Không đoán nội dung, không suy ra từ tên file.
- docs/progress/ chưa có epic thật (chỉ có `_mau/`) cũng coi như chưa có
  kế hoạch.
- Báo tôi MỘT lần ở đầu phiên (gộp tất cả file chưa điền vào một câu),
  rồi làm tiếp việc được giao bằng cách đọc code. Không nhắc lại trong
  cùng phiên.
- Khi tôi điền xong, tôi tự xóa dòng `Trạng thái: CHƯA ĐIỀN`.

### Khi thông tin mâu thuẫn
Thứ tự tin cậy, từ cao xuống thấp:
1. Lời tôi nói trong phiên hiện tại.
2. Code và migration đang chạy thật.
3. docs/decisions.md (với câu hỏi "vì sao thiết kế như vậy").
4. Các file docs còn lại.

Khi phát hiện lệch, làm theo mức cao hơn, báo tôi chỗ lệch (nói rõ
file nào, dòng nào, lệch gì), KHÔNG tự sửa docs. Các trường hợp hay gặp:
- docs/db.md lệch migration: lấy migration làm chuẩn.
- docs/progress/ lệch git: tin git, báo tôi. Ví dụ: task `[~]` mà
  không có branch nào; task `[x]` mà branch chưa merge vào `main`;
  đang có branch làm dở mà không có task tương ứng.
- Hai file docs nói khác nhau: báo tôi, không tự chọn.

### Quy tắc viết
- Chỉ tạo hoặc sửa file trong docs/ khi tôi yêu cầu hoặc đã đồng ý.
  Trước khi ghi, nói rõ sẽ ghi gì vào file nào, chờ tôi đồng ý.
- Mỗi thông tin chỉ ghi ở MỘT file, nơi khác chỉ trỏ tới.
- Viết tiếng Việt, ngắn gọn, gạch đầu dòng.
- Đầu mỗi file có dòng `Cập nhật: YYYY-MM-DD`, cập nhật mỗi lần sửa file.
- Chỉ ghi điều đã chốt, không ghi suy đoán hay kế hoạch chưa duyệt.
- Không ghi mật khẩu, token, khóa, giá trị biến môi trường vào docs.

## Kế hoạch và tiến độ (docs/progress/)

Đây là nơi DUY NHẤT ghi epic, task và trạng thái của chúng. Không tạo
file plan, todo hay kế hoạch riêng ở chỗ khác.

### Cấu trúc
```
docs/progress/
  _mau/                    khuôn mẫu, KHÔNG phải epic thật
    epic.md
    T000-ten-task.md
  _xong/                   epic đã xong (chuyển vào khi tôi đồng ý)
  E01-ten-epic/
    epic.md                mục tiêu, phạm vi, danh sách task + trạng thái
    T001-ten-task.md       một file cho mỗi task
    T002-ten-task.md
  E02-ten-epic/
    epic.md
    T003-ten-task.md
```
- Thư mục bắt đầu bằng `_` không phải epic: bỏ qua khi tìm việc, chỉ
  dùng làm khuôn mẫu hoặc lưu trữ.
- Tên epic: `E<2 chữ số>-<tên-kebab-case>`. Tên task:
  `T<3 chữ số>-<tên-kebab-case>.md`.
- Mã số tăng dần trong toàn dự án (task không đánh số lại theo epic),
  không dùng lại, không đổi.
- Tạo epic hoặc task mới thì sao chép cấu trúc từ `_mau/`, giữ nguyên
  các mục, xóa mục không áp dụng thay vì để trống.

### Trạng thái
Chỉ ghi trong epic.md (không ghi trong file task):
| Ký hiệu | Ý nghĩa |
|---|---|
| `[ ]` | chưa làm |
| `[~]` | đang làm |
| `[x]` | xong (đã merge vào `main`) |
| `[!]` | vướng, đang chờ (ghi lý do ở mục "Vướng mắc" của epic.md) |
| `[-]` | bỏ (ghi lý do trong file task) |

- Epic xong khi mọi task là `[x]` hoặc `[-]`.
- Ngày xong và kết quả ghi trong file task, không lặp lại ở epic.md.

### Quy trình
1. Tôi giao một tính năng lớn: bạn đề xuất danh sách epic và task ngay
   trong câu trả lời, CHƯA ghi file. Chia theo lát cắt dọc (xem
   workflow.md mục 2); mỗi task đủ nhỏ để xong trong một branch.
2. Tôi duyệt hoặc chỉnh. Chỉ sau khi tôi đồng ý, nói rõ sẽ tạo những
   file nào rồi mới tạo. Ghi đúng điều đã duyệt: không tự thêm phạm vi
   hay tiêu chí tôi chưa chốt, chỗ chưa chốt ghi `(CHƯA CHỐT)`.
3. Làm từng task một. Tối đa MỘT task `[~]` trong toàn dự án, trừ khi
   tôi nói khác.
4. Bắt đầu task: tạo branch theo mục "Nhánh" trong file task (theo
   workflow.md), đề xuất đổi `[ ]` thành `[~]`.
5. Xong task: đối chiếu từng mục "Xong khi", điền mục "Kết quả" trong
   file task, đề xuất đổi `[~]` thành `[x]` sau khi merge. Gom vào MỘT
   câu hỏi theo mục "Khi nào đề xuất cập nhật docs".
6. Thêm, bớt, gộp, tách hoặc đổi thứ tự task và epic: báo tôi, không tự
   làm. Việc phát sinh ngoài danh sách thì báo, không tự làm thêm.
7. Task bỏ: đánh `[-]`, ghi lý do trong file task, không xóa file.
8. Xong cả epic: đề xuất chuyển thư mục epic vào `_xong/`.

### Nội dung các file (theo `_mau/`)
- epic.md: mục tiêu, phạm vi (làm / không làm), danh sách task theo thứ
  tự làm kèm trạng thái và nhánh, vướng mắc.
- File task: epic, nhánh, phụ thuộc, mục tiêu, phạm vi (lát cắt dọc),
  tiêu chí "Xong khi" kiểm tra được bằng chạy hoặc test, ghi chú, kết
  quả (điền khi xong).
- Quyết định thiết kế liên quan: trỏ tới mã D00x trong docs/decisions.md,
  không chép lại.

### Khi nào đề xuất cập nhật docs
Sau khi xong việc, nếu xảy ra sự kiện dưới đây thì hỏi tôi MỘT lần
duy nhất, gom tất cả file cần cập nhật vào cùng một câu hỏi, không tự ghi:
| Sự kiện | File |
|---|---|
| Đổi schema DB | docs/db.md (kèm migration) |
| Chốt một quyết định thiết kế | docs/decisions.md |
| Sửa lỗi do hiểu sai hoặc gặp bẫy đặc thù | docs/lessons.md |
| Bắt đầu hoặc hoàn thành một task | docs/progress/ (epic.md và file task) |
| Thêm, bớt, đổi task hoặc epic; xong cả epic | docs/progress/ |
| Đổi công nghệ, cấu trúc, lệnh | docs/overview.md |
| Đổi cách chia task, branch, commit, push | docs/workflow.md |

### Khi đổi schema DB
1. Chốt thay đổi với tôi trước khi làm.
2. Viết migration mới, không sửa migration đã có.
3. Cập nhật docs/db.md cho khớp, trong cùng một việc với migration
   (sau khi tôi đồng ý).
4. Sửa entity và code liên quan, chạy test.
5. Nếu docs/db.md và migration lệch nhau, lấy migration làm chuẩn và
   báo tôi chỗ lệch.

### Định dạng mục ghi vào docs
Mục lessons (tối đa 3 dòng, không trùng mục đã có):
```
- [L012] Bối cảnh: ... | Sai: ... | Đúng: ...
```
Mục decisions:
```
## D007 - Tên quyết định ngắn
- Ngày: YYYY-MM-DD
- Quyết định: ...
- Lý do: ...
- Đã loại: ... (vì sao loại)
- Thay thế: D00x (chỉ ghi khi quyết định này thay cho quyết định cũ)
```
Quyết định cũ không bị xóa. Khi đổi, thêm mục mới và đánh dấu mục cũ
`[ĐÃ THAY BẰNG D00y]`.

### Sổ bài học (docs/lessons.md)
- Khi tôi sửa lỗi cho bạn, bạn mắc lại lỗi cũ, hoặc gặp bẫy đặc thù của
  dự án, đề xuất một mục theo định dạng trên. Chỉ ghi sau khi tôi đồng ý.

### Giữ docs gọn
- docs/progress/: epic xong thì chuyển vào `_xong/`. Epic xong lâu thì
  đề xuất xóa các file task, chỉ giữ epic.md (giữ mã số). Chỉ đọc epic
  chưa xong ở đầu phiên.
- lessons.md giữ dưới khoảng 30 mục. Bài nào đúng mãi thì đề xuất chuyển
  lên rule rồi xóa khỏi sổ.
- decisions.md: mục đã bị thay thế thì rút gọn còn một dòng, giữ mã số.
