// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "./openzeppelin/Counters.sol";
import "./openzeppelin/Ownable.sol";
import "./openzeppelin/Strings.sol";

// Errors
error VoteTypeAlreadyExist();
error VotingOfficeAlreadyExist();
error VoterAddressAlreadyExist();
error CandidatePictureUriAlreadyExist();
error CandidateNotFound();
error CandidateNotYetRegisterForThisVote();
error VoteAlreadyClosed();
error VoterHasAlreadyCastVote();

contract Voting is Ownable {
    // State variables
    // mapping
    // voterId => numberOfAllowedUpdates
    mapping(uint256 => uint) public numberOfAllowedUpdatingVoterAddress; // Total number allowed to update voter address to avoid doing it again and again without limitation.
    // voteId => voteStruct
    mapping(uint256 => Vote) public voteInfo; // Map Vote with it id.
    // VoteTypeId => voteTypeStruct
    mapping(uint256 => VoteType) public voteTypeInfo; // Map Vote Type with it id.
    // voterId => voterStuct
    mapping(uint256 => Voter) voterInfo; // Map Voter with it id.
    // candidateId => candidateStruct
    mapping(uint256 => Candidate) public candidateInfo; // Map Candidate with it id.
    // ballotBoxId => ballotBoxStruct
    mapping(uint256 => BallotBox) ballotBoxInfo; // Not exposed outside for anonymity purpose of voters.
    // voterAddress => voterId
    mapping(address => uint256) voterValidsAddress; // Map internally all valids voter's address. Not expose outside to protect voter identity.
    // voteId => candidateArrayId
    mapping(uint256 => uint256[]) public validsCandidateForVote; // Map valid candidate for a certain vote (Who are added to vote).
    // voteId => (voterId => voterVoteStatus)
    mapping(uint256 => mapping(uint256 => uint)) ballotBoxVoterStatus; // Keep track voter vote status for the selected vote.

    // voteId => numberVoteCast
    mapping(uint256 => uint256) totalVotingVoteCast; // Match total voters's votes for all candidates within a specifique vote ID.
    // voteId => numberBlankVote
    mapping(uint256 => uint256) totalVotingVoteCastBlank; // Match total blank voters's votes for all candidates within a specifique vote ID.
    // voteId => (candidateId => numberVoteCast
    mapping(uint256 => mapping(uint256 => uint256)) totalCandidateVotesCast; // For a specifique vote (by vote ID), tally the number of votes cast with the candidate's ID.

    // Enumeration
    enum VotedStatus {
        notVoted,
        voted,
        blank
    } // Enumeration that describe voted status, not voted = 0 and not voted = 1 and blank = 2.
    enum VoteStatus {
        notActivated,
        activated,
        closed
    } // Enumeration that describe voted status, not activated = 0 and activated = 1 and closed = 2.

    // Counter to handle IDs
    using Counters for Counters.Counter;
    // To support string conversion
    using Strings for uint256;

    Counters.Counter private _voteTypeIds;
    Counters.Counter private _voteIds;
    Counters.Counter private _voterIds;
    Counters.Counter private _candidateIds;
    Counters.Counter private _ballotBoxIds;

    // type of vote like presidential, etc.
    struct VoteType {
        uint id;
        string designation;
        string description;
        address user; // Address of the person who adds a new vote type.
    }

    // Represent a whole voting process with a distinctive ID.
    struct Vote {
        uint256 id;
        uint voteTypeId;
        // Total time to cast the vote (In hour like 24h, 36h, etc.).
        // Once the vote is activated, the count for this time will begin.
        uint timeDuration;
        uint256 initialVotingTimestamp; // The initial timestamp once vote is activated to track the time to end vote
        address user; // Address of the person who adds a new vote.
        uint status; // Vote status 0 = Not activated, 1 = Activated, 2 = Closed
    }

    // Represent one person who will cast a ballot.
    struct Voter {
        uint256 id;
        address voter; // Address of the voter who cast the vote.
    }

    // Represent a candidate who will receive votes from the public.
    struct Candidate {
        uint256 id;
        uint orderNumber;
        string fullname;
        string pictureURI;
        address user; // Address of the person who adds a new Candidate.
    }

    // Represente voting result
    struct VoteResults {
        uint256 voteId;
        uint256 candidateId;
        uint candidateNumber;
        string candidateFullName;
        uint256 votesCast;
        uint256 votesBlank;
        string candidatePercentage;
        string blankPercentage;
    }

    // Serves as the ballot box during the entire voting process.
    struct BallotBox {
        uint256 id;
        uint256 voteId;
        uint voteTypeId;
        uint256 votingOfficeId;
        uint256 candidateId;
        uint256 voterId;
        uint voterVoteStatus; // voted = 1 and blank = 2
    }

    // Events
    event NewVoteType(
        uint indexed voteTypeId,
        string indexed designation,
        address indexed user
    );
    event NewVote(
        uint256 indexed voteId,
        uint voteTypeId,
        uint timeDuration,
        address indexed user,
        uint status
    );
    event NewVoter(uint256 indexed voterId, address indexed voter);
    event UpdateVoter(uint256 indexed voterId, address indexed voter);
    event NewCandidate(
        uint256 indexed candidateId,
        uint256 indexed orderNumber,
        string fullName,
        string pictureURI,
        address indexed user
    );
    event UpdateWitness(
        uint256 indexed witnessId,
        string indexed fullname,
        string indexed organization,
        address user
    );
    // voterId is hide to protect voter anonymity.
    event CastedVote(
        uint256 indexed ballotBoxId,
        uint256 voteId,
        uint256 indexed candidateId,
        address indexed voterAddress,
        uint256 votingOfficeId,
        uint voterVoteStatus
    );
    event RegisterCandidateForVote(uint256 voteId, uint256[] candidateIds);

    // Array to hold data.
    VoteType[] private s_voteType;
    Vote[] private s_vote;
    // Restricted to be used only inside the contract and not exposed outside to protect voter identity.
    // Because over her voterId is linked to his address.
    Voter[] private s_voter;
    Candidate[] private s_candidate;
    BallotBox[] private s_ballotBox;

    // Modifiers
    // Check whether voteType designation exist or not to avoid duplicated entries.
    modifier voteTypeExist(string memory _designation) {
        uint _size = s_voteType.length;
        for (uint i = 0; i < _size; i++) {
            if (
                ((keccak256(abi.encodePacked(s_voteType[i].designation)))) ==
                ((keccak256(abi.encodePacked(_designation))))
            ) {
                revert VoteTypeAlreadyExist();
            }
        }
        _;
    }

    // check whether voter address is unique or not
    modifier duplicatedVoterAddress(address _voterAddress) {
        uint256 _voterCount = s_voter.length;
        bool voterAddressFound = false;

        for (uint256 i = 0; i < _voterCount; i++) {
            if (s_voter[i].voter == _voterAddress) {
                // Match address found
                voterAddressFound = true;
                break;
            }
        }

        if (voterAddressFound) {
            revert VoterAddressAlreadyExist();
        }
        _;
    }

    // Check whether the vote is closed or not.
    modifier voteClosed(uint256 _voteId) {
        if (voteInfo[_voteId].status == uint(VoteStatus.closed)) {
            revert VoteAlreadyClosed();
        }
        _;
    }

    // Check whether candidate picture URI exist or not to avoid duplicated entries.
    modifier pictureUriExist(string memory _pictureURI) {
        uint _size = s_candidate.length;
        for (uint i = 0; i < _size; i++) {
            if (
                ((keccak256(abi.encodePacked(s_candidate[i].pictureURI)))) ==
                ((keccak256(abi.encodePacked(_pictureURI))))
            ) {
                revert CandidatePictureUriAlreadyExist();
            }
        }
        _;
    }

    // Check whether candidate is registered for a particular vote
    modifier isCandidateRegisterForVote(uint256 _voteId, uint256 _candidateId) {
        uint size = validsCandidateForVote[_voteId].length;
        bool found;

        for (uint i = 0; i < size; i++) {
            // true if the candidate is already register
            if (_candidateId == validsCandidateForVote[_voteId][i]) {
                found = true;
                break;
            }
        }
        if (!found) {
            revert CandidateNotYetRegisterForThisVote();
        }
        _;
    }

    // Add new voting Type.
    function setVoteType(
        string calldata _designation,
        string calldata _description
    ) public voteTypeExist(_designation) {
        // Check than the string is not null.
        require(
            bytes(_designation).length != 0 && bytes(_description).length != 0,
            "Please provide valid designation and description."
        );

        // Creating new votingType ID from Counters.
        _voteTypeIds.increment();
        uint256 _voteTypeId = _voteTypeIds.current();

        voteTypeInfo[_voteTypeId] = VoteType({
            id: _voteTypeId,
            designation: _designation,
            description: _description,
            user: msg.sender
        });

        // Populate the voteType array to hold all valides values.
        s_voteType.push(voteTypeInfo[_voteTypeId]);

        emit NewVoteType(_voteTypeId, _designation, msg.sender);
    }

    // Get All voteType inside a single array of struct.
    function getVoteTypes() public view returns (VoteType[] memory) {
        return s_voteType;
    }

    // Add new vote.
    // Time duration represent the total amount of time to be taken for the entire voting process.
    function setVote(uint _voteTypeId, uint _timeDuration) public {
        require(
            voteTypeInfo[_voteTypeId].id == _voteTypeId,
            "Invalid vote type ID."
        );
        require(_timeDuration > 0, "Invalid voting periode.");

        // Creating new vote ID from Counters.
        _voteIds.increment();
        uint256 _voteId = _voteIds.current();

        voteInfo[_voteId] = Vote({
            id: _voteId,
            voteTypeId: _voteTypeId,
            timeDuration: _timeDuration,
            initialVotingTimestamp: 0,
            user: msg.sender,
            status: uint(VoteStatus.notActivated)
        });

        // Populate the vote array to hold all valides values.
        s_vote.push(voteInfo[_voteId]);

        emit NewVote(
            _voteId,
            _voteTypeId,
            _timeDuration,
            msg.sender,
            uint(VoteStatus.notActivated)
        );
    }

    // Get All vote inside a single array of struct.
    function getVotes() public view returns (Vote[] memory) {
        return s_vote;
    }

    // Add new voter to make him able to cast vote.
    // When voter is added, his default voteStatus should be 1 or Not voted and, this status will be updated after his vote.
    function setVoter(
        address _voterAddress
    ) public duplicatedVoterAddress(_voterAddress) {
        // Creating new voter ID from Counters.
        _voterIds.increment();
        uint256 _voterId = _voterIds.current();

        voterInfo[_voterId] = Voter({id: _voterId, voter: _voterAddress});

        // Populate the voter array to hold all valides values.
        s_voter.push(voterInfo[_voterId]);
        // Map Voter Address to his ID
        voterValidsAddress[_voterAddress] = _voterId;

        emit NewVoter(_voterId, _voterAddress);
    }

    // Update voter's existing address in case of losing access of his wallet.
    // The limitation has restriscted to three times only.
    function updateVoter(
        address _oldVoterAddress,
        address _newVoterAddress
    ) public duplicatedVoterAddress(_newVoterAddress) {
        // Get voterId from mapping.
        uint256 _voterId = voterValidsAddress[_oldVoterAddress];
        uint _currentVoterUpdateNumber = numberOfAllowedUpdatingVoterAddress[
            _voterId
        ];
        // Check if the total number of allowed address modification (3) has rechead or not
        require(
            _currentVoterUpdateNumber >= 0 && _currentVoterUpdateNumber <= 2,
            "Update restrict to 3 times."
        );

        // Update voter's address
        s_voter[_voterId - 1].voter = _newVoterAddress;
        voterValidsAddress[_newVoterAddress] = _voterId;
        _currentVoterUpdateNumber += 1;
        numberOfAllowedUpdatingVoterAddress[
            _voterId
        ] = _currentVoterUpdateNumber;

        emit UpdateVoter(_voterId, _newVoterAddress);
    }

    // Change the vote process Status to allow voter to cast vote
    function activateVote(uint256 _voteId) public voteClosed(_voteId) {
        // This require avoid to loop throught Vote Array struct even if his status is already activated
        require(
            voteInfo[_voteId].status != uint(VoteStatus.activated),
            "Vote already activated or not valid."
        );

        // Update the status of vote
        voteInfo[_voteId].status = s_vote[_voteId - 1].status = uint(
            VoteStatus.activated
        ); // Into the mapping and the array of struct
        // Once the vote is activated, the time lock should be start
        s_vote[_voteId - 1].initialVotingTimestamp = block.timestamp;
        voteInfo[_voteId].initialVotingTimestamp = block.timestamp;
    }

    // When the time limit is reached, this function locks the voting process automatically.
    // This function will be executed each time after voter vote
    function closeVotingProcess(uint256 _voteId) private {
        if (
            computeVoteTimeDuration(voteInfo[_voteId].initialVotingTimestamp) >=
            voteInfo[_voteId].timeDuration
        ) {
            voteInfo[_voteId].status = s_vote[_voteId].status = uint(
                VoteStatus.closed
            );
        }
    }

    // Get All voter inside a single array of struct.
    function getVoters() public view returns (Voter[] memory) {
        return s_voter;
    }

    // Get vote process Status (Active = true, Non active = false).
    function getVoteStatus(uint256 _voteId) public view returns (uint) {
        return uint(voteInfo[_voteId].status);
    }

    // Calculate the timeduration (In hours) from the current timestamp to an expected one
    function computeVoteTimeDuration(
        uint256 _initialTimestamp
    ) private view returns (uint) {
        // return (block.timestamp - _initialTimestamp) / (60) Min // => (60) Min, (60 * 60) H, (60 * 60 * 24) Day
        return (block.timestamp - _initialTimestamp) / (60);
    }

    // Get the remaining time for a vote to be closed or notify expired time
    // Return remaining voting time in hours.
    function getVotingTimeElapse(
        uint256 _voteId
    ) public view returns (uint, string memory) {
        if (
            computeVoteTimeDuration(voteInfo[_voteId].initialVotingTimestamp) <=
            voteInfo[_voteId].timeDuration
        ) {
            return (
                computeVoteTimeDuration(
                    voteInfo[_voteId].initialVotingTimestamp
                ),
                "Voting still going on..."
            );
        } else {
            return (0, "Voting time expired.");
        }
    }

    // Add new candidate.
    function setCandidate(
        uint _orderNumber,
        string calldata _fullName,
        string calldata _pictureURI
    ) public pictureUriExist(_pictureURI) {
        // Check than the string is not null.
        require(
            bytes(_fullName).length != 0 && bytes(_pictureURI).length != 0,
            "Invalid full name or picture URI."
        );

        // Creating new candidate ID from Counters.
        _candidateIds.increment();
        uint256 _candidateId = _candidateIds.current();

        candidateInfo[_candidateId] = Candidate({
            id: _candidateId,
            orderNumber: _orderNumber,
            fullname: _fullName,
            pictureURI: _pictureURI,
            user: msg.sender
        });

        // Populate the voter array to hold all valides values.
        s_candidate.push(candidateInfo[_candidateId]);

        emit NewCandidate(
            _candidateId,
            _orderNumber,
            _fullName,
            _pictureURI,
            msg.sender
        );
    }

    // Add all candidates to be valid for a specific vote.
    // Vote should not be closed and notyet activated, then candidates should be valid.
    function registerCandidateForVote(
        uint256 _voteId,
        uint256[] memory _arrCandidateIds
    )
        public
        voteClosed(_voteId) // Vote should not be closed
    {
        require(
            voteInfo[_voteId].status != uint(VoteStatus.activated),
            "Not available once vote is activated."
        );
        require(_arrCandidateIds.length > 0, "Invalid candidates.");

        uint size = _arrCandidateIds.length;
        // Loop to check if all candidateId are valids
        for (uint i = 0; i < size; i++) {
            if (_arrCandidateIds[i] != candidateInfo[_arrCandidateIds[i]].id) {
                revert CandidateNotFound();
            }
        }
        // Register all candidates
        validsCandidateForVote[_voteId] = _arrCandidateIds;

        emit RegisterCandidateForVote(_voteId, _arrCandidateIds);
    }

    // Return all candidate ID register for a selected vote
    function getRegisterCandidateForVote(
        uint256 voteId
    ) public view returns (uint[] memory) {
        return validsCandidateForVote[voteId];
    }

    // Get All candidate inside a single array of struct.
    function getCandidates() public view returns (Candidate[] memory) {
        return s_candidate;
    }

    // Cast vote for voter
    function castVote(
        uint256 _voteId,
        uint _voteTypeId,
        uint256 _votingOfficeId,
        uint256 _candidateId,
        uint256 _voterId,
        // voted = 1 and blank = 2.
        uint256 _voterStatus
    ) public isCandidateRegisterForVote(_voteId, _candidateId) {
        // Revert if the vote is already closed.
        if (voteInfo[_voteId].status == uint(VoteStatus.closed)) {
            revert VoteAlreadyClosed();
        }
        // The vote should be activated to allow voter votes.
        require(
            voteInfo[_voteId].status == uint(VoteStatus.activated),
            "The vote is not yet activated."
        );
        // The voter shoul exist
        require(voterInfo[_voterId].id == _voterId, "The voter is not found.");
        // The voterStatus should be valid: 0 for voted and 2 for blank
        require(
            _voterStatus == 1 || _voterStatus == 2,
            "Invalid voter status: Use 1 = voted or 2 = blank."
        );

        // Execute closeVote depending on the time duration before voting.
        closeVotingProcess(_voteId);
        // Revert if the voter has already cast his vote.
        if (
            ballotBoxVoterStatus[_voteId][_voterId] ==
            uint(VotedStatus.voted) ||
            ballotBoxVoterStatus[_voteId][_voterId] == uint(VotedStatus.blank)
        ) {
            revert VoterHasAlreadyCastVote();
        }

        // Increment BallotBox Id from Counters
        _ballotBoxIds.increment();
        uint256 _ballotBoxId = _ballotBoxIds.current();

        // Update vote counting once voter vote is valid (even if blank).
        if (_voterStatus == uint(VotedStatus.voted)) {
            totalCandidateVotesCast[_voteId][_candidateId] += 1; // Vote cast for the choosen candidate.
            totalVotingVoteCast[_voteId] += 1;
        } else if (_voterStatus == uint(VotedStatus.blank)) {
            totalVotingVoteCastBlank[_voteId] += 1; // Blank vote casted.
        }

        ballotBoxInfo[_ballotBoxId] = BallotBox({
            id: _ballotBoxId,
            voteId: _voteId,
            voteTypeId: _voteTypeId,
            votingOfficeId: _votingOfficeId,
            candidateId: _candidateId,
            voterId: _voterId,
            voterVoteStatus: _voterStatus
        });

        ballotBoxVoterStatus[_voteId][_voterId] = _voterStatus;
        // Populate the ballotBox array to hold all valides values.
        s_ballotBox.push(ballotBoxInfo[_ballotBoxId]);

        emit CastedVote(
            _ballotBoxId,
            _voteId,
            _candidateId,
            voterInfo[_voterId].voter,
            _votingOfficeId,
            _voterStatus
        );
    }

    // Get All ballotBox inside a single array of struct.
    function getBallotBoxes()
        public
        view
        onlyOwner
        returns (BallotBox[] memory)
    {
        return s_ballotBox;
    }

    // Get the total number of casted votes, also represente the number of voters.
    function getTotalVotingVoteCast(
        uint256 _voteId
    ) public view returns (uint256) {
        return totalVotingVoteCast[_voteId] + totalVotingVoteCastBlank[_voteId];
    }

    // Get the total number of blank casted votes.
    function getTotalBlankVotingVoteCast(
        uint256 _voteId
    ) public view returns (uint256) {
        return totalVotingVoteCastBlank[_voteId];
    }

    // Get Candidate owned vote for a specifique vote (Vote ID)
    function getCandidateVoteCast(
        uint256 _voteId,
        uint256 _candidateId
    ) public view returns (uint256) {
        return totalCandidateVotesCast[_voteId][_candidateId];
    }

    // Get Candidate owned vote percentage for a specifique vote (Vote ID)
    function getCandidatePercentageVoteCast(
        uint256 _voteId,
        uint256 _candidateId
    ) public view returns (string memory) {
        return
            divide(
                (totalCandidateVotesCast[_voteId][_candidateId] * 100),
                getTotalVotingVoteCast(_voteId)
            );
    }

    // Get blank vote percentage for a specifique vote (Vote ID)
    function getBlankPercentageVoteCast(
        uint256 _voteId
    ) public view returns (string memory) {
        return
            divide(
                (totalVotingVoteCastBlank[_voteId] * 100),
                getTotalVotingVoteCast(_voteId)
            );
    }

    // Handle proper division with decimal part (2 Decimals)
    function divide(
        uint256 numerator,
        uint256 denominator
    ) public pure returns (string memory result) {
        uint256 factor = 10 ** 2;
        uint256 quotient = numerator / denominator;
        bool rounding = 2 * ((numerator * factor) % denominator) >= denominator;
        uint256 remainder = ((numerator * factor) / denominator) % factor;
        if (rounding) {
            remainder += 1;
        }
        result = string(
            abi.encodePacked(
                quotient.toString(),
                ".",
                numToFixedLengthStr(2, remainder)
            )
        );
    }

    function numToFixedLengthStr(
        uint256 decimalPlaces,
        uint256 num
    ) internal pure returns (string memory result) {
        bytes memory byteString;
        for (uint256 i = 0; i < decimalPlaces; i++) {
            uint256 remainder = num % 10;
            byteString = abi.encodePacked(remainder.toString(), byteString);
            num = num / 10;
        }
        result = string(byteString);
    }

    // Compute voting result to be shown to the user
    function getVoteResults(
        uint256 _voteId
    ) public view returns (VoteResults[] memory) {
        uint256[] memory candidateVoteIds = validsCandidateForVote[_voteId];
        uint256 size = validsCandidateForVote[_voteId].length;
        VoteResults[] memory s_voteResults = new VoteResults[](size); // Initializing new array of struct

        for (uint i = 0; i < size; i++) {
            uint256 _candidateId = candidateVoteIds[i];

            uint256 _votesCast = getCandidateVoteCast(_voteId, _candidateId);
            uint256 _voteBlank = getTotalBlankVotingVoteCast(_voteId);
            string memory _candidatePercentage = getCandidatePercentageVoteCast(
                _voteId,
                _candidateId
            );
            string memory _blankPercentage = getBlankPercentageVoteCast(
                _voteId
            );

            s_voteResults[i] = (
                VoteResults({
                    voteId: _voteId,
                    candidateId: _candidateId,
                    candidateNumber: candidateInfo[candidateVoteIds[i]]
                        .orderNumber,
                    candidateFullName: candidateInfo[candidateVoteIds[i]]
                        .fullname,
                    votesCast: _votesCast,
                    votesBlank: _voteBlank,
                    candidatePercentage: _candidatePercentage,
                    blankPercentage: _blankPercentage
                })
            );
        }

        return s_voteResults;
    }
}
