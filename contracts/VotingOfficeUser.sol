// SPDX-License-Identifier: MIT

import "./openzeppelin/Counters.sol";

// Errors
error VotingOfficeAlreadyExist();

pragma solidity 0.8.6;

contract VotingOfficeUser {
    // State variables
    // votingOfficeId => votingOfficeStruct
    mapping(uint256 => VotingOffice) public votingOfficeInfo; // Map Voting Office with it id.

    // Counter to handle IDs
    using Counters for Counters.Counter;

    Counters.Counter private _votingOfficeIds;

    // Represent a single Voting office where voters will cast their ballot.
    struct VotingOffice {
        uint256 id;
        string designation; // Meaningful name for the Voting Office.
        address user; // Address of the person who adds a new Voting Office.
    }

    // Events
    event NewVotingOffice(
        uint256 indexed votingOfficeId,
        string shortName,
        address indexed user
    );

    // Array to hold data.
    VotingOffice[] private s_votingOffice;

    // Modifiers
    // Check whether votingOffice designation exist or not to avoid duplicated entries.
    modifier votingOfficeExist(string calldata _designation) {
        uint _size = s_votingOffice.length;
        for (uint i = 0; i < _size; i++) {
            if (
                (
                    (keccak256(abi.encodePacked(s_votingOffice[i].designation)))
                ) == ((keccak256(abi.encodePacked(_designation))))
            ) {
                revert VotingOfficeAlreadyExist();
            }
        }
        _;
    }

    // Add new voting Office.
    function setVotingOffice(
        string calldata _designation
    ) public votingOfficeExist(_designation) {
        // Check that the string is not null.
        require(bytes(_designation).length != 0, "Invalid name.");

        // Creating new votingOffice ID from Counters.
        _votingOfficeIds.increment();
        uint256 _votingOfficeId = _votingOfficeIds.current();

        votingOfficeInfo[_votingOfficeId] = VotingOffice({
            id: _votingOfficeId,
            designation: _designation,
            user: msg.sender
        });

        // Populate the votingOffice array to hold all valides values.
        s_votingOffice.push(votingOfficeInfo[_votingOfficeId]);

        emit NewVotingOffice(_votingOfficeId, _designation, msg.sender);
    }

    // Get All voting Office inside a single array of struct.
    function getVotingOffices() public view returns (VotingOffice[] memory) {
        return s_votingOffice;
    }
}
