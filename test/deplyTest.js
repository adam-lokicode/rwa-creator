const { ethers } = require("hardhat");

async function main() {
  const HelperConfig = await ethers.getContractFactory("HelperConfig");
  const helperConfig = await HelperConfig.deploy();
  await helperConfig.deployed();

  const DeployDTsla = await ethers.getContractFactory("DeployDTsla");
  const deployDTsla = await DeployDTsla.deploy();
  await deployDTsla.deployed();

  console.log("HelperConfig deployed to:", helperConfig.address);
  console.log("DeployDTsla deployed to:", deployDTsla.address);

  // Call the run function and catch any errors
  try {
    const tx = await deployDTsla.run();
    await tx.wait();
    console.log("run() executed successfully");
  } catch (error) {
    console.error("Error executing run():", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
