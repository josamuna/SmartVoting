const { ethers } = require("hardhat");
const { expect } = require("chai");
// const { BigNumber } = require("ethers");

let votingContract;
let votingOfficeUser;
let accounts;

describe("Manipulations of Vote Type and Vote", function () {
  // Running this code before tests
  before(async function () {
    const VotingContract = await ethers.getContractFactory("Voting"); // Get contract ABI
    votingContract = await VotingContract.deploy();
    await votingContract.deployed();
    accounts = await ethers.getSigners();
  });

  const val1 = ["designation1", "designation2"];
  const val2 = ["description1", "description2"];

  it("New vote should be added after new voteType is added, the vote should also validated", async function () {
    // Fist try to use empty value and revert transaction
    expect(votingContract.setVoteType("", val1[1])).to.be.reverted;
    expect(votingContract.setVoteType(val1[0], "")).to.be.reverted;
    await votingContract.setVoteType(val1[0], val1[1]);
    await votingContract.setVoteType(val2[0], val2[1]);
    let arr = await votingContract.voteTypeInfo(1); // Get from solidity mapping the added values (Array)
    expect(arr[0]).to.equal(1); // VoteType ID
    expect(arr[1]).to.equal(val1[0]); // VotType designation
    expect(arr[2]).to.equal(val1[1]); // VoteType description
    expect(arr[3]).to.equal(accounts[0].address); // sender

    arr = await votingContract.voteTypeInfo(2); // Get from solidity mapping the added values (Array)
    expect(arr[0]).to.equal(2); // VoteType ID
    expect(arr[1]).to.equal(val2[0]); // VotType designation
    expect(arr[2]).to.equal(val2[1]); // VoteType description
    expect(arr[3]).to.equal(accounts[0].address); // sender

    // Vote
    const voteTypeId = await arr[0].toNumber(); // Convert BigNumber to JavaScript Number
    const time_duration = 24;

    // Try to set invalid vote (invalid voteType) and revert transaction
    expect(votingContract.setVote(voteTypeId + 1, time_duration)).to.be
      .reverted;
    // Try set invalid vote 'Invalid time_duration and revert transaction
    expect(votingContract.setVote(voteTypeId, time_duration - 24)).to.be
      .reverted;

    await votingContract.setVote(voteTypeId, time_duration);
    arr = await votingContract.voteInfo(1);
    expect(arr[0]).to.equal(1); // VoteId
    expect(arr[1]).to.equal(2); // VoteTypeId
    expect(arr[2]).to.equal(time_duration); // Vote time duration
    expect(arr[3]).to.equal(0); // initialVotingTimestamp
    expect(arr[4]).to.equal(accounts[0].address); // User => msg.sender
    expect(arr[5]).to.equal(0); // Vote status

    await votingContract.activateVote(1);
    arr = await votingContract.voteInfo(1);
    expect(arr[5]).to.equal(1); // Vote activated
  });

  it("Should return the vote status", async function () {
    const status = await votingContract.getVoteStatus(1);
    expect(status).to.equal(1); // Vote is activated
  });
});

describe("Manipulations of Voter", function () {
  before(async function () {
    const VotingContract = await ethers.getContractFactory("Voting");
    votingContract = await VotingContract.deploy();
    await votingContract.deployed();
  });

  it("New voter should be added", async function () {
    await votingContract.setVoter(accounts[1].address);
    expect(votingContract.setVoter)
      .to.emit(votingContract, "NewVoter")
      .withArgs(1, accounts[1].address);

    // Duplicate entry will revert transaction
    expect(votingContract.setVoter(accounts[1].address)).to.be.reverted;

    await votingContract.setVoter(accounts[2].address); // Valid voter
    expect(votingContract.setVoter)
      .to.emit(votingContract, "NewVoter")
      .withArgs(2, accounts[2]);
  });

  it("The voter address should be updated only three times", async function () {
    const count = await votingContract.numberOfAllowedUpdatingVoterAddress(1);
    let counter = count.toNumber(); // Convert BigInteger (Solidity uint) to JavaScript number
    await votingContract.updateVoter(accounts[1].address, accounts[3].address);
    counter += 1; // First try
    expect(counter).lte(3);
    await votingContract.updateVoter(accounts[3].address, accounts[4].address);
    counter += 1; // Second try
    expect(counter).to.lessThanOrEqual(3);
    await votingContract.updateVoter(accounts[4].address, accounts[5].address);
    counter += 1; // Last try
    expect(counter).to.lessThanOrEqual(3);
    // Revert for more than three times
    expect(votingContract.updateVoter(accounts[5].address, accounts[6].address))
      .to.be.reverted;
  });
});

