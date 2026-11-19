# Quyết định thiết kế đã chốt

Cập nhật: 2026-11-19

## Danh sách

## D001 - Ngôn ngữ title commit bằng tiếng Việt
- Ngày: 2026-11-19
- Quyết định: Sử dụng tiếng Việt cho toàn bộ title commit (theo cấu trúc `<loại>: <mô tả ngắn>`).
- Lý do: Đồng bộ với toàn bộ tài liệu dự án trong `docs/` và báo cáo môn học bằng tiếng Việt.
- Đã loại: Tiếng Anh (không đồng bộ với ngôn ngữ tài liệu chung).

## D002 - Chiến lược merge branch vào main bằng git merge --no-ff
- Ngày: 2026-11-19
- Quyết định: Sử dụng `git merge --no-ff` khi hoàn thành task để hợp nhất vào `main`, sau đó xóa nhánh task.
- Lý do: Giữ nguyên lịch sử commit chi tiết của từng bước làm việc, phục vụ minh chứng tiến trình làm bài.
- Đã loại: Squash commit (làm mất lịch sử các commit chi tiết).
