# Đề tài 3: Hợp đồng thông minh quản lý bỏ phiếu điện tử (EVoting)

Bài tập lớn kết thúc học phần Blockchain.

## 1. Giới thiệu đề tài
Hệ thống bỏ phiếu điện tử phi tập trung trên nền tảng Ethereum (Sepolia Testnet) kết hợp giao diện web:
- **Ẩn danh phiếu bầu**: Sử dụng cơ chế Commit-Reveal với mã băm `keccak256(option + salt + voterAddress)`.
- **Quản lý cử tri**: Phân quyền bằng danh sách trắng (Whitelist qua mapping).
- **Minh bạch & Toàn vẹn**: Kiểm đếm tự động trên Smart Contract, kết quả công khai, chống gian lận.

## 2. Công nghệ sử dụng
- **Smart Contract**: Solidity (>=0.8.20), OpenZeppelin Contracts (Ownable).
- **Môi trường & Công cụ**: Remix IDE, Remix VM, Sepolia Testnet, MetaMask, Etherscan.
- **Frontend**: React, Vite, ethers.js v6.

## 3. Cấu trúc thư mục
```
├── contracts/        # Mã nguồn Smart Contract (.sol)
├── frontend/         # Mã nguồn giao diện Web (React + Vite)
├── docs/             # Tài liệu dự án, thiết kế, bài học, quyết định và tiến độ
│   ├── progress/     # Danh sách các Epic và Task theo dõi tiến độ
│   ├── design.md     # Bản thiết kế chi tiết (State machine, Sequence, UI flow)
│   ├── overview.md   # Tổng quan dự án
│   ├── decisions.md  # Các quyết định kỹ thuật đã chốt
│   ├── lessons.md    # Sổ bài học kinh nghiệm
│   └── workflow.md   # Quy trình chia task, branch, commit, merge
├── AGENTS.md         # Quy tắc làm việc của dự án
└── README.md         # Giới thiệu dự án
```

## 4. Hướng dẫn cài đặt & Sử dụng
- Xem chi tiết tại [docs/overview.md](docs/overview.md) và [docs/workflow.md](docs/workflow.md).