describe("Manipulations of Candidate", function () {
  before(async function () {
    const VotingContract = await ethers.getContractFactory("Voting");
    votingContract = await VotingContract.deploy();
    await votingContract.deployed();
  });

  const voteId = 1;
  const voteTypeId = 1;
  const candidateIds = [1, 2];
  const orderNumbers = [5, 7];
  const time_duration = 24;
  const fullNames = ["Kimbelenge Ismael john", "Nirvanya patel"];
  const picture_urls = [
    "https://ipfs/hvbdgftaebfjkgoipzjnd14dj41",
    "https://ipfs/hhndgteuapmrplsysipzevfsaym",
  ];
  const designation = "designation";
  const description = "description";

  it("New Candidate should be added", async function () {
    // Set invalid picture_url and revert
    expect(votingContract.setCandidate(orderNumbers[0], fullNames[0], "")).to.be
      .reverted;

    // First Candidate
    await votingContract.setCandidate(
      orderNumbers[0],
      fullNames[0],
      picture_urls[0]
    );
    const arr1 = await votingContract.candidateInfo(1);
    expect(arr1[0]).to.equal(candidateIds[0]); // Candidate Id
    expect(arr1[1]).to.equal(orderNumbers[0]); // Order number
    expect(arr1[2]).to.equal(fullNames[0]); // Candidate fullname
    expect(arr1[3]).to.equal(picture_urls[0]); // picture URL
    expect(arr1[4]).to.equal(accounts[0].address); // msg.sender

    //second candidate
    await votingContract.setCandidate(
      orderNumbers[1],
      fullNames[1],
      picture_urls[1]
    );
    const arr2 = await votingContract.candidateInfo(2);
    expect(arr2[0]).to.equal(candidateIds[1]); // Candidate Id
    expect(arr2[1]).to.equal(orderNumbers[1]); // Order number
    expect(arr2[2]).to.equal(fullNames[1]); // Candidate fullname
    expect(arr2[3]).to.equal(picture_urls[1]); // picture URL
    expect(arr2[4]).to.equal(accounts[0].address); // msg.sender

    // Add duplicate picture_url and revert
    expect(
      votingContract.setCandidate(
        orderNumbers[1],
        fullNames[1],
        picture_urls[1]
      )
    ).to.be.reverted;
  });

  it("Should add candidate for a particular vote", async function () {
    // First add voteType
    await votingContract.setVoteType(designation, description);
    // Second add vote
    await votingContract.setVote(voteTypeId, time_duration);
    // Add candidate to vote
    await votingContract.registerCandidateForVote(voteId, candidateIds);
    expect(await votingContract.validsCandidateForVote(voteId, 0)).to.equal(
      candidateIds[0]
    ); // First candidate
    expect(await votingContract.validsCandidateForVote(voteId, 1)).to.equal(
      candidateIds[1]
    ); // Second candidate
  });
});

