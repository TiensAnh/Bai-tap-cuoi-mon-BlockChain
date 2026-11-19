# Bản thiết kế Smart Contract Bỏ phiếu điện tử (EVoting)

Cập nhật: 2026-11-19

## 1. Mục tiêu và phạm vi
- Xây dựng smart contract quản lý bỏ phiếu an toàn, minh bạch trên mạng blockchain Ethereum (Sepolia testnet).
- Quản lý cử tri qua danh sách hợp lệ (whitelist bằng mapping).
- Áp dụng cơ chế commit-reveal để ẩn danh lựa chọn trong suốt giai đoạn bỏ phiếu.
- Cung cấp giao diện web cho phép cử tri và quản trị viên (admin) thao tác trực quan qua ví MetaMask.

---

## 2. Sơ đồ State Machine (Vòng đời cuộc bầu cử)

Mỗi cuộc bầu cử trải qua 3 giai đoạn tuần tự:

```mermaid
stateDiagram-v2
    [*] --> Commit: createElection() [Admin]
    Commit --> Commit: addVoters() [Admin]
    Commit --> Commit: commitVote(hash) [Voter]
    Commit --> Reveal: startReveal() [Admin]
    Reveal --> Reveal: revealVote(option, salt) [Voter]
    Reveal --> Finished: finishElection() [Admin]
    Finished --> [*]: getResults() [Public view]
```

### Ràng buộc theo giai đoạn
- **Commit**: Admin có thể thêm cử tri; Cử tri hợp lệ gửi hash bí mật. Không được phép reveal hay xem kết quả.
- **Reveal**: Không nhận thêm cử tri và không nhận thêm phiếu commit; Cử tri gửi `option` và `salt` để mở phiếu.
- **Finished**: Đóng hoàn toàn việc bỏ phiếu và kiểm đếm; Cho phép công khai kết quả thống kê.

---

## 3. Cấu trúc dữ liệu & Thành phần Contract

### 3.1. Enum
```solidity
enum Phase { Commit, Reveal, Finished }
```

### 3.2. Structs
```solidity
struct Voter {
    bool isWhitelisted;   // Cử tri có trong danh sách được phép bầu không
    bool hasCommitted;     // Đã gửi phiếu commit chưa
    bytes32 commitHash;    // Giá trị hash của lựa chọn + salt + address
    bool hasRevealed;      // Đã mở phiếu thành công chưa
}

struct Election {
    string name;           // Tên cuộc bầu cử
    string[] options;      // Danh sách các lựa chọn / ứng viên
    Phase phase;           // Giai đoạn hiện tại
    uint256 totalCommitted;// Tổng số cử tri đã commit
    uint256 totalRevealed; // Tổng số phiếu đã mở hợp lệ
}
```

### 3.3. Mappings & State Variables
- `uint256 public electionCount;`: Tổng số cuộc bầu cử đã tạo.
- `mapping(uint256 => Election) public elections;`: Lưu thông tin từng cuộc bầu cử theo `electionId`.
- `mapping(uint256 => mapping(address => Voter)) public voters;`: Lưu trạng thái của từng cử tri trong mỗi cuộc bầu cử.
- `mapping(uint256 => mapping(uint256 => uint256)) public tally;`: Lưu số lượng phiếu đếm được cho từng lựa chọn (`electionId => optionIndex => count`).

### 3.4. Events
- `event ElectionCreated(uint256 indexed electionId, string name, string[] options);`
- `event VotersAdded(uint256 indexed electionId, address[] voterAddresses);`
- `event PhaseChanged(uint256 indexed electionId, Phase newPhase);`
- `event VoteCommitted(uint256 indexed electionId, address indexed voter, bytes32 commitHash);`
- `event VoteRevealed(uint256 indexed electionId, address indexed voter, uint256 option);`

