// Script nạp tiền tùy biến cho mạng blockchain local
const hre = require("hardhat");

async function main() {
  // Địa chỉ ví nhận tiền (có thể truyền qua biến môi trường TARGET hoặc dùng mặc định)
  const target = process.env.TARGET || "0x1dd8A4cC2519a1f5ead3c1cE5978c5Ab9f3607FA";
  // Số lượng ETH muốn nạp (mặc định 1,000,000 ETH)
  const amountEth = process.env.AMOUNT || "1000000";

  console.log("----------------------------------------------------");
  console.log(`Đang nạp ${amountEth} ETH vào ví:`, target);

  // Quy đổi số ETH sang đơn vị wei dạng hex
  const balanceWei = hre.ethers.parseEther(amountEth);
  const balanceHex = "0x" + balanceWei.toString(16);

  // Sử dụng phương thức đặc biệt của Hardhat để đặt số dư trực tiếp (không bị giới hạn)
  await hre.network.provider.send("hardhat_setBalance", [
    target,
    balanceHex
  ]);

  // Kiểm tra lại số dư mới sau khi nạp
  const newBalance = await hre.ethers.provider.getBalance(target);
  console.log("----------------------------------------------------");
  console.log(">>> NẠP TIỀN THÀNH CÔNG!");
  console.log("Địa chỉ ví:", target);
  console.log("Số dư mới trên MetaMask:", hre.ethers.formatEther(newBalance), "ETH");
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error("Lỗi nạp tiền:", error);
  process.exitCode = 1;
});
