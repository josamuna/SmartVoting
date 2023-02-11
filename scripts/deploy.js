const { ethers } = require("hardhat");

async function main() {
  // Get Voting contract reference from ABI.
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(); // Deploy contract.
  await voting.deployed(); // wait util complet deployment

  console.log(`Contract Voting deployed successfully at: ${voting.address}`);

  // Get VotingOfficeUser contract reference from ABI.
  const VotingOfficeUser = await ethers.getContractFactory("VotingOfficeUser");
  const votingOffice = await VotingOfficeUser.deploy();
  await votingOffice.deployed(); // wait until complete deployment.

  console.log(
    `Contract VotingOfficeUser deployed successfully at: ${votingOffice.address}`
  );

  // Get WitnessUser contract reference from ABI
  const WitnessUser = await ethers.getContractFactory("WitnessUser");
  const witness = await WitnessUser.deploy();
  await witness.deployed(); // Wait until complete deployment.

  console.log(
    `Contract WitnessUser deployed successfully at: ${witness.address}`
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