### 3.5. Modifiers
- `onlyOwner`: Kế thừa từ OpenZeppelin `Ownable`, chỉ admin mới có quyền thực thi.
- `inPhase(uint256 electionId, Phase expectedPhase)`: Ràng buộc hàm chỉ được gọi đúng giai đoạn.
- `onlyWhitelisted(uint256 electionId)`: Ràng buộc địa chỉ gọi phải có `isWhitelisted == true`.

---

## 4. Cơ chế Commit-Reveal chống gian lận

### 4.1. Quy tắc sinh Hash Commit
```solidity
commitHash = keccak256(abi.encodePacked(option, salt, msg.sender))
```
- **option**: Chỉ số lựa chọn (uint256).
- **salt**: Chuỗi ngẫu nhiên 32 bytes sinh tại client của cử tri.
- **msg.sender**: Địa chỉ ví cử tri.
- **Mục đích**: Gắn `msg.sender` vào hash để ngăn chặn kẻ tấn công copy hash của người khác trên Mempool và gửi lại (Front-running / Copy-commit attack).

### 4.2. Quy tắc Reveal
- Cử tri gửi `option` và `salt`.
- Contract tính toán lại hash và so sánh:
  `require(keccak256(abi.encodePacked(option, salt, msg.sender)) == voter.commitHash, "Invalid hash")`
- Nếu khớp: Đánh dấu `hasRevealed = true`, tăng `tally[electionId][option]++`, tăng `totalRevealed++`.

---

## 5. Sơ đồ tuần tự (Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    actor Voter
    participant Frontend
    participant SmartContract
    
    Admin->>SmartContract: createElection("Bầu cử...", options)
    Admin->>SmartContract: addVoters(electionId, [addresses])
    
    Note over Voter,Frontend: Giai đoạn 1: Commit
    Voter->>Frontend: Chọn option, bấm Bỏ phiếu
    Frontend->>Frontend: Sinh ngẫu nhiên salt (bytes32)
    Frontend->>Frontend: Tính hash = keccak256(option, salt, voterAddress)
    Frontend->>Frontend: Lưu {electionId, option, salt} vào localStorage
    Frontend->>SmartContract: commitVote(electionId, hash)
    
    Note over Admin,SmartContract: Chuyển giai đoạn
    Admin->>SmartContract: startReveal(electionId)
    
    Note over Voter,Frontend: Giai đoạn 2: Reveal
    Voter->>Frontend: Mở trang Reveal
    Frontend->>Frontend: Lấy {option, salt} từ localStorage
    Frontend->>SmartContract: revealVote(electionId, option, salt)
    SmartContract->>SmartContract: Kiểm tra hash khớp & cộng dồn tally[option]
    
    Note over Admin,SmartContract: Giai đoạn 3: Kết thúc & Công bố
    Admin->>SmartContract: finishElection(electionId)
    Voter->>SmartContract: getResults(electionId) -> Hiển thị kết quả công khai
```

---

## 6. Luồng màn hình Frontend (UI Flow)

```mermaid
flowchart TD
    A[Màn hình chính / Navbar] -->|Kết nối MetaMask| B{Kiểm tra vai trò}
    B -->|Là Owner/Admin| C[Trang Quản Trị - Admin]
    B -->|Là Cử tri / Public| D[Trang Bầu Cử - Voter]
    
    C --> C1[Tạo cuộc bầu cử mới]
    C --> C2[Thêm danh sách cử tri Whitelist]
    C --> C3[Nút chuyển trạng thái: Start Reveal / Finish]
    
    D --> D1{Kiểm tra Phase}
    D1 -->|Phase: Commit| D2[Chọn ứng viên & Bấm Commit -> Tự sinh & lưu Salt]
    D1 -->|Phase: Reveal| D3[Bấm Reveal -> Đọc Salt từ LocalStorage để mở phiếu]
    D1 -->|Phase: Finished| E[Trang Kết Quả - Results]
    
    E --> E1[Xem biểu đồ / thống kê số phiếu minh bạch]
```
