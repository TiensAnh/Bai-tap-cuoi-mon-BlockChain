// Script làm sạch dữ liệu: Reset mạng local và nạp tiền cho 5 ví (không tạo dữ liệu mẫu)
const hre = require("hardhat");

const WALLETS = [
  "0x1dd8A4cC2519a1f5ead3c1cE5978c5Ab9f3607FA",
  "0x91205C6906618a5923c62687088a58821A3af112",
  "0x588566b87C381ACc0201B0BA97D813496704FA20",
  "0xbEcDf3C78b5c37cBa58DdF500d9F0dF7B1b2F369",
  "0xc7C8010DFB685987C4F26d3419c452F41140E977"
];

async function main() {
  console.log("----------------------------------------------------");
  console.log("1. Đang reset lại trạng thái Blockchain Localhost...");
  await hre.network.provider.send("hardhat_reset", []);

  console.log("2. Đang deploy lại Smart Contract EVoting mới (Trắng tinh)...");
  const [deployer] = await hre.ethers.getSigners();
  const userAdminAddress = WALLETS[0];

  const EVoting = await hre.ethers.getContractFactory("EVoting");
  const evoting = await EVoting.deploy(userAdminAddress);
  await evoting.waitForDeployment();
  const contractAddress = await evoting.getAddress();

  console.log("   Smart Contract đã deploy tại:", contractAddress);
  console.log("   Số cuộc bầu cử hiện tại:", (await evoting.electionCount()).toString());

  console.log("3. Đang nạp 1.000.000 ETH cho cả 5 ví...");
  const amountEth = "1000000";
  const balanceWei = hre.ethers.parseEther(amountEth);
  const balanceHex = "0x" + balanceWei.toString(16);

  for (let i = 0; i < WALLETS.length; i++) {
    const addr = WALLETS[i];
    await hre.network.provider.send("hardhat_setBalance", [
      addr,
      balanceHex
    ]);
    const bal = await hre.ethers.provider.getBalance(addr);
    console.log(`   [${i + 1}/5] Ví ${addr.slice(0, 8)}...: ${hre.ethers.formatEther(bal)} ETH`);
  }

  console.log("----------------------------------------------------");
  console.log(">>> ĐÃ LÀM SẠCH VÀ RESET TOÀN BỘ DỮ LIỆU THÀNH CÔNG!");
  console.log("----------------------------------------------------");
}

main().catch((err) => {
  console.error("Lỗi:", err);
  process.exitCode = 1;
});
