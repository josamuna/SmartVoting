const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Manipulations of Witness", function () {
  let witnessContract;
  let accounts;
  const fullName = [
    "York Esteban",
    "Anita Balani",
    "Israel Murhula",
    "Nathalie kuba",
  ];
  const organization = [
    "Easy trust Inc",
    "Union Witnesses Partner",
    "Voter Supplier",
    "Emeraude",
  ];

  before(async function () {
    const WitnessContract = await ethers.getContractFactory("WitnessUser");
    witnessContract = await WitnessContract.deploy();
    await witnessContract.deployed();
    accounts = await ethers.getSigners();
  });

  it("Should add new Witness for the voting process", async function () {
    // First.
    await witnessContract.setWitness(organization[0], fullName[0]);
    let arr = await witnessContract.witnessInfo(1);
    expect(arr[0]).to.equal(1); // Witness Id.
    expect(arr[1]).to.equal(fullName[0]); // Fullname.
    expect(arr[2]).to.equal(organization[0]); // Organization.
    expect(arr[3]).to.equal(accounts[0].address); // msg.sender.

    // Second.
    await witnessContract.setWitness(organization[1], fullName[1]);
    arr = await witnessContract.witnessInfo(2);
    expect(arr[0]).to.equal(2); // Witness Id
    expect(arr[1]).to.equal(fullName[1]); // Fullname
    expect(arr[2]).to.equal(organization[1]); // Organization
    expect(arr[3]).to.equal(accounts[0].address); // msg.sender
  });

  it("Should update witness informations", async function () {
    // Try to update invalid witness and revert transaction.
    expect(witnessContract.updateWitness(3, organization[2], fullName[2])).to.be
      .reverted; // Invalid witness Id
    expect(witnessContract.updateWitness(1, "", fullName[2])).to.be.reverted; // Invalid organization.
    expect(witnessContract.updateWitness(1, organization[2], "")).to.be
      .reverted; // Invalid fullname

    // Valid infos.
    // First witness.
    await witnessContract.updateWitness(1, organization[2], fullName[2]);
    arr = await witnessContract.witnessInfo(1);
    expect(arr[0]).to.equal(1); // Witness Id.
    expect(arr[1]).to.equal(fullName[2]); // Fullname.
    expect(arr[2]).to.equal(organization[2]); // Organization.
    expect(arr[3]).to.equal(accounts[0].address); // msg.sender.

    // Second.
    await witnessContract.updateWitness(2, organization[3], fullName[3]);
    arr = await witnessContract.witnessInfo(2);
    expect(arr[0]).to.equal(2); // Witness Id.
    expect(arr[1]).to.equal(fullName[3]); // Fullname.
    expect(arr[2]).to.equal(organization[3]); // Organization.
    expect(arr[3]).to.equal(accounts[0].address); // msg.sender.
  });
});
