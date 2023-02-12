const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Manipulations of Voting office where the vote will take place", function () {
  let votingOfficeContrat;
  let accounts;

  before(async function () {
    const VotingOfficeContract = await ethers.getContractFactory(
      "VotingOfficeUser"
    );
    votingOfficeContrat = await VotingOfficeContract.deploy();
    await votingOfficeContrat.deployed();
    accounts = await ethers.getSigners();
  });

  it("New Voting Office should be added", async function () {
    const arr1 = ["designation1", "designation2"];
    // First record
    await votingOfficeContrat.setVotingOffice(arr1[0]);
    let arr2 = await votingOfficeContrat.votingOfficeInfo(1);
    expect(arr2[0]).to.equal(1); // Voting Office Id
    expect(arr2[1]).to.equal(arr1[0]); // Designation
    expect(arr2[2]).to.equal(accounts[0].address); // msg.sender

    // Second record
    await votingOfficeContrat.setVotingOffice(arr1[1]);
    arr2 = await votingOfficeContrat.votingOfficeInfo(2);
    expect(arr2[0]).to.equal(2); // Voting Office Id
    expect(arr2[1]).to.equal(arr1[1]); // Designation
    expect(arr2[2]).to.equal(accounts[0].address); // msg.sender
  });
});
