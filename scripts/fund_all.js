// Script nạp tiền 1.000.000 ETH cho danh sách ví cử tri trên mạng local
const hre = require("hardhat");

const WALLETS = [
  "0x1dd8A4cC2519a1f5ead3c1cE5978c5Ab9f3607FA",
  "0x91205C6906618a5923c62687088a58821A3af112",
  "0x588566b87C381ACc0201B0BA97D813496704FA20",
  "0xbEcDf3C78b5c37cBa58DdF500d9F0dF7B1b2F369",
  "0xc7C8010DFB685987C4F26d3419c452F41140E977"
];

async function main() {
  const amountEth = "1000000"; // 1.000.000 ETH
  const balanceWei = hre.ethers.parseEther(amountEth);
  const balanceHex = "0x" + balanceWei.toString(16);

  console.log("====================================================");
  console.log(`BẮT ĐẦU NẠP ${amountEth} ETH CHO TỪNG VÍ:`);
  console.log("====================================================");

  for (let i = 0; i < WALLETS.length; i++) {
    const addr = WALLETS[i];
    // Đặt số dư trực tiếp qua hardhat_setBalance
    await hre.network.provider.send("hardhat_setBalance", [
      addr,
      balanceHex
    ]);

    const bal = await hre.ethers.provider.getBalance(addr);
    console.log(`[${i + 1}/${WALLETS.length}] Ví: ${addr}`);
    console.log(`      Số dư: ${hre.ethers.formatEther(bal)} ETH`);
  }

  // Tự động thêm cả 5 ví này vào Whitelist của Cuộc bầu cử #1 (nếu có)
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  try {
    const adminAddress = WALLETS[0];
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [adminAddress]
    });
    const adminSigner = await hre.ethers.getSigner(adminAddress);
    const evoting = await hre.ethers.getContractAt("EVoting", contractAddress, adminSigner);

    const count = Number(await evoting.electionCount());
    if (count >= 1) {
      console.log("----------------------------------------------------");
      console.log("Đang tự động cấp Whitelist cuộc bầu cử #1 cho cả 5 ví...");
      const tx = await evoting.addVoters(1, WALLETS);
      await tx.wait();
      console.log("✓ Đã cấp quyền Whitelist thành công cho cả 5 ví!");
    }
  } catch (err) {
    console.log("Lưu ý về Whitelist:", err.message);
  }

  console.log("====================================================");
  console.log(">>> HOÀN TẤT NẠP TIỀN CHO TẤT CẢ CÁC VÍ TRÊN LOCALHOST!");
  console.log("====================================================");
}

main().catch((err) => {
  console.error("Lỗi:", err);
  process.exitCode = 1;
});
