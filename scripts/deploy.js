const hre = require("hardhat");
async function main() {
  const TaskProject = await hre.ethers.getContractFactory("TaskProject");
  const taskProject = await TaskProject.deploy();

  await taskProject.deployed();

  console.log("TaskProject deployed to:", taskProject.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