describe("Manipulations of Ballot Box for voters vote", function () {
  before(async function () {
    // Voting
    const VotingContract = await ethers.getContractFactory("Voting"); // Get contract ABI
    votingContract = await VotingContract.deploy();
    await votingContract.deployed();

    // Voting office
    const VotingOfficeUser = await ethers.getContractFactory(
      "VotingOfficeUser"
    );
    votingOfficeUser = await VotingOfficeUser.deploy();
    await votingOfficeUser.deployed();

    accounts = await ethers.getSigners();
  });

  const arr1 = ["designation", "description"];
  const voteTypeId = 1;
  const voteId = 1;
  const time_duration = 24;
  const voterId = 1;
  const votingOfficeId = 1;
  const voteStatus = 1;
  const candidateId = 1;
  const orderNumber = 10;
  const fullname = "Kimbelenge Ismael john";
  const picture_url = "https://ipfs/hvbdgftaebfjkgoipzjnd14dj41";

  it("Voter should cast once his vote for one existing candidate", async function () {
    const owner = await accounts[0].address; // Only owner
    // VoteType
    await votingContract.setVoteType(arr1[0], arr1[1]);
    const arr2 = await votingContract.voteTypeInfo(voteTypeId);
    // Voting Office
    await votingOfficeUser.setVotingOffice(arr1[0]);
    const arr3 = await votingOfficeUser.votingOfficeInfo(votingOfficeId);
    // Vote
    await votingContract.setVote(voteTypeId, time_duration);
    const arr4 = await votingContract.voteInfo(voteId);
    // Voter
    await votingContract.setVoter(accounts[1].address);
    expect(votingContract.setVoter)
      .to.emit(votingContract, "NewVoter")
      .withArgs(1, accounts[1].address);
    // Candidate
    await votingContract.setCandidate(orderNumber, fullname, picture_url);
    const arr6 = await votingContract.candidateInfo(candidateId);
    // Register candidate
    await votingContract.registerCandidateForVote(voteId, [1]);
    // Activate Vote
    await votingContract.activateVote(voteId);
    // Cast vote
    // Valid vote
    await votingContract.castVote(
      arr4[0],
      arr2[0],
      arr3[0],
      arr6[0],
      voterId,
      voteStatus
    );
    const arr7 = await votingContract.getBallotBoxes();

    expect(arr7[0].id).to.equal(1); // BallotBox ID
    expect(arr7[0].voteId).to.equal(arr4[0]); // VoteId
    expect(arr7[0].voteTypeId).to.equal(arr2[0]); // VoteTypeId
    expect(arr7[0].votingOfficeId).to.equal(arr3[0]); // VotingOfficeId
    expect(arr7[0].candidateId).to.equal(arr6[0]); // Candidated
    expect(arr7[0].voterId).to.equal(voterId); // VoterId
    expect(arr7[0].voterVoteStatus).to.equal(voteStatus); // voted

    // Invalide vote
    expect(
      votingContract.castVote(2, arr2[0], arr3[0], arr6[0], voterId, voteStatus)
    ).to.be.reverted; // Invalide voteId

    expect(
      votingContract.castVote(arr4[0], 2, arr3[0], arr6[0], voterId, voteStatus)
    ).to.be.reverted; // Invalide voteTypeId

    expect(
      votingContract.castVote(arr4[0], arr2[0], 2, arr6[0], voterId, voteStatus)
    ).to.be.reverted; // Invalide votingOfficeId

    expect(
      votingContract.castVote(arr4[0], arr2[0], arr3[0], 2, voterId, voteStatus)
    ).to.be.reverted; // Invalide candidateId

    expect(
      votingContract.castVote(arr4[0], arr2[0], arr3[0], arr6[0], 2, voteStatus)
    ).to.be.reverted; // Invalide voterId

    expect(
      votingContract.castVote(arr4[0], arr2[0], arr3[0], arr6[0], voterId, 3)
    ).to.be.reverted; // Invalide vote status: Vote not activated
  });

  it("Should return voting result", async function () {
    const candidateId = 1;
    const orderNumber = 10;
    const candidateFullName = "Kimbelenge Ismael john";
    const arr1 = await votingContract.voteInfo(1);
    const arr2 = await votingContract.getVoteResults(arr1[0]);

    const voteCast = await votingContract.getCandidateVoteCast(
      arr1[0],
      candidateId
    );
    const voteCastBlank = await votingContract.getTotalBlankVotingVoteCast(
      arr1[0]
    );
    const candidateVotePercentage =
      await votingContract.getCandidatePercentageVoteCast(arr1[0], candidateId);
    const blankVotePercentage =
      await votingContract.getTotalBlankVotingVoteCast(arr1[0]);

    expect(arr2[0][0]).to.equal(arr1[0]); // voteId
    expect(arr2[0][1]).to.equal(candidateId); // candidateId
    expect(arr2[0][2]).to.equal(orderNumber); // candidateNumber
    expect(arr2[0][3]).to.equal(candidateFullName); // candidateFullName
    expect(arr2[0][4]).to.equal(voteCast); // votesCast
    expect(arr2[0][5]).to.equal(voteCastBlank); // votesBlank
    expect(arr2[0][6]).to.equal(candidateVotePercentage); // candidatePercentage
    expect(arr2[0][7]).to.equal(blankVotePercentage); // blankPercentage
  });
});
