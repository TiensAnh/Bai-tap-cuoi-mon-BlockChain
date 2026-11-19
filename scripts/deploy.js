const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const userAdminAddress = "0x1dd8A4cC2519a1f5ead3c1cE5978c5Ab9f3607FA";
  
  console.log("----------------------------------------------------");
  console.log("Triển khai hợp đồng bằng deployer:", deployer.address);
  console.log("Thiết lập Admin Owner là ví của bạn:", userAdminAddress);

  // Triển khai hợp đồng EVoting với initialOwner là địa chỉ ví của bạn
  const EVoting = await hre.ethers.getContractFactory("EVoting");
  const evoting = await EVoting.deploy(userAdminAddress);
  await evoting.waitForDeployment();

  const contractAddress = await evoting.getAddress();
  console.log("----------------------------------------------------");
  console.log(">>> SMART CONTRACT EVOTING ĐÃ DEPLOY TẠI ĐỊA CHỈ:");
  console.log(contractAddress);
  console.log("Owner của contract:", await evoting.owner());
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error("Lỗi deploy:", error);
  process.exitCode = 1;
});
