// Script cap quyen Admin cho vi Imported
const hre = require("hardhat");

async function main() {
  const currentOwner = "0x1dd8A4cC2519a1f5ead3c1cE5978c5Ab9f3607FA";
  const newOwner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const contractAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Cap tien gas cho currentOwner
  await hre.network.provider.send("hardhat_setBalance", [
    currentOwner,
    "0x1000000000000000000000"
  ]);

  // Dong vai currentOwner de chuyen quyen
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [currentOwner],
  });

  const signer = await hre.ethers.getSigner(currentOwner);
  const contract = await hre.ethers.getContractAt("EVoting", contractAddr, signer);

  console.log("Owner hien tai:", await contract.owner());
  console.log("Dang chuyen quyen Admin sang vi:", newOwner);

  const tx = await contract.transferOwnership(newOwner);
  await tx.wait();

  console.log("----------------------------------------------------");
  console.log(">>> DA CHUYEN QUYEN ADMIN THANH CONG!");
  console.log("Owner moi cua contract:", await contract.owner());
  console.log("----------------------------------------------------");
}

main().catch(console.error);
