// Script khởi tạo dữ liệu mẫu cho bài tập và giao diện tham chiếu
const hre = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const userAdminAddress = "0x1dd8A4cC2519a1f5ead3c1cE5978c5Ab9f3607FA";

  // Nạp 10 ETH cho ví admin trên mạng local để có gas gửi giao dịch
  await hre.network.provider.send("hardhat_setBalance", [
    userAdminAddress,
    "0x8AC7230489E80000" // 10 ETH
  ]);

  // Giả lập quyền ký của ví userAdminAddress trên local
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [userAdminAddress]
  });

  const adminSigner = await hre.ethers.getSigner(userAdminAddress);
  const evoting = await hre.ethers.getContractAt("EVoting", contractAddress, adminSigner);

  console.log("Đang kiểm tra số lượng cuộc bầu cử hiện tại...");
  const count = Number(await evoting.electionCount());
  console.log("Số cuộc bầu cử hiện tại:", count);

  if (count === 0) {
    console.log("Khởi tạo Cuộc bầu cử 1: Bầu cử Trưởng nhóm Dự án...");
    let tx1 = await evoting.createElection(
      "Bầu cử Trưởng nhóm Dự án",
      ["Nguyễn Minh Anh", "Trần Quang Huy", "Lê Thùy Linh"]
    );
    await tx1.wait();

    console.log("Cấp Whitelist cho Cuộc bầu cử 1...");
    const sampleVoters = [
      userAdminAddress,
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
    ];
    let txVoter = await evoting.addVoters(1, sampleVoters);
    await txVoter.wait();

    console.log("Khởi tạo Cuộc bầu cử 2: Bầu ban đại diện Khóa K15...");
    let tx2 = await evoting.createElection(
      "Bầu ban đại diện Khóa K15",
      ["Đội ngũ K15 - Đổi mới", "Đội ngũ K15 - Tiên phong"]
    );
    await tx2.wait();
    let txVoter2 = await evoting.addVoters(2, [userAdminAddress]);
    await txVoter2.wait();
    // Chuyển cuộc bầu cử 2 sang giai đoạn 1 (Reveal)
    let txReveal = await evoting.startReveal(2);
    await txReveal.wait();

    console.log("Khởi tạo Cuộc bầu cử 3: Bầu chọn Logo CLB Blockchain...");
    let tx3 = await evoting.createElection(
      "Bầu chọn Logo CLB Blockchain",
      ["Phương án A - Khối lập phương", "Phương án B - Mạng phi tập trung", "Phương án C - Lá chắn bảo mật"]
    );
    await tx3.wait();
    let txVoter3 = await evoting.addVoters(3, [userAdminAddress]);
    await txVoter3.wait();
    // Chuyển sang Reveal rồi Finished
    let txR3 = await evoting.startReveal(3);
    await txR3.wait();
    let txF3 = await evoting.finish(3);
    await txF3.wait();

    console.log(">>> ĐÃ KHỞI TẠO XONG 3 CUỘC BẦU CỬ MẪU KHỚP VỚI HÌNH ẢNH THAM CHIẾU!");
  } else {
    console.log("Đã có cuộc bầu cử trên contract, không cần khởi tạo lại.");
  }
}

main().catch((err) => {
  console.error("Lỗi:", err);
  process.exitCode = 1;
});
